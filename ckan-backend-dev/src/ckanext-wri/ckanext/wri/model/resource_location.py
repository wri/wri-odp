# encoding: utf-8

import ckan.model.meta as meta
import ckan.model.types as _types
import ckan.plugins.toolkit as tk
from ckan.model.resource import Resource
from ckan.lib.dictization import table_dictize
from ckan.types import Context
from ckan.common import _

from typing import Any, Iterable, Optional
import sqlalchemy
from sqlalchemy import update
import geoalchemy2
import geoalchemy2.functions as geo_funcs
from geoalchemy2 import Geometry

from shapely.ops import unary_union

import shapely
import json
import logging

log = logging.getLogger(__name__)


resource_location = sqlalchemy.Table(
    "resource_location",
    meta.metadata,
    sqlalchemy.Column(
        "id", sqlalchemy.types.UnicodeText, primary_key=True, default=_types.make_uuid
    ),
    sqlalchemy.Column(
        "resource_id",
        sqlalchemy.types.UnicodeText,
        sqlalchemy.ForeignKey("resource.id", onupdate="CASCADE", ondelete="CASCADE"),
        nullable=False,
    ),
    sqlalchemy.Column("spatial_address", sqlalchemy.types.UnicodeText, nullable=True),
    sqlalchemy.Column("spatial_coordinates", Geometry("POINT"), nullable=True),
    sqlalchemy.Column("spatial_geom", Geometry("GEOMETRY"), nullable=True),
    sqlalchemy.Column("is_pending", sqlalchemy.types.Boolean, nullable=True),
)


