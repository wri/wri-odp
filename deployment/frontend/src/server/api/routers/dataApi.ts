import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { z } from 'zod';

const GFW_DATA_API_ORIGIN = 'https://data-api.globalforestwatch.org';

// A whole download response can take a while to send its first byte.
const SIZE_PROBE_TIMEOUT_MS = 10_000;

/**
 * Bytes of a remote file, read from the `Content-Length` of a `HEAD` request.
 * Resources imported from an external URL are saved with `size: null`, so this
 * is the only way to report a real download size for them. Files whose server
 * omits `Content-Length` (chunked transfers) resolve to `null`.
 */
async function fetchContentLength(url: string): Promise<number | null> {
    try {
        const res = await fetch(url, {
            method: 'HEAD',
            redirect: 'follow',
            signal: AbortSignal.timeout(SIZE_PROBE_TIMEOUT_MS),
        });
        if (!res.ok) return null;

        const contentLength = Number(res.headers.get('content-length'));
        return Number.isFinite(contentLength) && contentLength > 0 ? contentLength : null;
    } catch {
        // A failing probe must never break the download modal.
        return null;
    }
}

async function fetchTilesInfo(assetId: string): Promise<string[]> {
    const res = await fetch(
        `${GFW_DATA_API_ORIGIN}/asset/${encodeURIComponent(assetId)}/tiles_info`,
        { redirect: 'follow' }
    );
    if (!res.ok) {
        throw new Error(`tiles_info failed: ${res.status} ${res.statusText}`);
    }
    const geojson = (await res.json()) as {
        features?: Array<{
            properties?: { name?: string };
        }>;
    };
    return (geojson.features ?? []).map((f) => f.properties?.name ?? '').filter(Boolean);
}

type TilesInfoFeature = {
    properties?: {
        name?: string;
        width?: number | null;
        height?: number | null;
        pixelxsize?: number | null;
        pixelysize?: number | null;
        compression?: string | null;
        bands?: Array<{ data_type?: string | null; nbits?: number | null }> | null;
    };
};

async function fetchTilesInfoFeatures(assetId: string): Promise<TilesInfoFeature[]> {
    const res = await fetch(
        `${GFW_DATA_API_ORIGIN}/asset/${encodeURIComponent(assetId)}/tiles_info`,
        { redirect: 'follow' }
    );
    if (!res.ok) {
        throw new Error(`tiles_info failed: ${res.status} ${res.statusText}`);
    }
    const geojson = (await res.json()) as { features?: TilesInfoFeature[] };
    return (geojson.features ?? [])
        .filter((feature) => Boolean(feature.properties?.name))
        .map((feature) => ({ properties: feature.properties }));
}

type DataApiAsset = {
    asset_id: string;
    asset_type?: string;
    status?: string;
    is_downloadable?: boolean;
};

async function fetchLatestVersion(datasetId: string): Promise<string | null> {
    const res = await fetch(`${GFW_DATA_API_ORIGIN}/dataset/${encodeURIComponent(datasetId)}`);
    if (!res.ok) return null;

    const json = (await res.json()) as { data?: { versions?: string[] } };
    const versions = json.data?.versions ?? [];
    return versions.length > 0 ? versions[versions.length - 1]! : null;
}

/**
 * Finds the raster tile set asset of a dataset version so tiles can be listed
 * for resources whose `data_api_tiles` were never persisted. Falls back to the
 * latest version when the resource has no version, and to a raster tile cache
 * when the version has no raster tile set.
 */
async function findRasterTileSetAssetId(
    datasetId: string,
    version?: string | null
): Promise<string | null> {
    const resolvedVersion = version?.trim() ? version : await fetchLatestVersion(datasetId);
    if (!resolvedVersion) return null;

    for (const assetType of ['Raster tile set', 'Raster tile cache']) {
        const url = `${GFW_DATA_API_ORIGIN}/dataset/${encodeURIComponent(datasetId)}/${encodeURIComponent(resolvedVersion)}/assets?asset_type=${encodeURIComponent(assetType)}`;
        const res = await fetch(url);
        if (!res.ok) continue;

        const json = (await res.json()) as { data?: DataApiAsset[] };
        const assets = json.data ?? [];
        const usable =
            assets.find((asset) => asset.status === 'saved' && asset.is_downloadable !== false) ??
            assets[0];

        if (usable?.asset_id) {
            return usable.asset_id;
        }
    }

    return null;
}

export const dataApiRouter = createTRPCRouter({
    getTilesInfo: publicProcedure
        .input(z.object({ assetId: z.string() }))
        .query(async ({ input }) => fetchTilesInfo(input.assetId)),

    /**
     * Resolves the tile paths of a GFW data API resource. Resources saved through
     * the admin form carry `data_api_tiles`, but older or partially saved ones
     * only have the dataset/version/asset, so the tiles are looked up here.
     */
    resolveTiles: publicProcedure
        .input(
            z.object({
                datasetId: z.string(),
                version: z.string().nullish(),
                assetId: z.string().nullish(),
            })
        )
        .query(async ({ input }) => {
            // A stored asset id can be stale (asset re-created on a new version),
            // so fall back to discovering the asset when it yields no tiles.
            if (input.assetId?.trim()) {
                try {
                    const tiles = await fetchTilesInfo(input.assetId);
                    if (tiles.length > 0) {
                        return { assetId: input.assetId, tiles };
                    }
                } catch {
                    // fall through to asset discovery
                }
            }

            const assetId = await findRasterTileSetAssetId(input.datasetId, input.version);
            if (!assetId) {
                return { assetId: null, tiles: [] as string[] };
            }

            return { assetId, tiles: await fetchTilesInfo(assetId) };
        }),

    /**
     * Per-tile GeoTIFF metadata (compression, pixel size, band type) of a GFW
     * data API asset, used to estimate the download size of the selected tiles
     * since data API resources are not sized by CKAN.
     */
    getTilesInfoFeatures: publicProcedure
        .input(
            z.object({
                datasetId: z.string(),
                version: z.string().nullish(),
                assetId: z.string().nullish(),
            })
        )
        .query(async ({ input }) => {
            // A stored asset id can be stale (asset re-created on a new version),
            // so fall back to discovering the asset when it yields no features.
            const storedAssetId = input.assetId?.trim();
            if (storedAssetId) {
                try {
                    const features = await fetchTilesInfoFeatures(storedAssetId);
                    if (features.length > 0) {
                        return { assetId: storedAssetId, features };
                    }
                } catch {
                    // fall through to asset discovery
                }
            }

            const assetId = await findRasterTileSetAssetId(input.datasetId, input.version);
            if (!assetId || assetId === storedAssetId) {
                return { assetId: null, features: [] as TilesInfoFeature[] };
            }

            return { assetId, features: await fetchTilesInfoFeatures(assetId) };
        }),

    /**
     * Size in bytes of a remote file, read from its `Content-Length` header.
     * Used for resources CKAN stored with `size: null` (imported links).
     */
    getResourceSize: publicProcedure
        .input(z.object({ url: z.string().url() }))
        .query(async ({ input }) => fetchContentLength(input.url)),
});
