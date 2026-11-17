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
    url_type?: string | null;
    data_api_tiles?: unknown[] | null;
    data_api_dataset_id?: string | null;
    asset_id?: string | null;
    format?: string | null;
    key?: string | null;
    url?: string | null;
};

/**
 * `package_show` keeps the resource type in `type` (lifted from extras), while
 * pending datasets and older records may only carry it in `url_type`.
 */
function hasResourceType(resource: ResourceLike, type: string): boolean {
    return resource.type === type || resource.url_type === type;
}

/**
 * A GFW data API raster tile set. Tiles may not be persisted on the resource
 * (`data_api_tiles` empty) even though the dataset/version/asset are set, so the
 * tiles must not be required here — otherwise the whole resource disappears from
 * the download modal.
 */
export function isDataApiResource(resource: ResourceLike): boolean {
    return hasResourceType(resource, 'data-api-dataset');
}

/**
 * A Google Earth Engine asset. These are not downloadable: users copy the asset
 * id and use it inside the Earth Engine Code Editor.
 */
export function isGeeAssetResource(resource: ResourceLike): boolean {
    return hasResourceType(resource, 'gee-asset');
}

/**
 * A tile cache link. Like GEE assets these are not downloadable — users copy the
 * URL and consume the tiles from their own application.
 */
export function isTileCacheResource(resource: ResourceLike): boolean {
    return hasResourceType(resource, 'tile-cache');
}

/** Resources that can only be copied (not included in a download). */
export function isCopyLinkResource(resource: ResourceLike): boolean {
    return isGeeAssetResource(resource) || isTileCacheResource(resource);
}

export function getStoredDataApiTiles(resource: ResourceLike): string[] {
    return (resource.data_api_tiles ?? []).filter(
        (tile): tile is string => typeof tile === 'string'
    );
}

/** Value shown/copied for a copy-only resource: the GEE asset id or tile cache URL. */
export function getCopyLinkValue(resource: ResourceLike): string {
    return resource.asset_id ?? resource.url ?? '';
}

/**
 * A resource can be listed for download when it has an S3 key, a direct URL, or
 * is a GFW data API tile set. Data API resources have neither `key` nor `url`,
 * so they must be checked explicitly. Copy-only resources (GEE assets and tile
 * caches) are never downloadable, even when they carry a `url`.
 */
export function isDownloadableResource(resource: ResourceLike): boolean {
    if (isCopyLinkResource(resource)) {
        return false;
    }

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

/**
 * `format` is often saved as an empty string rather than null, so `??` alone
 * renders an empty badge. Fall back to the URL extension and finally to 'FILE'
 * (S3-backed upload) or 'LINK' (external URL).
 */
function getFormatFromUrl(url?: string | null): string | null {
    if (!url) return null;

    let pathname: string;
    try {
        pathname = new URL(url).pathname;
    } catch {
        pathname = url;
    }

    // Require a leading letter so numeric DOI suffixes (e.g. `zenodo.13890401`)
    // are not mistaken for file extensions.
    const match = /\.([a-z][a-z0-9]{0,7})$/i.exec(pathname);
    return match?.[1] ? match[1].toUpperCase() : null;
}

export function getResourceFormatLabel(resource: ResourceLike): string {
    if (isDataApiResource(resource)) {
        return 'Raster Tile Set';
    }

    if (isGeeAssetResource(resource)) {
        return 'Google Earth Engine asset';
    }

    if (isTileCacheResource(resource)) {
        return 'Tile cache';
    }

    const format = resource.format?.trim();
    if (format) {
        return format;
    }

    const derived = getFormatFromUrl(resource.url);
    if (derived) {
        return derived;
    }

    return resource.key ? 'FILE' : 'LINK';
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

/**
 * Tile paths embed the dataset version
 * (`/vsis3/.../<dataset>/<version>/raster/...`), so it can be recovered when the
 * resource was saved without `data_api_version`.
 */
export function getVersionFromTilePath(tilePath: string): string | null {
    const match = /\/[^/]+\/(v\d[^/]*)\/raster\//.exec(tilePath);
    return match?.[1] ?? null;
}

/**
 * Expands a data API resource into one direct GFW URL per tile. The version is
 * taken from the resource, falling back to the version embedded in the tiles.
 */
export function getDataApiTileGfwUrls(
    resource: {
        data_api_tiles?: unknown[] | null;
        data_api_dataset_id?: string | null;
        data_api_version?: string | null;
    },
    selectedTiles?: string[]
): string[] {
    const datasetId = resource.data_api_dataset_id;
    if (!datasetId) return [];

    const selected = selectedTiles ? new Set(selectedTiles) : null;

    const tiles = (resource.data_api_tiles ?? [])
        .filter((tile): tile is string => typeof tile === 'string')
        .filter((tile) => !selected || selected.has(tile));

    return tiles
        .map((tile) => {
            const version = resource.data_api_version?.trim()
                ? resource.data_api_version
                : getVersionFromTilePath(tile);
            if (!version) return null;
            return tileToGfwDownloadUrl(tile, datasetId, version);
        })
        .filter((url): url is string => url !== null);
}
