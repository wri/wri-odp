import { type DataDictionaryFormType } from '@/schema/dataset.schema';
import { type Activity, type Group } from '@portaljs/ckan';
import { type Organization } from '@/schema/ckan.schema';
import { type APILayerSpec } from './layer.interface';
import { type PlotParams } from 'react-plotly.js';

export interface Dataset {
    author?: string;
    authors?: Array<{ name: string; email: string }>;
    author_email?: string;
    creator_user_id?: string;
    id: string;
    isopen?: boolean;
    license_id?: string;
    license_title?: string;
    license_url?: string;
    maintainer?: string;
    maintainers?: Array<{ name: string; email: string }>;
    maintainer_email?: string;
    metadata_created?: string;
    metadata_modified?: string;
    name: string;
    notes?: string;
    num_resources: number;
    num_tags: number;
    owner_org?: string;
    private?: boolean;
    dataset_type_info?: string;
    state?: 'active' | 'inactive' | 'deleted';
    title?: string;
    type?: 'dataset';
    url?: string;
    version?: string;
    activity_stream?: Array<Activity>;
    resources: Array<Resource>;
    organization?: Organization;
    groups?: Array<Group>;
    tags?: Array<Tag>;
    total_downloads?: number;
    visibility_type?: string;
}

export interface Resource {
    cache_last_updated?: string;
    cache_url?: string;
    cache_type?: 'raster' | 'vector';
    asset_type?: 'raster' | 'vector';
    asset_id?: string;
    created?: string;
    datastore_active?: boolean | null;
    description?: string;
    format?: string;
    hash?: string;
    id: string;
    last_modified?: string;
    metadata_modified?: string;
    mimetype?: string;
    mimetype_inner?: string;
    name?: string;
    package_id?: string;
    title: string;
    position?: number;
    resource_type?: null;
    size?: number;
    state?: 'active' | 'inactive' | 'deleted';
    url?: string;
    url_type?: string;
    key?: string;
    advanced_api_usage?: string;
    schema?: { value: DataDictionaryFormType };
    rw_id?: string;
    layerObjRaw: APILayerSpec | null;
    layerObj: APILayerSpec | null;
    connectorType?: string;
    connectorUrl?: string;
    provider?: string;
    tableName?: string;
    type:
        | 'link'
        | 'upload'
        | 'layer'
        | 'empty'
        | 'layer-raw'
        | 'tile-cache'
        | 'gee-asset'
        | 'reference-layer'
        | 'data-api-dataset';
    data_api_dataset_id?: string;
    data_api_version?: string;
    data_api_asset_id?: string;
    data_api_tiles?: string[];
    _hasChartView?: boolean;
    _views?: View[];
    total_record_count?: number;
    spatial_geom?: any;
    spatial_address?: string;
    spatial_coordinates?: any;
    spatial_type?: string;
    not_downloadable?: boolean;
}

interface Tag {
    display_name?: string;
    id: string;
    name: string;
    state: 'active';
    vocabulary_id?: string;
}

export interface View {
    id?: string;
    title: string;
    description: string;
    view_type: 'custom';
    config_obj: ViewConfig;
}

type ViewType = 'chart';

type ViewConfig = {
    type: ViewType;
    config: ChartViewConfig;
    form_state: any /* | OtherViewConfig ... */;
};

export interface ChartViewConfig {
    provider: 'datastore' | 'rw';
    id: string;
    props: PlotParams;
}

export type ViewState = View & {
    _state: 'new' | 'saved' | 'edit';
    _id: number;
};
