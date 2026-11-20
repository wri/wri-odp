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

    if (value < GIGABYTE_IN_BYTES) {
        return `${(sizeInKb / 1024).toFixed(1)} MB`;
    }

    return `${(value / GIGABYTE_IN_BYTES).toFixed(2)} GB`;
}

const GIGABYTE_IN_BYTES = 1024 * 1024 * 1024;

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
    size?: number | null;
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

/** Bytes reported for a resource, or `undefined` when CKAN has no size on file. */
export function getResourceSize(resource: ResourceLike): number | undefined {
    const size = Number(resource.size);
    return Number.isFinite(size) && size > 0 ? size : undefined;
}

/**
 * URL whose `Content-Length` gives the size of a resource that CKAN did not
 * size. Only plain links are probed: S3 keys and data API tiles are sized by
 * CKAN or from `tiles_info`.
 */
export function getResourceSizeProbeUrl(resource: ResourceLike): string | null {
    if (getResourceSize(resource) !== undefined) return null;
    if (resource.key) return null;
    if (isDataApiResource(resource) || isCopyLinkResource(resource)) return null;

    const url = resource.url?.trim();
    if (!url) return null;

    // Only absolute HTTP(S) URLs can be probed for a `Content-Length`.
    return /^https?:\/\//i.test(url) ? url : null;
}

/**
 * Bytes of a GFW data API tile, estimated from the GeoTIFF encoding stored in
 * the asset `tiles_info`: compression ratio per compression type, bits per
 * pixel of the first band, compressed block shape and tile pixel dimensions.
 */
type TileEstimateParams = {
    width?: number | null;
    height?: number | null;
    pixelxsize?: number | null;
    pixelysize?: number | null;
    compression?: string | null;
    bands?: Array<{ data_type?: string | null; nbits?: number | null }> | null;
};

type TileInfoFeature = {
    properties?: {
        name?: string;
        width?: number | null;
        height?: number | null;
        pixelxsize?: number | null;
        pixelysize?: number | null;
        compression?: string | null;
        bands?: Array<{ data_type?: string | null; nbits?: number | null }> | null;
    } | null;
};

// Bytes per pixel of the uncompressed GTiff block types (likely upper bounds:
// the GeoTIFF sample format is not exposed by `tiles_info`). `tiles_info`
// reports numpy style names (`uint8`, `float32`), so both spellings are listed.
const GTiff_BLOCK_BYTES: Record<string, number> = {
    byte: 1,
    int8: 1,
    uint8: 1,
    ubyte: 1,
    uint16: 2,
    int16: 2,
    uint32: 4,
    int32: 4,
    float32: 4,
    float64: 8,
    uint64: 8,
    int64: 8,
};

const DEFAULT_BLOCK_BYTES = 1;

// GTiff predictor plus per-block compression metadata.
const GTiff_BLOCK_OVERHEAD_BYTES = 32;

// Average compressed/uncompressed ratio per compression. Raster tiles are mostly
// nodata, so they compress far better than typical imagery.
const COMPRESSION_RATIOS: Record<string, number> = {
    DEFLATE: 0.05,
    LZW: 0.06,
    ZSTD: 0.05,
    WEBP: 0.03,
};

const DEFAULT_COMPRESSION_RATIO = 0.1;

// A tile never compresses below this many bytes (header, IFDs, pixel data).
const MIN_TILE_BYTES = 2 * 1024;

function getTileCompressionRatio(compression?: string | null): number {
    return COMPRESSION_RATIOS[compression?.toUpperCase() ?? ''] ?? DEFAULT_COMPRESSION_RATIO;
}

// GFW data API raster tiles cover 10x10 degrees (EPSG:4326) or 40000x40000 m.
const TILE_SIZE_DEGREES = 10;
const TILE_SIZE_METRES = 40000;
// A pixel bigger than this is rounded, so the pixel size cannot be trusted.
const MAX_TILE_PIXELS = 1_000_000;
// Pixel sizes below this threshold are degrees, above it they are metres.
const DEGREES_PIXEL_SIZE_THRESHOLD = 0.1;
// Assumed tile edge in pixels when `tiles_info` reports no usable pixel size.
const FALLBACK_PIXELS = 256;