class ResourceLocation(object):
    """New fields for handling spatial indexing for resources"""

    id: str
    resource_id: str
    spatial_address: str
    spatial_coordinates: dict
    spatial_geom: dict  # TODO: should this be a dict?
    is_pending: bool

    def __init__(
        self,
        resource_id: str,
        spatial_address: str,
        spatial_geom: dict,
        is_pending: bool,
        spatial_coordinates: dict,
    ) -> None:
        self.resource_id = resource_id
        self.spatial_address = spatial_address
        self.spatial_coordinates = spatial_coordinates
        self.spatial_geom = spatial_geom
        self.is_pending = is_pending

    @classmethod
    def get(cls, resource_id: str, is_pending: bool) -> Optional["ResourceLocation"]:
        """Return the ResourceLocation object for the given resource_id."""
        query = meta.Session.query(
            ResourceLocation.resource_id,
            ResourceLocation.spatial_address,
            geo_funcs.ST_AsGeoJSON(ResourceLocation.spatial_geom).label("spatial_geom"),
            geo_funcs.ST_AsGeoJSON(ResourceLocation.spatial_coordinates).label(
                "spatial_coordinates"
            ),
        )

        query = query.filter(ResourceLocation.resource_id == resource_id).filter(
            ResourceLocation.is_pending == is_pending
        )

        result = query.first()

        if result is not None:
            obj = {
                "resource_id": result[0],
                "spatial_addess": result[1],
                "spatial_geom": result[2],
                "spatial_coordinates": result[3],
            }

            return obj

        return None

    @classmethod
    def create(
        cls,
        resource_id,
        spatial_address,
        spatial_geom,
        spatial_coordinates,
        is_pending,
    ) -> Optional[dict]:
        try:
            _spatial_coordinates = None
            if spatial_coordinates:
                _spatial_coordinates = (
                    f"POINT({spatial_coordinates[0]} {spatial_coordinates[1]})"
                )
            spatial_geom = ResourceLocation.get_geometry_from_geojson(spatial_geom)
            resource_location = ResourceLocation(
                resource_id,
                spatial_address,
                spatial_geom,
                is_pending,
                spatial_coordinates=_spatial_coordinates,
            )
            meta.Session.add(resource_location)
            meta.Session.commit()
            return {
                "resource_id": resource_location.resource_id,
                "spatial_address": resource_location.spatial_address,
                "spatial_geom": resource_location.spatial_geom,
                "is_pending": resource_location.is_pending,
                "spatial_coordinates": resource_location.spatial_coordinates,
            }
        except Exception as e:
            log.error(e)
            meta.Session.rollback()
            raise

    @classmethod
    def update(
        cls, resource_id, spatial_address, spatial_geom, spatial_coordinates, is_pending
    ) -> Optional["ResourceLocation"]:
        try:
            spatial_geom = ResourceLocation.get_geometry_from_geojson(spatial_geom)
            _spatial_coordinates = None
            if spatial_coordinates:
                _spatial_coordinates = (
                    f"POINT({spatial_coordinates[0]} {spatial_coordinates[1]})"
                )

            stmt = (
                update(ResourceLocation)
                .where(
                    ResourceLocation.resource_id == resource_id,
                    ResourceLocation.is_pending == is_pending,
                )
                .values(
                    spatial_address=spatial_address,
                    spatial_geom=spatial_geom,
                    spatial_coordinates=_spatial_coordinates,
                )
                .returning(ResourceLocation)
            )

            result = meta.Session.execute(stmt)

            resource = Resource.get(resource_id)
            extras = resource.get("extras")

            if extras:
                extras.pop("spatial_geom")
                extras.pop("spatial_coordinates")

            # TODO: this breaks the approval workflow, but would reduce the
            # overall database size
            # geom_cleanup = update(Resource).where(
            #         Resource.id == resource_id).values(extras=extras)
            #
            # meta.Session.execute(geom_cleanup)

            meta.Session.commit()
            return result.fetchall()
        except Exception as e:
            log.error(e)
            meta.Session.rollback()
            raise e

    @classmethod
    def get_geometry_from_geojson(self, spatial_geom):
        if spatial_geom:
            geometries = []

            if spatial_geom["type"] == "GeometryCollection":
                geometries = spatial_geom["geometries"]
            elif spatial_geom["type"] == "FeatureCollection":
                geometries = [x["geometry"] for x in spatial_geom["features"]]
            else:
                geometries = [spatial_geom["geometry"]]

            valid_geometries = []
            for geom in geometries:
                json_str = json.dumps(geom)
                shape = shapely.from_geojson(json_str)
                if shape.is_valid:
                    valid_geometries.append(shape)

            merged_geometry = unary_union(valid_geometries)
            spatial_geom = geoalchemy2.functions.ST_GeomFromText(merged_geometry.wkt)

        return spatial_geom

    @classmethod
    def index_resource_by_location(self, resource_dict: dict[str, Any], is_pending):
        resource_id = resource_dict.get("id")
        spatial_address = resource_dict.get("spatial_address")
        spatial_geom = resource_dict.get("spatial_geom")
        spatial_coordinates = resource_dict.get("spatial_coordinates")

        if not resource_id:
            raise tk.ValidationError(_("resource_id is required"))

        log.info("Indexing resource by location: {} {}".format(resource_id, is_pending))

        current_resource_location = ResourceLocation.get(
            resource_id, is_pending=is_pending
        )

        resource_location = None

        try:
            if current_resource_location is None:
                resource_location = ResourceLocation.create(
                    resource_id,
                    spatial_address,
                    spatial_geom,
                    spatial_coordinates,
                    is_pending=is_pending,
                )

            else:
                resource_location = ResourceLocation.update(
                    resource_id,
                    spatial_address,
                    spatial_geom,
                    spatial_coordinates,
                    is_pending=is_pending,
                )
        except Exception as e:
            log.error(e)
            raise tk.ValidationError(e)

        if not resource_location:

            raise tk.ValidationError(_(f"Resource Location not found: {resource_id}"))

        log.info("Updated resource location index: {}".format(resource_id))

        resource_dict.pop("spatial_geom", None)
        resource_dict.pop("spatial_coordinates", None)
        resource_dict.pop("spatial_address", None)

        return resource_dict

    @classmethod
    def index_dataset_resources_by_location(self, dataset, is_pending):
        resources = dataset.get("resources", [])

        for i, resource in enumerate(resources):
            resources[i] = ResourceLocation.index_resource_by_location(
                resource, is_pending
            )

        dataset["resources"] = resources
        return dataset


def resource_location_dictize(
    resource_location: ResourceLocation, context: Context
) -> dict[str, Any]:
    return table_dictize(resource_location, context)


#  TODO: likely not needed
def resource_location_list_dictize(
    resource_location_list: Iterable[ResourceLocation], context: Context
) -> list[dict[str, Any]]:
    return [
        resource_location_dictize(resource_location, context)
        for resource_location in resource_location_list
    ]


meta.mapper(ResourceLocation, resource_location)
