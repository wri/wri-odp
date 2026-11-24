import {
    Button,
    getThemedColor,
    getThemedFontSize,
    getThemedRadius,
    getThemedSpacing,
} from '@worldresources/wri-design-systems';
import { type WriDataset } from '@/schema/ckan.schema';
import { type Resource } from '@/interfaces/dataset.interface';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '@/utils/api';
import FileCard from './FileCard';
import {
    estimateSelectedTilesSize,
    formatDate,
    formatFileSize,
    getResourceFormatLabel,
    getResourceSize,
    getResourceTitle,
    getStoredDataApiTiles,
    getNotDirectlyDownloadableMessage,
    isCopyLinkResource,
    isDataApiResource,
    isSelectableResource,
    tileToBbox,
} from '../download-utils';
import { type LocationSearchFormType, type TileGeojson } from './SelectFilesMap';
import { type TileInfoFeature } from './useDataApiTiles';

const SelectFilesMap = dynamic(() => import('./SelectFilesMap'), {
    ssr: false,
});

type SelectFilesStepProps = {
    dataset: WriDataset;
    selectedResourceIds: string[];
    selectedTilesByResourceId: Record<string, string[]>;
    /** Tiles resolved on demand, keyed by data API resource id. */
    tilesByResourceId?: Record<string, string[]>;
    /** Per-tile GeoTIFF metadata, keyed by data API resource id. */
    tileInfoByResourceId?: Record<string, TileInfoFeature[]>;
    /** Bytes read from the file for resources CKAN saved without a size. */
    resolvedSizeByResourceId?: Record<string, number>;
    /** Data API resources whose tiles are still being resolved. */
    resolvingResourceIds?: string[];
    onToggleResource: (resourceId: string) => void;
    onSelectTiles: (resourceId: string, tiles: string[] | null) => void;
    onBack: () => void;
    onContinue: () => void;
};

