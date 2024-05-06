import logging
from typing import Optional
import sqlalchemy
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB
from ckanext.wri.model.resource_location import ResourceLocation

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
    def get(cls, package_id: str) -> Optional[dict]:
        try:
            pending_dataset = (
                meta.Session.query(PendingDatasets)
                .filter(PendingDatasets.package_id == package_id)
                .one()
            )
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
            pending_dataset = PendingDatasets(package_id, package_data)
            meta.Session.add(pending_dataset)
            meta.Session.commit()

            package_data = ResourceLocation.index_dataset_resources_by_location(package_data, True)

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
                pending_dataset.package_data = package_data
                meta.Session.commit()

                package_data = ResourceLocation.index_dataset_resources_by_location(package_data, True)

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