/**
 * Resolves the pixel size of a tile to the length of the tile it divides, so
 * `pixelxsize` values reported in metres (`110`) and in degrees (`0.00025`) both
 * yield the real pixel dimensions. `width`/`height` are only used when they look
 * like the dimensions of a single tile rather than the whole raster.
 */
function getTilePixelDimensions(params: TileEstimateParams) {
    const width = Number(params.width);
    const height = Number(params.height);
    if (
        Number.isFinite(width) &&
        Number.isFinite(height) &&
        width > 0 &&
        height > 0 &&
        width <= MAX_TILE_PIXELS &&
        height <= MAX_TILE_PIXELS
    ) {
        return { width, height };
    }

    const pixelXSize = Number(params.pixelxsize);
    const pixelYSize = Number(params.pixelysize);
    const isMetric = (size: number) => size >= DEGREES_PIXEL_SIZE_THRESHOLD;

    const toPixels = (size: number | null | undefined, metric: boolean) => {
        const value = Number(size);
        if (!Number.isFinite(value) || value <= 0) return null;
        const pixels = (metric ? TILE_SIZE_METRES : TILE_SIZE_DEGREES) / value;
        return pixels > 0 && pixels <= MAX_TILE_PIXELS ? Math.round(pixels) : null;
    };

    // The x pixel size of a geographic tile can be fractional ("0"), so the
    // unit is decided from whichever axis is reported and then applied to both.
    const sizes = [pixelXSize, pixelYSize].filter((size) => Number.isFinite(size) && size > 0);
    const metric = sizes.length > 0 ? isMetric(Math.max(...sizes)) : false;

    return {
        width: toPixels(pixelXSize, metric) ?? FALLBACK_PIXELS,
        height: toPixels(pixelYSize, metric) ?? FALLBACK_PIXELS,
    };
}

export function estimateTileBytes(params?: TileEstimateParams | null): number {
    if (!params) return 0;

    const band = params.bands?.[0];
    const dataType = (band?.data_type ?? '').toLowerCase();
    const blockBytes = GTiff_BLOCK_BYTES[dataType] ?? DEFAULT_BLOCK_BYTES;
    const bitsPerBand = band?.nbits ?? blockBytes * 8;
    const bandsCount = Math.max(params.bands?.length ?? 1, 1);
    const { width, height } = getTilePixelDimensions(params);
    const uncompressedBytes = width * height * bandsCount * bitsPerBand * 0.125;
    const compressedBytes = uncompressedBytes * getTileCompressionRatio(params.compression);

    return Math.max(Math.round(compressedBytes + GTiff_BLOCK_OVERHEAD_BYTES), MIN_TILE_BYTES);
}

/** Total estimate of the selected tiles of a `tiles_info` response. */
export function estimateSelectedTilesBytes(
    features: TileInfoFeature[] | null | undefined,
    selectedTiles: Set<string>
): number {
    return (features ?? []).reduce((total, feature) => {
        const name = feature?.properties?.name;
        if (!name || !selectedTiles.has(name)) return total;
        return total + estimateTileBytes(feature.properties);
    }, 0);
}

/**
 * Estimated bytes of a set of selected tiles. Prefers the per-tile `tiles_info`,
 * falling back to the resource size for every selected tile.
 */
export function estimateSelectedTilesSize(
    resource: ResourceLike,
    tiles: string[],
    tileInfo?: TileInfoFeature[] | null
): number {
    if (tiles.length === 0) return 0;

    if (tileInfo && tileInfo.length > 0) {
        return estimateSelectedTilesBytes(tileInfo, new Set(tiles));
    }

    const resourceSize = getResourceSize(resource);
    // Data API resources store the size of a single tile.
    return resourceSize ? resourceSize * tiles.length : 0;
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
