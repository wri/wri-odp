export function formatFileSize(value?: number | null): string {
    if (value === null || value === undefined) {
        return '';
    }

    if (value < 1024) {
        return `${value} B`;
    }

    const sizeInKb = value / 1024;
    if (sizeInKb < 1024) {
        return `${sizeInKb.toFixed(1)} KB`;
    }

    return `${(sizeInKb / 1024).toFixed(1)} MB`;
}

export function formatDate(value?: string | null): string {
    if (!value) {
        return '';
    }

    return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    });
}

type ResourceLike = {
    type?: string | null;
    data_api_tiles?: unknown[] | null;
    format?: string | null;
    key?: string | null;
    url?: string | null;
};

export function isDataApiResource(resource: ResourceLike): boolean {
    return resource.type === 'data-api-dataset' && (resource.data_api_tiles?.length ?? 0) > 0;
}

/**
 * A resource can be listed for download when it has an S3 key, a direct URL, or
 * a set of GFW data API tiles. Data API resources have neither `key` nor `url`,
 * so they must be checked explicitly.
 */
export function isDownloadableResource(resource: ResourceLike): boolean {
    return Boolean(resource.key) || Boolean(resource.url) || isDataApiResource(resource);
}

/**
 * A resource can be fetched straight from the browser when it has an S3 key or
 * a direct URL. Data API tile sets are far too large to zip client-side, so they
 * are excluded here and delivered through the server-side ZIP flow instead.
 */
export function isDirectDownloadResource(resource: ResourceLike): boolean {
    return Boolean(resource.key) || Boolean(resource.url);
}

export function getResourceFormatLabel(resource: ResourceLike): string {
    if (isDataApiResource(resource)) {
        return 'Raster Tile Set';
    }

    return resource.format ?? 'FILE';
}

/**
 * Builds the direct GFW data API URL for a tile. Used for server-side ZIP
 * generation, where the datapusher appends the API key itself.
 */
export function tileToGfwDownloadUrl(
    tilePath: string,
    datasetId: string,
    version: string
): string | null {
    const parts = tilePath.split('/');
    if (parts.length < 12) return null;

    const filename = parts[parts.length - 1];
    const format = parts[parts.length - 2];
    const pixelMeaning = parts[parts.length - 3];
    const grid2 = parts[parts.length - 4];
    const grid1 = parts[parts.length - 5];

    const tileId = filename?.replace(/\.[^.]+$/, '');
    if (!tileId || !format || !pixelMeaning || !grid1 || !grid2) return null;

    return `https://data-api.globalforestwatch.org/dataset/${encodeURIComponent(datasetId)}/${encodeURIComponent(version)}/download/${encodeURIComponent(format)}?grid=${grid1}/${grid2}&tile_id=${tileId}&pixel_meaning=${pixelMeaning}`;
}

const TILE_ID_RE = /^(\d+)([NSns])_(\d+)([EWew])$/;

/**
 * Returns the [minLon, minLat, maxLon, maxLat] bbox of a tile path like
 * `/vsis3/.../epsg-4326/10/100000/decile/geotiff/30N_000E.tif`, where the
 * fifth-to-last segment is the tile size in degrees.
 */
export function tileToBbox(tilePath: string): [number, number, number, number] | null {
    const parts = tilePath.split('/');
    if (parts.length < 5) return null;

    const filename = parts[parts.length - 1];
    const grid1 = parts[parts.length - 5];
    if (!filename || !grid1) return null;

    const tileSizeDeg = parseInt(grid1, 10);
    if (!Number.isFinite(tileSizeDeg) || tileSizeDeg <= 0) return null;

    const tileId = filename.replace(/\.[^.]+$/, '');
    const match = TILE_ID_RE.exec(tileId);
    if (!match) return null;

    const lat = parseInt(match[1]!, 10) * (match[2]!.toUpperCase() === 'N' ? 1 : -1);
    const lon = parseInt(match[3]!, 10) * (match[4]!.toUpperCase() === 'E' ? 1 : -1);

    return [lon, lat - tileSizeDeg, lon + tileSizeDeg, lat];
}

/** Expands a data API resource into one direct GFW URL per tile. */
export function getDataApiTileGfwUrls(
    resource: {
        data_api_tiles?: unknown[] | null;
        data_api_dataset_id?: string | null;
        data_api_version?: string | null;
    },
    selectedTiles?: string[]
): string[] {
    const datasetId = resource.data_api_dataset_id;
    const version = resource.data_api_version;
    if (!datasetId || !version) return [];

    const selected = selectedTiles ? new Set(selectedTiles) : null;

    return (resource.data_api_tiles ?? [])
        .filter((tile): tile is string => typeof tile === 'string')
        .filter((tile) => !selected || selected.has(tile))
        .map((tile) => tileToGfwDownloadUrl(tile, datasetId, version))
        .filter((url): url is string => url !== null);
}