function SelectFilesStep({
    dataset,
    selectedResourceIds,
    selectedTilesByResourceId,
    tilesByResourceId = {},
    tileInfoByResourceId = {},
    resolvedSizeByResourceId = {},
    resolvingResourceIds = [],
    onToggleResource,
    onSelectTiles,
    onBack,
    onContinue,
}: SelectFilesStepProps) {
    const datafiles = dataset?.resources;
    const selectableResources = (datafiles ?? []).filter(isSelectableResource);
    const dataApiResources = selectableResources.filter(isDataApiResource);
    // Tiles persisted on the resource, overridden by tiles resolved on demand for
    // resources saved without them.
    const getTiles = (resource: Resource): string[] =>
        tilesByResourceId[resource.id] ?? getStoredDataApiTiles(resource);
    const isResolvingTiles = (resource: Resource) => resolvingResourceIds.includes(resource.id);
    // Imported links are saved with `size: null`, so fall back to the size read
    // from the file itself (see `useDataApiTiles`).
    const getResourceBytes = (resource: Resource): number | undefined =>
        getResourceSize(resource) ?? resolvedSizeByResourceId[resource.id];
    const geoSpatialResources = selectableResources
        // Copy-only resources have no downloadable geometry to frame on the map.
        .filter((resource) => !isCopyLinkResource(resource))
        .filter((resource) => resource.spatial_type !== 'global')
        .filter((resource) => (resource.spatial_address ?? resource.spatial_geom) != null);
    const datasetDisplayName = dataset.title ?? dataset.name;
    const datasetFunction =
        'function' in dataset ? (dataset as { function?: string }).function : undefined;
    const mapCardDescription = datasetFunction ?? dataset.short_description ?? '';
    const [isMapOpen, setIsMapOpen] = useState(false);

    const formObj = useForm<LocationSearchFormType>({
        defaultValues: {
            bbox: null,
            point: null,
            location: '',
        },
    });

    const watchedBbox = formObj.watch('bbox');
    const watchedPoint = formObj.watch('point');
    const watchedLocation = formObj.watch('location');
    // The area search adds resources to the selection but keeps the entered
    // location in the form: the same `formObj` is shared with the map, which
    // delivers the selected location as `bbox`/`point`/`location`, so resetting
    // it here would swallow the user's search and re-trigger the query.
    const hasLocationFilter =
        Boolean(watchedLocation?.trim()) ||
        Boolean(watchedPoint && watchedPoint.length > 0) ||
        Boolean(watchedBbox && watchedBbox.length > 0);

    const addResourcesToSelection = (resources: Resource[]) => {
        resources.forEach((resource) => {
            if (!selectedResourceIds.includes(resource.id)) {
                onToggleResource(resource.id);
            }
        });
    };

    api.dataset.resourceLocationSearch.useQuery(
        {
            bbox: watchedBbox,
            point: watchedPoint,
            location: watchedLocation,
            package_id: dataset.name,
            is_pending: false,
        },
        {
            enabled: hasLocationFilter,
            onSuccess: (resources) => {
                addResourcesToSelection(resources ?? []);
            },
        }
    );

    const geojsons = useMemo<TileGeojson[]>(() => {
        return geoSpatialResources.map((resource) => {
            const spatialGeom = (resource.spatial_geom ?? {}) as Omit<
                TileGeojson,
                'id' | 'datafile' | 'address' | 'selected'
            >;

            return {
                ...spatialGeom,
                address: resource.spatial_address,
                selected: selectedResourceIds.includes(resource.id),
                id: resource.id,
                datafile: resource,
            };
        });
    }, [geoSpatialResources, selectedResourceIds]);

    const showMapCard = Boolean(dataset.is_approved && geojsons.length > 0);

    const toggleResourceByMap = (resource: Resource) => {
        onToggleResource(resource.id);
    };

    const handleMapCardButton = () => {
        if (!isMapOpen) {
            setIsMapOpen(true);
            return;
        }

        geoSpatialResources.forEach((resource) => {
            if (selectedResourceIds.includes(resource.id)) {
                onToggleResource(resource.id);
            }
        });

        setIsMapOpen(false);
    };

    // One map feature per tile of a data-api resource. The id is a pseudo id
    // (`${resourceId}:${tileIndex}`) so toggling a tile never toggles another
    // feature sharing the same underlying resource id.
    const tileGeojsonsByResourceId = useMemo(() => {
        const result: Record<string, TileGeojson[]> = {};
        for (const resource of dataApiResources) {
            const selectedTiles = new Set(selectedTilesByResourceId[resource.id] ?? []);
            const tiles = tilesByResourceId[resource.id] ?? getStoredDataApiTiles(resource);
            // CKAN does not size data API resources; `tiles_info` does. Without it
            // the CKAN `size` is used (the size of a single tile).
            const resourceSize = getResourceSize(resource);
            const tileInfo = tileInfoByResourceId[resource.id];
            result[resource.id] = tiles.map((tile, index) => {
                const bbox = tileToBbox(tile);
                return {
                    // Mapbox <Source> needs a valid GeoJSON Feature.
                    type: 'Feature' as const,
                    id: `${resource.id}:${index}`,
                    datafile: resource,
                    name: tile.split('/').pop() ?? tile,
                    selected: selectedTiles.has(tile),
                    size: tileInfo?.length
                        ? estimateSelectedTilesSize(resource, [tile], tileInfo)
                        : resourceSize,
                    ...(bbox
                        ? {
                              geometry: {
                                  type: 'Polygon' as const,
                                  coordinates: [
                                      [
                                          [bbox[0], bbox[1]],
                                          [bbox[2], bbox[1]],
                                          [bbox[2], bbox[3]],
                                          [bbox[0], bbox[3]],
                                          [bbox[0], bbox[1]],
                                      ],
                                  ],
                              },
                          }
                        : {}),
                };
            });
        }
        return result;
    }, [dataApiResources, selectedTilesByResourceId, tilesByResourceId, tileInfoByResourceId]);

    const handleDataApiResourceButton = (resource: Resource) => {
        const isSelected = selectedResourceIds.includes(resource.id);
        onToggleResource(resource.id);

        if (isSelected) {
            onSelectTiles(resource.id, null);
            return;
        }

        onSelectTiles(resource.id, getTiles(resource));
    };

    // SelectFilesMap passes the clicked tile's geojson back; the tile is
    // identified by the pseudo id `${resourceId}:${tileIndex}`.
    const toggleTileByMap = (resource: Resource, geojson: TileGeojson) => {
        const index = Number(geojson.id.split(':')[1]);
        const tile = getTiles(resource)[index];
        if (tile === undefined) return;

        const selected = new Set(selectedTilesByResourceId[resource.id] ?? []);
        if (selected.has(tile)) {
            selected.delete(tile);
        } else {
            selected.add(tile);
        }
        onSelectTiles(resource.id, selected.size === 0 ? null : Array.from(selected));
    };

    const selectAllTiles = (resource: Resource) => {
        onSelectTiles(resource.id, getTiles(resource));
    };

    const clearAllTiles = (resource: Resource) => {
        onSelectTiles(resource.id, null);
    };

    // Adds every tile of the resource whose bbox intersects the drawn area.
    // Selection accumulates over what was already picked, so drawing a second
    // rectangle adds to the selection instead of replacing it.
    const selectTilesInArea = (resource: Resource, bbox: [number, number, number, number]) => {
        const [minLon, minLat, maxLon, maxLat] = bbox;
        const tiles = getTiles(resource);
        const selected = new Set(selectedTilesByResourceId[resource.id] ?? []);
        let matched = 0;

        for (const tile of tiles) {
            const tileBbox = tileToBbox(tile);
            if (!tileBbox) continue;

            // Standard AABB overlap test: the two boxes overlap unless one is
            // entirely to the left/right/above/below the other.
            const [tileMinLon, tileMinLat, tileMaxLon, tileMaxLat] = tileBbox;
            const overlaps =
                tileMaxLon > minLon &&
                tileMinLon < maxLon &&
                tileMaxLat > minLat &&
                tileMinLat < maxLat;

            if (overlaps) {
                selected.add(tile);
                matched += 1;
            }
        }

        // Nothing inside the drawn area and nothing picked before: leave the
        // resource untouched rather than clearing it to an empty selection.
        if (matched === 0 && selected.size === 0) {
            return;
        }

        onSelectTiles(resource.id, selected.size === 0 ? null : Array.from(selected));
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: getThemedSpacing(500),
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: getThemedSpacing(200),
                }}
            >
                <h1
                    style={{
                        fontSize: getThemedFontSize(700),
                        fontWeight: 700,
                        color: getThemedColor('neutral', 900),
                    }}
                >
                    Select files
                </h1>
                <p
                    style={{
                        fontSize: getThemedFontSize(400),
                        fontWeight: 400,
                        color: getThemedColor('neutral', 800),
                    }}
                >
                    Choose one or more data resources to download.
                </p>
            </div>

            {showMapCard && (
                <div
                    style={{
                        border: `1px solid ${getThemedColor('neutral', 300)}`,
                        borderRadius: getThemedRadius(400),
                        overflow: 'visible',
                    }}
                >
                    <div
                        style={{
                            padding: getThemedSpacing(400),
                            borderBottom: isMapOpen
                                ? `1px solid ${getThemedColor('neutral', 300)}`
                                : undefined,
                        }}
                    >
                        <FileCard
                            title={`${datasetDisplayName} GeoTIFF tiles`}
                            titleFontSize={getThemedFontSize(500)}
                            badge="GeoTIFF tile set"
                            description={mapCardDescription}
                            createdAt={formatDate(dataset.metadata_modified)}
                            updatedAt={formatDate(dataset.metadata_modified)}
                            borderless
                            rightContent={
                                <Button
                                    variant={!isMapOpen ? 'secondary' : 'negative'}
                                    size="default"
                                    leftIcon={!isMapOpen ? <PlusIcon /> : <TrashIcon />}
                                    onClick={handleMapCardButton}
                                >
                                    {isMapOpen ? 'Remove' : 'Add and configure'}
                                </Button>
                            }
                        />
                    </div>

                    {isMapOpen && (
                        <SelectFilesMap
                            geojsons={geojsons}
                            formObj={formObj}
                            onToggleResource={toggleResourceByMap}
                        />
                    )}
                </div>
            )}

            {/* Data API tile sets: map + searchable tile list */}
            {dataApiResources.map((resource) => {
                const isSelected = selectedResourceIds.includes(resource.id);
                const tileGeojsons = tileGeojsonsByResourceId[resource.id] ?? [];
                const selectedTileCount = tileGeojsons.filter((t) => t.selected).length;
                const resolving = isResolvingTiles(resource);
                const noTiles = !resolving && tileGeojsons.length === 0;

                return (
                    <div
                        key={resource.id}
                        style={{
                            border: `1px solid ${getThemedColor('neutral', 300)}`,
                            borderRadius: getThemedRadius(400),
                            // `visible` so the map header's floating search
                            // results are not cut off at the card edge; the map
                            // and the tile list each clip their own content.
                            overflow: 'visible',
                        }}
                    >
                        <div
                            style={{
                                padding: getThemedSpacing(400),
                                borderBottom: isSelected
                                    ? `1px solid ${getThemedColor('neutral', 300)}`
                                    : undefined,
                            }}
                        >
                            <FileCard
                                title={resource.title ?? resource.name ?? 'Selected file'}
                                titleFontSize={getThemedFontSize(500)}
                                badge={getResourceFormatLabel(resource)}
                                description={
                                    resolving
                                        ? 'Loading tiles…'
                                        : noTiles
                                          ? 'Tiles are not available for this data resource.'
                                          : isSelected
                                            ? selectedTileCount > 0
                                                ? `${selectedTileCount} of ${tileGeojsons.length} tiles selected`
                                                : 'No tiles selected yet — pick them on the map or list below.'
                                            : (resource.description ?? resource.name ?? '')
                                }
                                createdAt={formatDate(resource.created)}
                                updatedAt={formatDate(
                                    resource.metadata_modified ?? resource.last_modified
                                )}
                                warningMessage={
                                    noTiles
                                        ? 'The tiles for this resource could not be loaded from the GFW Data API.'
                                        : undefined
                                }
                                borderless
                                rightContent={
                                    <Button
                                        variant={isSelected ? 'negative' : 'secondary'}
                                        size="default"
                                        leftIcon={isSelected ? <TrashIcon /> : <PlusIcon />}
                                        disabled={!isSelected && (resolving || noTiles)}
                                        onClick={() => handleDataApiResourceButton(resource)}
                                    >
                                        {isSelected ? 'Remove' : 'Add'}
                                    </Button>
                                }
                            />
                        </div>

                        {isSelected && !noTiles && (
                            <SelectFilesMap
                                geojsons={tileGeojsons}
                                formObj={formObj}
                                onToggleResource={toggleResourceByMap}
                                onToggleTile={(geojson) => toggleTileByMap(resource, geojson)}
                                onSelectAllTiles={() => selectAllTiles(resource)}
                                onClearAllTiles={() => clearAllTiles(resource)}
                                onSelectTilesInArea={(bbox) => selectTilesInArea(resource, bbox)}
                            />
                        )}
                    </div>
                );
            })}

            {/* Cards */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: getThemedSpacing(400),
                }}
            >
                {selectableResources
                    .filter(
                        (resource) =>
                            !isDataApiResource(resource) &&
                            !(showMapCard && geoSpatialResources.includes(resource))
                    )
                    .map((resource) => {
                        const isExternallyHosted = Boolean(resource.not_downloadable);
                        const isCopyOnly = isCopyLinkResource(resource);

                        return (
                            <FileCard
                                key={resource.id}
                                title={getResourceTitle(resource)}
                                badge={
                                    isExternallyHosted && !isCopyOnly
                                        ? 'Hosted Externally'
                                        : getResourceFormatLabel(resource)
                                }
                                description={resource.description ?? resource.name ?? ''}
                                extraInfo={
                                    getResourceBytes(resource)
                                        ? `Size: ${formatFileSize(getResourceBytes(resource))}`
                                        : undefined
                                }
                                createdAt={formatDate(resource.created)}
                                updatedAt={formatDate(
                                    resource.metadata_modified ?? resource.last_modified
                                )}
                                warningMessage={getNotDirectlyDownloadableMessage(resource)}
                                rightContent={
                                    <Button
                                        variant={
                                            selectedResourceIds.includes(resource.id)
                                                ? 'negative'
                                                : 'secondary'
                                        }
                                        size="default"
                                        leftIcon={
                                            selectedResourceIds.includes(resource.id) ? (
                                                <TrashIcon />
                                            ) : (
                                                <PlusIcon />
                                            )
                                        }
                                        onClick={() => onToggleResource(resource.id)}
                                    >
                                        {selectedResourceIds.includes(resource.id)
                                            ? 'Remove'
                                            : 'Add'}
                                    </Button>
                                }
                            />
                        );
                    })}
            </div>

            {/* Button group */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="secondary" size="default" onClick={onBack}>
                    Back
                </Button>
                <Button
                    variant="primary"
                    size="default"
                    onClick={onContinue}
                    disabled={selectedResourceIds.length === 0}
                >
                    Continue
                </Button>
            </div>
        </div>
    );
}

export default SelectFilesStep;
