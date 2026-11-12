import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { z } from 'zod';

const GFW_DATA_API_ORIGIN = 'https://data-api.globalforestwatch.org';

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
});
