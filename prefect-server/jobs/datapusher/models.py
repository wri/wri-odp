from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator
from pydantic_core import Url

class GetResource(BaseModel):
    resource_id: str
    ckan_url: str
    api_key: str

class Organization(BaseModel):
    id: str
    name: str
    title: Optional[str]
    type: str
    description: Optional[str]
    image_url: Optional[str]
    created: str
    is_organization: bool
    approval_status: str 
    state: str 

class Resource(BaseModel):
    cache_last_updated: Optional[str]
    cache_url: Optional[str]
    created: str
    datastore_active: bool
    description: str
    format: str
    hash: str
    id: str
    last_modified: str
    metadata_modified: str
    mimetype: str
    mimetype_inner: Optional[str]
    name: str
    package_id: str
    position: int
    resource_type: Optional[str]
    size: int
    state: str
    url: str
    url_type: str
    hash: Optional[str]

    @field_validator('format')
    @classmethod
    def convert_to_upper(cls, v: str) -> str:
        return v.upper()

class Package(BaseModel):
    application: Optional[str]
    author: str
    author_email: str
    citation: str
    creator_user_id: str
    featured_dataset: bool
    featured_image: str
    id: str
    isopen: bool
    license_id: str
    license_title: str
    maintainer: str
    maintainer_email: str
    metadata_created: str
    metadata_modified: str
    name: str
    num_resources: int
    num_tags: int
    organization: Optional[Organization]
    owner_org: Optional[str]
    private: bool
    project: str
    rw_dataset: bool
    rw_id: str
    short_description: str
    spatial: str
    state: str
    technical_notes: str
    title: str
    type: str
    update_frequency: str
    url: str
    version: Optional[str]
    visibility_type: str
    wri_data: bool
    resources: Optional[list[Resource]]
