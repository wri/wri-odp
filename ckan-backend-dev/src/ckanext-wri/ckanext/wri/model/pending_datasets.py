import logging
from typing import Optional
import sqlalchemy
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB
from ckanext.wri.model.resource_location import ResourceLocation
import json 

import ckan.model.meta as meta
from ckan.common import _


log = logging.getLogger(__name__)


pending_datasets = sqlalchemy.Table(
    "pending_datasets",
    meta.metadata,
    sqlalchemy.Column("package_id", sqlalchemy.types.UnicodeText, primary_key=True),
    sqlalchemy.Column("package_data", JSONB, nullable=False),
    sqlalchemy.Column(
        "last_modified",
        sqlalchemy.types.DateTime,
        default=func.now(),
        onupdate=func.now(),
    ),
)


class PendingDatasets(object):
    """Manage pending datasets"""

    def __init__(self, package_id: str, package_data: dict) -> None:
        self.package_id = package_id
        self.package_data = package_data
        self.last_modified = None

    @classmethod
    def get(cls, package_id: str, include_rsc_location: bool = True) -> Optional[dict]:

        try:
            pending_dataset = (
                meta.Session.query(PendingDatasets)
                .filter(PendingDatasets.package_id == package_id)
                .one()
            )

            if include_rsc_location:
                resources = pending_dataset.package_data.get("resources", [])
                for i, res in enumerate(resources):
                    res_id = res.get("id")
                    resource_location = ResourceLocation.get(res_id, is_pending=True)

                    if resource_location is not None:
                        spatial_address = resource_location.get("spatial_address", None)
                        if spatial_address is not None:
                            resources[i]["spatial_address"] = spatial_address

                        spatial_geom = resource_location.get("spatial_geom", None)
                        if spatial_geom is not None:
                            if isinstance(spatial_geom, str):
                                resources[i]["spatial_geom"] = json.loads(spatial_geom)
                            else:
                                resources[i]["spatial_geom"] = spatial_geom

                        spatial_coordinates = resource_location.get("spatial_coordinates", None)
                        if spatial_coordinates is not None:
                            resources[i]["spatial_coordinates"] = spatial_coordinates

            return {
                "package_id": pending_dataset.package_id,
                "package_data": pending_dataset.package_data,
                "last_modified": pending_dataset.last_modified,
            }
        except Exception as e:
            log.error(e)

    @classmethod
    def create(
        cls,
        package_id: str,
        package_data: dict,
    ) -> Optional[dict]:
        try:
            package_data = ResourceLocation.index_dataset_resources_by_location(package_data, True)
            pending_dataset = PendingDatasets(package_id, package_data)
            meta.Session.add(pending_dataset)
            meta.Session.commit()

            return {
                "package_id": pending_dataset.package_id,
                "package_data": package_data,
                "last_modified": pending_dataset.last_modified,
            }
        except Exception as e:
            log.error(e)
            meta.Session.rollback()
            raise

    @classmethod
    def update(
        cls,
        package_id: str,
        package_data: dict,
    ) -> Optional[dict]:
        try:
            pending_dataset = (
                meta.Session.query(PendingDatasets)
                .filter(PendingDatasets.package_id == package_id)
                .one()
            )

            if pending_dataset:
                package_data = ResourceLocation.index_dataset_resources_by_location(package_data, True)
                pending_dataset.package_data = package_data
                meta.Session.commit()

                return {
                    "package_id": pending_dataset.package_id,
                    "package_data": package_data,
                    "last_modified": pending_dataset.last_modified,
                }
            else:
                log.error(_(f"Pending Dataset not found: {package_id}"))
                return

        except Exception as e:
            log.error(e)
            meta.Session.rollback()

    @classmethod
    def delete(cls, package_id: str) -> None:
        try:
            pending_dataset = meta.Session.query(PendingDatasets).filter(
                PendingDatasets.package_id == package_id
            ).one()
            log.error(pending_dataset)
            meta.Session.delete(pending_dataset)
            meta.Session.commit()
            return pending_dataset
        except Exception as e:
            log.error(e)
            meta.Session.rollback()


meta.mapper(PendingDatasets, pending_datasets)
