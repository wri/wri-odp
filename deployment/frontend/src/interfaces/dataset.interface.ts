import { DataDictionaryFormType } from '@/schema/dataset.schema'
import { Activity, Group, Organization } from '@portaljs/ckan'
import { APILayerSpec } from './layer.interface'
import { PlotParams } from 'react-plotly.js'

export interface Dataset {
    author?: string
    author_email?: string
    creator_user_id?: string
    id: string
    isopen?: boolean
    license_id?: string
    license_title?: string
    maintainer?: string
    maintainer_email?: string
    metadata_created?: string
    metadata_modified?: string
    name: string
    notes?: string
    num_resources: number
    num_tags: number
    owner_org?: string
    private?: boolean
    state?: 'active' | 'inactive' | 'deleted'
    title?: string
    type?: 'dataset'
    url?: string
    version?: string
    activity_stream?: Array<Activity>
    resources: Array<Resource>
    organization?: Organization
    groups?: Array<Group>
    tags?: Array<Tag>
    total_downloads?: number
    visibility_type?: string
}

export interface Resource {
    cache_last_updated?: string
    cache_url?: string
    created?: string
    datastore_active?: boolean | null
    description?: string
    format?: string
    hash?: string
    id: string
    last_modified?: string
    metadata_modified?: string
    mimetype?: string
    mimetype_inner?: string
    name?: string
    package_id?: string
    title: string
    position?: number
    resource_type?: null
    size?: number
    state?: 'active' | 'inactive' | 'deleted'
    url?: string
    url_type?: string
    key?: string
    schema?: { value: DataDictionaryFormType }
    rw_id?: string
    layerObjRaw: APILayerSpec | null
    layerObj: APILayerSpec | null
    connectorType?: string
    connectorUrl?: string
    provider?: string
    tableName?: string
    type: 'link' | 'upload' | 'layer' | 'empty' | 'layer-raw'
    _hasChartView?: boolean
    _views?: View[]
    total_record_count?: number
}

export interface DatasetListQueryOptions {
    offset: number
    limit: number
}
export interface PackageSearchOptions {
    offset: number
    limit: number
    groups: Array<string>
    orgs: Array<string>
    tags: Array<string>
    query?: string
    resFormat?: Array<string>
    sort?: string
    include_private?: boolean
}

export interface Tag {
    display_name?: string
    id: string
    name: string
    state: 'active'
    vocabulary_id?: string
}

export interface View {
    id?: string
    title: string
    description: string
    view_type: 'custom'
    config_obj: ViewConfig
}

export type ViewType = 'chart'

export type ViewConfig = {
    type: ViewType
    config: ChartViewConfig
    form_state: any /* | OtherViewConfig ... */
}

export interface ChartViewConfig {
    provider: 'datastore' | 'rw'
    id: string
    props: PlotParams
}

export type ViewState = View & { _state: 'new' | 'saved' | 'edit'; _id: number }
