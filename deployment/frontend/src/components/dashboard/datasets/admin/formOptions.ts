import {
    type AdditionalReadingTagUnion,
    type CapacityUnion,
    type DatasetFormatInfoUnion,
    type DatasetTypeInfoUnion,
    type UpdateFrequencyUnion,
    type VisibilityTypeUnion,
} from '@/schema/dataset.schema';
import {
    additionalReadingTagLabels,
    datasetTypeLabels,
} from '@/utils/datasetMetadata';

export const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'French' },
    { value: 'pt', label: 'Portuguese' },
];

export const capacityOptions: { value: CapacityUnion; label: string }[] = [
    { value: 'admin', label: 'Admin' },
    { value: 'editor', label: 'Editor' },
    { value: 'member', label: 'Member' },
];

export const layerTypeOptions = [
    { value: 'vector', label: 'Vector' },
    { value: 'raster', label: 'Raster' },
];

export const providerOptions = [
    { value: 'carto', label: 'Cartodb' },
    { value: 'gee', label: 'Google Earth Engine' },
];

export const filterOperationOptions = [
    { value: '==', label: 'Equals to' },
    { value: '>=', label: 'Greater than or equal' },
    { value: '<=', label: 'Smaller than or equal' },
    { value: '>', label: 'Greater than' },
    { value: '<', label: 'Smaller than' },
];

export const renderTypeOptions = [
    { value: 'circle', label: 'Circle' },
    { value: 'line', label: 'Line' },
    { value: 'fill', label: 'Fill' },
];

export const rampTypes = [
    { value: 'step', label: 'Steps' },
    { value: 'interpolate', label: 'Interpolate' },
    { value: 'interpolate-lab', label: 'Interpolate(CIELAB color space)' },
    { value: 'interpolate-hcl', label: 'Interpolate(HCL color space)' },
];

export const updateFrequencyOptions: {
    value: UpdateFrequencyUnion;
    label: string;
}[] = [
    {
        value: 'biannually',
        label: 'Biannually',
    },
    {
        value: 'quarterly',
        label: 'Quarterly',
    },
    {
        value: 'daily',
        label: 'Daily',
    },
    {
        value: 'hourly',
        label: 'Hourly',
    },
    {
        value: 'as_needed',
        label: 'As needed',
    },
    {
        value: 'not_planned',
        label: 'Not planned',
    },
    {
        value: 'monthly',
        label: 'Monthly',
    },
    { value: 'weekly', label: 'Weekly' },
    { value: 'annually', label: 'Annually' },
];

export const visibilityOptions: {
    value: VisibilityTypeUnion;
    label: string;
}[] = [
    { value: 'public', label: 'Public' },
    { value: 'internal', label: 'Internal Use' },
    {
        value: 'private',
        label: 'Private',
    },
];

export const datasetTypeInfoOptions: {
    value: DatasetTypeInfoUnion | '';
    label: string;
}[] = [
    { value: '', label: 'Not specified' },
    ...Object.entries(datasetTypeLabels).map(([value, label]) => ({
        value: value as DatasetTypeInfoUnion,
        label,
    })),
];

type DatasetFormatOptionValue =
    | DatasetFormatInfoUnion
    | ''
    | '__group_gis_raster__'
    | '__group_gis_vector__'
    | '__group_tabular__'
    | '__group_misc__';

export const datasetFormatInfoOptions: {
    value: DatasetFormatOptionValue;
    label: string;
    disabled?: boolean;
}[] = [
    { value: '', label: 'Not specified' },
    { value: '__group_gis_raster__', label: ' ------ GIS Raster ------', disabled: true },
    { value: 'geotiff_tif', label: 'GeoTIFF' },
    { value: 'cloud_optimized_geotiff', label: 'Cloud-Optimized GeoTIFF' },
    { value: 'zarr', label: 'Zarr' },
    { value: 'gis_raster', label: 'Other' },
    { value: '__group_gis_vector__', label: ' ------ GIS Vector ------', disabled: true },
    { value: 'shapefile_shp', label: 'Shapefile' },
    { value: 'geojson_geojson', label: 'GeoJSON' },
    { value: 'geopackage', label: 'GeoPackage' },
    { value: 'file_geodatabase', label: 'File GeoDatabase' },
    { value: 'geoparquet', label: 'GeoParquet' },
    { value: 'gis_vector', label: 'Other' },
    { value: '__group_tabular__', label: ' ------ Tabular ------ ', disabled: true },
    { value: 'csv_csv', label: 'CSV' },
    { value: 'excel_xlsx', label: 'Excel' },
    { value: 'parquet', label: 'Parquet' },
    { value: '__group_misc__', label: ' ------ Miscellaneous ------', disabled: true },
    { value: 'json_json', label: 'JSON' },
    { value: 'pdf_pdf', label: 'PDF' },
    { value: 'other', label: 'Other' },
];

export const additionalReadingTagOptions: {
    value: AdditionalReadingTagUnion;
    label: string;
}[] = Object.entries(additionalReadingTagLabels).map(([value, label]) => ({
    value: value as AdditionalReadingTagUnion,
    label,
}));
