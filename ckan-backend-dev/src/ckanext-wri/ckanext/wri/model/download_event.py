# encoding: utf-8

import datetime
import sqlalchemy
import ckan.model.meta as meta
import ckan.model.types as _types
from typing import Optional
from typing_extensions import Self
from ckan.types import Context
from typing import Iterable, Optional, Type
from ckan.model.package import Package
from ckan.model.resource import Resource
import logging
log = logging.getLogger(__name__)

from .sql_context import sql_session_scope

download_event = sqlalchemy.Table('download_event', meta.metadata,
    sqlalchemy.Column('id', sqlalchemy.types.UnicodeText,
        primary_key=True, default=_types.make_uuid),
    sqlalchemy.Column('email', sqlalchemy.types.UnicodeText,
        nullable=True),
    sqlalchemy.Column('first_name', sqlalchemy.types.UnicodeText,
        nullable=True),
    sqlalchemy.Column('last_name', sqlalchemy.types.UnicodeText,
        nullable=True),
    sqlalchemy.Column('affiliation', sqlalchemy.types.UnicodeText,
        nullable=True),
    sqlalchemy.Column('organization', sqlalchemy.types.UnicodeText,
        nullable=True),
    sqlalchemy.Column('job_title', sqlalchemy.types.UnicodeText,
        nullable=True),
    sqlalchemy.Column('country', sqlalchemy.types.UnicodeText,
        nullable=True),
    sqlalchemy.Column('interests', sqlalchemy.types.UnicodeText,
        nullable=True),
    sqlalchemy.Column('package', sqlalchemy.types.UnicodeText,
        sqlalchemy.ForeignKey('package.id', onupdate='CASCADE',
            ondelete='CASCADE'),
        nullable=False),
    sqlalchemy.Column('resource_id', sqlalchemy.types.UnicodeText,
        sqlalchemy.ForeignKey('resource.id', onupdate='CASCADE',
            ondelete='CASCADE'),
        nullable=False),
    sqlalchemy.Column('created_at', sqlalchemy.types.DateTime,
        nullable=False, default=datetime.datetime.now(datetime.timezone.utc)),
    sqlalchemy.Column('updated_at', sqlalchemy.types.DateTime,
        nullable=False, default=datetime.datetime.now(datetime.timezone.utc), onupdate=datetime.datetime.now(datetime.timezone.utc))
)

class DownloadEvent(object):
    '''Saved data used for the user's download events.'''
    id: str
    email: str
    first_name: str
    last_name: str
    affiliation: str
    organization: str
    job_title: str
    country: str
    interests: str
    package: str
    resource_id: str
    package_name: Optional[str]
    resource_name: Optional[str]

    def __init__(self, email: str, first_name: str, last_name: str, affiliation: str, organization: str, job_title: str, country: str, interests: str, package: str, resource_id: str):
        self.package_name: Optional[str] = None
        self.resource_name: Optional[str] = None
        self.email = email
        self.first_name = first_name
        self.last_name = last_name
        self.affiliation = affiliation
        self.organization = organization
        self.job_title = job_title
        self.country = country
        self.interests = interests
        self.package = package
        self.resource_id = resource_id

    @classmethod
    def get(cls: Type[Self], id: str) -> Optional[Self]:
        with sql_session_scope() as session:
            return session.query(cls).filter(cls.id == id).first()

    @classmethod
    def get_all(cls: Type[Self]) -> Iterable[Self]:
        with sql_session_scope() as session:
            return session.query(cls).all()

    @classmethod
    def get_by_package(cls: Type[Self], package: str) -> Iterable[Self]:
        with sql_session_scope() as session:
            return session.query(cls).filter(cls.package == package).all()

    @classmethod
    def get_by_resource_id(cls: Type[Self], resource_id: str) -> Iterable[Self]:
        with sql_session_scope() as session:
            return session.query(cls).filter(cls.resource_id == resource_id).all()

    @classmethod
    def create(cls: Type[Self], email: str, first_name: str, last_name: str, affiliation: str, organization: str, job_title: str, country: str, interests: str, package: str, resource_id: str) -> Self:
        download_event = cls(email=email, first_name=first_name, last_name=last_name, affiliation=affiliation, organization=organization, job_title=job_title, country=country, interests=interests, package=package, resource_id=resource_id)
        with sql_session_scope() as session:
            session.add(download_event)
        return download_event

    @classmethod
    def update(cls: Type[Self], id: str, email: str, first_name: str, last_name: str, affiliation: str, organization: str, job_title: str, country: str, interests: str, package: str, resource_id: str) -> Self:
        with sql_session_scope() as session:
            download_event = session.query(cls).filter(cls.id == id).first()
            download_event.email = email
            download_event.first_name = first_name
            download_event.last_name = last_name
            download_event.affiliation = affiliation
            download_event.organization = organization
            download_event.job_title = job_title
            download_event.country = country
            download_event.interests = interests
            download_event.package = package
            download_event.resource_id = resource_id
        return download_event

    @classmethod
    def delete(cls: Type[Self], id: str) -> None:
        with sql_session_scope() as session:
            download_event = session.query(cls).filter(cls.id == id).first()
            session.delete(download_event)

    @classmethod
    def get_by_owner_org(cls: Type[Self], owner_org: str) -> Iterable[Self]:
        """Get all download events for datasets belonging to a specific organization.
        
        Args:
            owner_org: The id of the organization
            
        Returns:
            List of download events for that organization's datasets
        """
        with sql_session_scope() as session:
            query = session.query(
                cls,
                Package.name.label('package_name'),
                Resource.name.label('resource_name')
            )\
                .outerjoin(Package, download_event.c.package == Package.id)\
                .outerjoin(Resource, download_event.c.resource_id == Resource.id)\
                .filter(Package.owner_org == owner_org)
            
            results = query.all()
            
            # Safely attach the package_name and resource_name to each DownloadEvent instance
            for result in results:
                download_event_obj = result[0]
                try:
                    download_event_obj.package_name = result[1] if result[1] is not None else "Unknown"
                    download_event_obj.resource_name = result[2] if result[2] is not None else "Unknown"
                except Exception as e:
                    log.warning(f"Error attaching names to download event: {e}")
                    download_event_obj.package_name = "Unknown"
                    download_event_obj.resource_name = "Unknown"
            
            return [result[0] for result in results]

    def as_dict(self) -> dict:
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'affiliation': self.affiliation,
            'organization': self.organization,
            'job_title': self.job_title,
            'country': self.country,
            'interests': self.interests,
            'package': self.package,
            'package_name': self.package_name if hasattr(self, 'package_name') else 'Not specified',
            'resource_id': self.resource_id,
            'resource_name': self.resource_name if hasattr(self, 'resource_name') else 'Not specified',
        }
    
def download_event_dictize(download_event: DownloadEvent, context: Context) -> dict:
    return download_event.as_dict()

def download_event_list_dictize(download_event_list: Iterable[DownloadEvent], context: Context) -> list[dict]:
    return [download_event.as_dict() for download_event in download_event_list]

meta.mapper(DownloadEvent, download_event)
