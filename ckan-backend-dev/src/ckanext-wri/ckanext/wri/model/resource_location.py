# encoding: utf-8

import sqlalchemy
import ckan.model.meta as meta
import ckan.model.types as _types
from typing import Optional
from ckan.lib.dictization import table_dictize
from ckan.types import Context
from typing import Any, Iterable, Optional
from sqlalchemy import update
from geoalchemy2 import Geometry
import geoalchemy2
from geoalchemy2.shape import from_shape
import logging
from ckanext.wri.search import SolrSpatialFieldSearchBackend
from shapely.ops import unary_union 
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
)


class ResourceLocation(object):
    '''New fields for handling spatial indexing for resources'''
    id: str
    resource_id: str
    spatial_address: str
    spatial_geom: dict  # TODO: should this be a dict?

    def __init__(self, resource_id: str, spatial_address: str,
                 spatial_geom: dict) -> None:
        self.resource_id = resource_id
        self.spatial_address = spatial_address
        self.sptial_geom = spatial_geom

    @classmethod
    def get(cls, resource_id: str) -> Optional['ResourceLocation']:
        '''Return the ResourceLocation object for the given resource_id.
        '''
        query = meta.Session.query(ResourceLocation)

        query = query.filter(ResourceLocation.resource_id == resource_id)

        return query.first()

    @classmethod
    def create(
        cls,
        resource_id,
        spatial_address,
        spatial_geom
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
                                                 spatial_geom)
            meta.Session.add(resource_location)
            meta.Session.commit()
            return {
                "resource_id": resource_location.resource_id,
                "spatial_address": resource_location.spatial_address,
                "spatial_geom": resource_location.spatial_geom,
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
        spatial_geom
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
                .where(ResourceLocation.resource_id == resource_id)
                .values(
                    spatial_address=spatial_address,
                    spatial_geom=spatial_geom
                )
                .returning(ResourceLocation)
            )

            result = meta.Session.execute(stmt)
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
