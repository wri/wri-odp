from datetime import datetime
from typing import Any, Optional
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
    fileBlob: Optional[Any]
    key: Optional[str]
    last_modified: Any
    layerObj: Optional[Any]
    layerObjRaw: Optional[Any]
    position: Optional[Any]
    resourceId: Optional[str]
    schema: Optional[Any]
    size: Optional[int]
    state: Optional[str]
    title: Optional[str]
    type: Any
    url: Any
    url_type: Any
    cache_last_updated: Optional[str]
    cache_url: Optional[str]
    created: str
    datastore_active: bool
    description: Optional[str]
    format: Optional[str]
    hash: str
    id: str
    last_modified: Optional[str]
    metadata_modified: str
    mimetype: Optional[str]
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
    author: Optional[str]
    author_email: Optional[str]
    citation: Optional[str]
    creator_user_id: str
    featured_dataset: bool
    featured_image: Optional[str]
    id: str
    isopen: bool
    license_id: Optional[str]
    license_title: Optional[str]
    maintainer: Optional[str]
    maintainer_email: Optional[str]
    metadata_created: str
    metadata_modified: Optional[str]
    name: str
    num_resources: int
    num_tags: int
    organization: Optional[Organization]
    owner_org: Optional[str]
    private: bool
    project: Optional[str]
    rw_dataset: bool
    rw_id: Optional[str]
    short_description: Optional[str]
    spatial: Optional[str]
    state: Optional[str]
    technical_notes: Optional[str]
    title: Optional[str]
    type: str
    update_frequency: Optional[str]
    url: Optional[str]
    version: Optional[str]
    visibility_type: Optional[str]
    wri_data: bool
    resources: Optional[list[Resource]]
