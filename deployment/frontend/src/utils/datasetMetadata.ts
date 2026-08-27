export const datasetTypeLabels: Record<string, string> = {
    raster_data: 'Raster data',
    tiled_raster_data: 'Tiled raster data',
    vector_data: 'Vector data',
    tiled_vector_data: 'Tiled vector data',
    tabular_data: 'Tabular data',
    versioned_tabular_data: 'Versioned tabular data',
    packaged_dataset: 'Packaged dataset',
    mixed_dataset: 'Mixed dataset',
    documentation: 'Documentation',
    model_output: 'Model output',
    api_dataset: 'API dataset',
};

export const datasetFormatLabels: Record<string, string> = {
    geotiff_tif: 'GeoTIFF (.tif)',
    shapefile_shp: 'Shapefile (.shp)',
    geojson_geojson: 'GeoJSON (.geojson)',
    csv_csv: 'CSV (.csv)',
    excel_xlsx: 'Excel (.xlsx)',
    json_json: 'JSON (.json)',
    pdf_pdf: 'PDF (.pdf)',
};

export const additionalReadingTagLabels: Record<string, string> = {
    article: 'Article',
    publication: 'Publication',
    documentation: 'Documentation',
    report: 'Report',
    blog_post: 'Blog post',
};

export function datasetFormatLabel(value?: string): string | undefined {
    if (!value) return value;
    return datasetFormatLabels[value] ?? value;
}

export function datasetTypeLabel(value?: string): string | undefined {
    if (!value) return value;
    return datasetTypeLabels[value] ?? value;
}

export function additionalReadingTagLabel(value?: string): string | undefined {
    if (!value) return value;
    return additionalReadingTagLabels[value] ?? value;
}
