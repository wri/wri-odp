import { useMemo } from 'react';
import { type Resource } from '@/interfaces/dataset.interface';
import { api } from '@/utils/api';
import {
    getResourceSize,
    getResourceSizeProbeUrl,
    getStoredDataApiTiles,
    isDataApiResource,
} from '../download-utils';

export type TileInfoFeature = {
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

export type DataApiTilesState = {
    /** Tile paths per data API resource id, merging stored and resolved tiles. */
    tilesByResourceId: Record<string, string[]>;
    /** Per-tile GeoTIFF metadata per data API resource id, for size estimates. */
    tileInfoByResourceId: Record<string, TileInfoFeature[]>;
    /** Bytes read from the file itself for resources CKAN saved without a size. */
    resolvedSizeByResourceId: Record<string, number>;
    /** Resource ids whose tiles are still being resolved. */
    loadingResourceIds: string[];
    /** Resource ids whose tiles could not be resolved. */
    failedResourceIds: string[];
};

/**
 * Resolves the tiles of GFW data API resources that were saved without
 * `data_api_tiles` (older records, or resources saved before the asset tiles
 * were persisted). Resources that already carry tiles are not re-fetched.
 */
export function useDataApiTiles(
    resources: Resource[],
    { enabled = true }: { enabled?: boolean } = {}
): DataApiTilesState {
    const pendingResources = useMemo(
        () =>
            resources.filter(
                (resource) =>
                    isDataApiResource(resource) &&
                    getStoredDataApiTiles(resource).length === 0 &&
                    Boolean(resource.data_api_dataset_id)
            ),
        [resources]
    );

    const queries = api.useQueries((t) =>
        pendingResources.map((resource) =>
            t.dataApi.resolveTiles(
                {
                    datasetId: resource.data_api_dataset_id ?? '',
                    version: resource.data_api_version,
                    assetId: resource.data_api_asset_id,
                },
                { enabled: enabled && Boolean(resource.data_api_dataset_id) }
            )
        )
    );

    // Data API sizes are only known per tile in `tiles_info`, so the metadata of
    // the asset (compression, pixel size, bands) is needed to estimate files.
    // Resources with a CKAN size already provide a per-tile estimate.
    const tileInfoResources = useMemo(
        () =>
            resources.filter(
                (resource) =>
                    isDataApiResource(resource) &&
                    getResourceSize(resource) === undefined &&
                    Boolean(resource.data_api_dataset_id)
            ),
        [resources]
    );

    const tileInfoQueries = api.useQueries((t) =>
        tileInfoResources.map((resource) =>
            t.dataApi.getTilesInfoFeatures(
                {
                    datasetId: resource.data_api_dataset_id ?? '',
                    version: resource.data_api_version,
                    assetId: resource.data_api_asset_id,
                },
                { enabled: enabled && Boolean(resource.data_api_dataset_id) }
            )
        )
    );

    // Linked files (ZIP, CSV, ...) are imported with `size: null`, so CKAN has no
    // size to show. Probe the file itself for its `Content-Length` instead of
    // reporting 0 bytes.
    const sizeResources = useMemo(
        () => resources.filter((resource) => getResourceSizeProbeUrl(resource) !== null),
        [resources]
    );

    const sizeQueries = api.useQueries((t) =>
        sizeResources.map((resource) =>
            t.dataApi.getResourceSize(
                { url: getResourceSizeProbeUrl(resource) ?? '' },
                { enabled: enabled && Boolean(resource.url) }
            )
        )
    );

    const tilesByResourceId: Record<string, string[]> = {};
    const tileInfoByResourceId: Record<string, TileInfoFeature[]> = {};
    const resolvedSizeByResourceId: Record<string, number> = {};
    const loadingResourceIds: string[] = [];
    const failedResourceIds: string[] = [];

    sizeResources.forEach((resource, index) => {
        const size = sizeQueries[index]?.data;
        if (typeof size === 'number' && size > 0) {
            resolvedSizeByResourceId[resource.id] = size;
        }
    });

    for (const resource of resources) {
        if (!isDataApiResource(resource)) continue;

        const storedTiles = getStoredDataApiTiles(resource);
        if (storedTiles.length > 0) {
            tilesByResourceId[resource.id] = storedTiles;
        }
    }

    tileInfoResources.forEach((resource, index) => {
        const features = tileInfoQueries[index]?.data?.features;
        if (features && features.length > 0) {
            tileInfoByResourceId[resource.id] = features;
        }
    });

    pendingResources.forEach((resource, index) => {
        const query = queries[index];
        if (!query) return;

        const tiles = query.data?.tiles ?? [];
        if (tiles.length > 0) {
            tilesByResourceId[resource.id] = tiles;
            return;
        }

        if (query.isLoading) {
            loadingResourceIds.push(resource.id);
        } else if (query.isFetched || query.isError) {
            failedResourceIds.push(resource.id);
        }
    });

    return {
        tilesByResourceId,
        tileInfoByResourceId,
        resolvedSizeByResourceId,
        loadingResourceIds,
        failedResourceIds,
    };
}
