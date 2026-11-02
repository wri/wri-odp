export const datasetTypeLabels: Record<string, string> = {
    raster_data: 'Raster data',
    vector_data: 'Vector data',
    tabular_data: 'Tabular data',
    data_package: 'Data package',
    other: 'Other',
};

export const datasetFormatLabels: Record<string, string> = {
    geotiff_tif: 'GIS Raster (GeoTIFF)',
    cloud_optimized_geotiff: 'GIS Raster (Cloud-Optimized GeoTIFF)',
    zarr: 'GIS Raster (Zarr)',
    gis_raster: 'GIS Raster',
    shapefile_shp: 'GIS Vector (Shapefile)',
    geojson_geojson: 'GIS Vector (GeoJSON)',
    geopackage: 'GIS Vector (GeoPackage)',
    file_geodatabase: 'GIS Vector (File GeoDatabase)',
    geoparquet: 'GIS Vector (GeoParquet)',
    gis_vector: 'GIS Vector',
    csv_csv: 'Tabular (CSV)',
    excel_xlsx: 'Tabular (Excel)',
    parquet: 'Tabular (Parquet)',
    json_json: 'JSON',
    pdf_pdf: 'PDF',
    other: 'Other',
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
