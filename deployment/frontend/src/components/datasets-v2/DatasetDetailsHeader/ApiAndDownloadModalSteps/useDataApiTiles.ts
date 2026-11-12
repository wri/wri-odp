import { useMemo } from 'react';
import { type Resource } from '@/interfaces/dataset.interface';
import { api } from '@/utils/api';
import { getStoredDataApiTiles, isDataApiResource } from '../download-utils';

export type DataApiTilesState = {
    /** Tile paths per data API resource id, merging stored and resolved tiles. */
    tilesByResourceId: Record<string, string[]>;
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

    const tilesByResourceId: Record<string, string[]> = {};
    const loadingResourceIds: string[] = [];
    const failedResourceIds: string[] = [];

    for (const resource of resources) {
        if (!isDataApiResource(resource)) continue;

        const storedTiles = getStoredDataApiTiles(resource);
        if (storedTiles.length > 0) {
            tilesByResourceId[resource.id] = storedTiles;
        }
    }

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

    return { tilesByResourceId, loadingResourceIds, failedResourceIds };
}
