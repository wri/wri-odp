# encoding: utf-8

import sqlalchemy
import ckan.model.meta as meta
import ckan.model.types as _types
from typing import Optional
from ckan.lib.dictization import table_dictize
from ckan.types import Context
from typing import Any, Iterable, Optional
from sqlalchemy import update, func, select
from geoalchemy2 import Geometry
import geoalchemy2
from geoalchemy2.shape import from_shape
import logging
from ckanext.wri.search import SolrSpatialFieldSearchBackend
from shapely.ops import unary_union 
from ckan.model.resource import Resource
import shapely

import json
log = logging.getLogger(__name__)


resource_location = sqlalchemy.Table('resource_location', meta.metadata,
    sqlalchemy.Column('id', sqlalchemy.types.UnicodeText,
        primary_key=True, default=_types.make_uuid),
    sqlalchemy.Column('resource_id', sqlalchemy.types.UnicodeText,
        sqlalchemy.ForeignKey('resource.id', onupdate='CASCADE',
            ondelete='CASCADE'),
        nullable=False),
    sqlalchemy.Column('spatial_address', sqlalchemy.types.UnicodeText,
        nullable=True),
    sqlalchemy.Column('spatial_geom', Geometry("GEOMETRY"),
        nullable=True),
    sqlalchemy.Column('is_pending', sqlalchemy.types.Boolean,
        nullable=True),
)


class ResourceLocation(object):
    '''New fields for handling spatial indexing for resources'''
    id: str
    resource_id: str
    spatial_address: str
    spatial_geom: dict  # TODO: should this be a dict?
    is_pending: bool

    def __init__(self, resource_id: str, spatial_address: str,
                 spatial_geom: dict, is_pending: bool) -> None:
        self.resource_id = resource_id
        self.spatial_address = spatial_address
        self.spatial_geom = spatial_geom
        self.is_pending = is_pending 

    @classmethod
    def get(cls, resource_id: str, is_pending: bool) -> Optional['ResourceLocation']:
        '''Return the ResourceLocation object for the given resource_id.
        '''
        query = meta.Session.query(
                ResourceLocation.resource_id,
                ResourceLocation.spatial_address,
                sqlalchemy.func.ST_AsGeoJSON(ResourceLocation.spatial_geom)
                    .label("spatial_geom"))

        query = query.filter(ResourceLocation.resource_id == resource_id).filter(ResourceLocation.is_pending == is_pending)

        result = query.first()

        if result is not None:
            obj = {
                    "resource_id": result[0],
                    "spatial_addess": result[1],
                    "spatial_geom": result[2],
                    }

            return obj

        return None

    @classmethod
    def create(
        cls,
        resource_id,
        spatial_address,
        spatial_geom,
        is_pending
    ) -> Optional[dict]:
        try:
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

            resource_location = ResourceLocation(resource_id, spatial_address,
                                                 spatial_geom, is_pending)
            meta.Session.add(resource_location)
            meta.Session.commit()
            return {
                "resource_id": resource_location.resource_id,
                "spatial_address": resource_location.spatial_address,
                "spatial_geom": resource_location.spatial_geom,
                "is_pending": resource_location.is_pending,
            }
        except Exception as e:
            log.error(e)
            meta.Session.rollback()
            raise

    @classmethod
    def update(
        cls,
        resource_id,
        spatial_address,
        spatial_geom,
        is_pending
    ) -> Optional['ResourceLocation']:
        try:
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

            stmt = (
                update(ResourceLocation)
                .where(ResourceLocation.resource_id == resource_id and ResourceLocation.is_pending == is_pending)
                .values(
                    spatial_address=spatial_address,
                    spatial_geom=spatial_geom,
                )
                .returning(ResourceLocation)
            )

            result = meta.Session.execute(stmt)

            resource = Resource.get(resource_id)
            extras = resource.get("extras")

            if extras:
                extras.pop("spatial_geom")

            geom_cleanup = update(Resource).where(Resource.id == resource_id).values(
                    extras=extras)

            meta.Session.execute(geom_cleanup)

            meta.Session.commit()
            return result.fetchall()
        except Exception as e:
            log.error(e)
            meta.Session.rollback()
            raise e


def resource_location_dictize(resource_location: ResourceLocation,
                              context: Context) -> dict[str, Any]:
    return table_dictize(resource_location, context)


#  TODO: likely not needed
def resource_location_list_dictize(
    resource_location_list: Iterable[ResourceLocation], context: Context
) -> list[dict[str, Any]]:
    return [resource_location_dictize(resource_location, context) for
            resource_location in resource_location_list]


meta.mapper(ResourceLocation, resource_location)
