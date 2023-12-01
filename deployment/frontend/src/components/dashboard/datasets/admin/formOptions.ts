import {
    CapacityUnion,
    UpdateFrequencyUnion,
    VisibilityTypeUnion,
} from '@/schema/dataset.schema'

export const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'French' },
    { value: 'pt', label: 'Portuguese' },
]

export const capacityOptions: { value: CapacityUnion; label: string }[] = [
    { value: 'admin', label: 'Admin' },
    { value: 'editor', label: 'Editor' },
    { value: 'member', label: 'Member' },
]

export const layerTypeOptions = [
    { value: 'vector', label: 'Vector' },
    { value: 'raster', label: 'Raster' },
]

export const providerOptions = [
    { value: 'carto', label: 'Cartodb' },
    { value: 'gee', label: 'Google Earth Engine' },
    { value: 'wms', label: 'WMS' },
]

export const filterOperationOptions = [
    { value: '==', label: 'Equals to' },
    { value: '>=', label: 'Greater than or equal' },
    { value: '<=', label: 'Smaller than or equal' },
    { value: '>', label: 'Greater than' },
    { value: '<', label: 'Smaller than' },
]

export const renderTypeOptions = [
    { value: 'circle', label: 'Circle' },
    { value: 'line', label: 'Line' },
    { value: 'fill', label: 'Fill' },
]

export const rampTypes = [
    { value: 'step', label: 'Steps' },
    { value: 'interpolate', label: 'Interpolate' },
    { value: 'interpolate-lab', label: 'Interpolate(CIELAB color space)' },
    { value: 'interpolate-hcl', label: 'Interpolate(HCL color space)' },
]

export const updateFrequencyOptions: {
    value: UpdateFrequencyUnion
    label: string
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
        value: 'monthly',
        label: 'Monthly',
    },
    { value: 'weekly', label: 'Weekly' },
    { value: 'annually', label: 'Annually' },
]

export const visibilityOptions: {
    value: VisibilityTypeUnion
    label: string
}[] = [
    { value: 'public', label: 'Public' },
    { value: 'internal', label: 'Internal Use' },
    {
        value: 'private',
        label: 'Private',
    },
]
