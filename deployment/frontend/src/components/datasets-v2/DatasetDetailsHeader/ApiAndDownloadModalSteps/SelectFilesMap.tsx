import { HideBoundaries } from '@/components/_shared/HideBoundaries';
import DrawControl from '@/components/search/Draw';
import { type Resource } from '@/interfaces/dataset.interface';
import {
    Checkbox,
    getThemedColor,
    getThemedFontSize,
    getThemedSpacing,
} from '@worldresources/wri-design-systems';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type UseFormReturn } from 'react-hook-form';
import { Layer, Map, type MapLayerMouseEvent, type MapRef, Marker, Source } from 'react-map-gl';
import { useQuery } from 'react-query';
import { type MapSearchResultOption } from './MapSearchResults';
import SelectFilesMapHeader from './SelectFilesMapHeader';
import SelectFilesMapSelectionBar from './SelectFilesMapSelectionBar';
import { useMapGeocoderSearch } from './useMapGeocoderSearch';

export type LocationSearchFormType = {
    bbox: Array<Array<number>> | null;
    point: Array<number> | null;
    location: string;
};

export type TileGeojson = {
    address?: string | null;
    selected?: boolean;
    id: string;
    datafile: Resource;
    filtered?: boolean;
    // Display name for list rows; falls back to the resource name when absent.
    name?: string;
    // Estimated bytes of this tile; `datafile.size` is the whole resource size.
    size?: number;
    [key: string]: unknown;
};

type MarkerCoords = [number, number];

type GeoCoderResultEvent = {
    result: {
        // Mapbox only returns a bbox for some place types, so it can be absent.
        bbox: [number, number, number, number] | null;
        center: [number, number];
        place_name: string;
    };
};

type ModeChangeEvent = {
    mode?: string;
};

type SelectFilesMapProps = {
    geojsons: TileGeojson[];
    formObj: UseFormReturn<LocationSearchFormType>;
    onToggleResource: (resource: Resource) => void;
    // When provided, map clicks and list checkboxes toggle individual tiles
    // (one geojson per tile) instead of the whole resource.
    onToggleTile?: (geojson: TileGeojson) => void;
    onSelectAllTiles?: () => void;
    onClearAllTiles?: () => void;
    // When provided, drawing an area selects the tiles intersecting it
    // instead of running the resource location search.
    onSelectTilesInArea?: (bbox: [number, number, number, number]) => void;
    /** Copy shown in the selection bar when no tile is selected. */
    emptySelectionMessage?: string;
};

type ViewMode = 'map' | 'list';

type DrawFeature = {
    geometry?: {
        coordinates?: number[][][];
    };
};

/**
 * Reduces a drawn feature's outer ring to `[minLon, minLat, maxLon, maxLat]`.
 *
 * The rectangle mode emits its ring as `[minX,minY] [maxX,minY] [maxX,maxY]
 * [minX,maxY] [minX,minY]`, so the extremes cannot be read by position: a
 * rectangle drawn right-to-left or top-to-bottom (or a polygon edited in
 * `simple_select`) puts them in a different order. Deriving them from every
 * vertex keeps the extent correct whichever direction it was drawn in.
 */
function ringToBbox(feature: DrawFeature): [number, number, number, number] | null {
    const ring = feature.geometry?.coordinates?.[0];
    if (!ring || ring.length < 3) return null;

    let minLon = Infinity;
    let minLat = Infinity;
    let maxLon = -Infinity;
    let maxLat = -Infinity;

    for (const point of ring) {
        const lng = point?.[0];
        const lat = point?.[1];
        if (typeof lng !== 'number' || typeof lat !== 'number') continue;
        if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;
        if (lng < minLon) minLon = lng;
        if (lng > maxLon) maxLon = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
    }

    if (!Number.isFinite(minLon) || !Number.isFinite(minLat)) return null;
    if (minLon === maxLon || minLat === maxLat) return null;

    return [minLon, minLat, maxLon, maxLat];
}

export default function SelectFilesMap({
    geojsons,
    formObj,
    onToggleResource,
    onToggleTile,
    onSelectAllTiles,
    onClearAllTiles,
    onSelectTilesInArea,
    emptySelectionMessage,
}: SelectFilesMapProps) {
    const { setValue } = formObj;
    const [cursor, setCursor] = useState('grab');
    const [viewMode, setViewMode] = useState<ViewMode>('map');
    const [searchQuery, setSearchQuery] = useState('');
    const [mapSearchQuery, setMapSearchQuery] = useState('');
    const mapRef = useRef<MapRef | null>(null);

    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';
    const { data: markers } = useQuery<MarkerCoords[], unknown>(
        ['markers', geojsons.length],
        async (): Promise<MarkerCoords[]> => {
            const markerAddresses = geojsons
                .filter((item) => item.address)
                .map((item) => item.address)
                .filter((address): address is string => Boolean(address));

            const markerResults = await Promise.all(
                markerAddresses.map(async (address) => {
                    const response = await fetch(
                        `https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?access_token=${accessToken}&limit=1`
                    );
                    const json = (await response.json()) as {
                        features?: Array<{ center?: [number, number] }>;
                    };

                    return json.features?.[0]?.center ?? ([0, 0] as MarkerCoords);
                })
            );

            return markerResults;
        }
    );

    const layerGeojsonMap = useRef<Record<string, TileGeojson>>({});

    const selectedGeojsons = useMemo(
        () => geojsons.filter((geojson) => geojson.selected),
        [geojsons]
    );

    const filteredGeojsons = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) {
            return geojsons;
        }

        return geojsons.filter((geojson) => {
            const resource = geojson.datafile;
            const searchableText = [geojson.name, resource.name, resource.title, resource.id]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return searchableText.includes(query);
        });
    }, [geojsons, searchQuery]);

    const selectedTotalBytes = useMemo(
        () =>
            selectedGeojsons.reduce(
                (total, geojson) =>
                    // A tile's own size (data API tile sets); otherwise the whole
                    // resource size for resources selected as a single feature.
                    total + Number(geojson.size ?? geojson.datafile.size ?? 0),
                0
            ),
        [selectedGeojsons]
    );

    const {
        mapSearchResults,
        mapSearchOptions,
        isLoadingMapSearch,
        isQueryLongEnough: isMapSearchQueryValid,
    } = useMapGeocoderSearch({
        query: mapSearchQuery,
        accessToken,
        enabled: viewMode === 'map',
    });

    const handleSelectAll = useCallback(() => {
        if (onSelectAllTiles) {
            onSelectAllTiles();
            return;
        }

        geojsons.forEach((geojson) => {
            if (!geojson.selected) {
                onToggleResource(geojson.datafile);
            }
        });
    }, [geojsons, onToggleResource, onSelectAllTiles]);

    const handleClearAll = useCallback(() => {
        if (onClearAllTiles) {
            onClearAllTiles();
            return;
        }

        geojsons.forEach((geojson) => {
            if (geojson.selected) {
                onToggleResource(geojson.datafile);
            }
        });
    }, [geojsons, onToggleResource, onClearAllTiles]);

    const handleGeocoderResult = useCallback(
        (event: GeoCoderResultEvent) => {
            const { bbox, center, place_name: placeName } = event.result;

            if (!Array.isArray(bbox) || bbox.length !== 4) {
                // No bbox to frame: center the map on the result instead of
                // calling `fitBounds` with a malformed extent (which throws and
                // leaves the map where it was).
                setValue('bbox', null);
                setValue('point', center);
                setValue('location', placeName);
                mapRef.current?.flyTo({ center, zoom: 5 });
                return;
            }

            setValue('bbox', [
                [bbox[0], bbox[1]],
                [bbox[2], bbox[3]],
            ]);
            setValue('point', center);

            if (placeName.split(',').length <= 2) {
                setValue('location', placeName);
            }

            mapRef.current?.fitBounds(
                [
                    [bbox[0], bbox[1]],
                    [bbox[2], bbox[3]],
                ],
                {
                    padding: 24,
                    animate: false,
                }
            );
        },
        [setValue]
    );

    const handleMapSearchSelect = useCallback(
        (selectedOption: MapSearchResultOption) => {
            const selectedResult = mapSearchResults.find(
                (result) => result.id === selectedOption.id
            );
            if (!selectedResult) {
                return;
            }

            // Keeps the input in sync with the picked place; must happen before
            // the form update, which may re-render the map through its parent.
            setMapSearchQuery(selectedResult.label);

            // Frames the place on the map (`fitBounds` with its extent, or
            // `flyTo` its centre when Mapbox returns no bbox) and stores the
            // location in the shared form.
            handleGeocoderResult({
                result: {
                    bbox: selectedResult.bbox,
                    center: selectedResult.center,
                    place_name: selectedResult.label,
                },
            });

            // `fitBounds` needs a laid-out container: if the map was hidden
            // (e.g. the list tab) it reports a zero-size viewport and would
            // collapse the camera, so re-frame on the next frame as well.
            window.requestAnimationFrame(() => {
                const map = mapRef.current;
                if (!map) {
                    return;
                }

                map.resize();

                if (selectedResult.bbox) {
                    map.fitBounds(
                        [
                            [selectedResult.bbox[0], selectedResult.bbox[1]],
                            [selectedResult.bbox[2], selectedResult.bbox[3]],
                        ],
                        { padding: 24, animate: false }
                    );
                    return;
                }

                map.flyTo({ center: selectedResult.center, zoom: 5 });
            });
        },
        [handleGeocoderResult, mapSearchResults]
    );

    const handleMapSearchClear = useCallback(() => {
        setMapSearchQuery('');
        setValue('point', null);
        setValue('bbox', null);
        setValue('location', '');
    }, [setValue]);

    useEffect(() => {
        if (viewMode !== 'map') {
            return;
        }

        const animationFrame = window.requestAnimationFrame(() => {
            mapRef.current?.resize();
        });

        return () => {
            window.cancelAnimationFrame(animationFrame);
        };
    }, [viewMode]);

    useEffect(() => {
        const newMap: Record<string, TileGeojson> = {};

        geojsons
            .filter((item) => !item.address)
            .forEach((geojson, index) => {
                const fillLayerId = `fill-layer-${index}`;
                const lineLayerId = `line-layer-${index}`;
                newMap[fillLayerId] = geojson;
                newMap[lineLayerId] = geojson;
            });

        layerGeojsonMap.current = newMap;
    }, [geojsons]);

    const handleMapClick = useCallback(
        (event: MapLayerMouseEvent) => {
            if (!mapRef.current) return;

            const features = mapRef.current.queryRenderedFeatures(event.point);
            if (features.length === 0) return;

            const clickedLayerId = features[0]?.layer.id;
            if (!clickedLayerId) return;

            const geojson = layerGeojsonMap.current[clickedLayerId];
            if (!geojson?.datafile) return;

            if (onToggleTile) {
                onToggleTile(geojson);
                return;
            }

            onToggleResource(geojson.datafile);
        },
        [onToggleResource, onToggleTile]
    );

    const onUpdate = useCallback(
        (event: { features: object[]; action?: string }) => {
            // The draw control fires this on create and on edit; only the last
            // drawn shape matters, since `create` deletes the previous one.
            const lastFeature = event.features[event.features.length - 1] as
                DrawFeature | undefined;
            const bbox = lastFeature ? ringToBbox(lastFeature) : null;

            if (!bbox) {
                setValue('bbox', null);
                return;
            }

            if (onSelectTilesInArea) {
                // Area-select mode: pick every tile intersecting the drawn
                // rectangle. `[minLon, minLat, maxLon, maxLat]`.
                onSelectTilesInArea(bbox);
                return;
            }

            // Resource location search: CKAN expects `bbox=minx,miny,maxx,maxy`,
            // so all four corners must be sent. Sending a partial extent makes
            // the filter match every resource instead of the ones in the area.
            const [minLon, minLat, maxLon, maxLat] = bbox;
            setValue('point', null);
            setValue('location', '');
            setValue('bbox', [
                [minLon, minLat],
                [maxLon, maxLat],
            ]);
        },
        [onSelectTilesInArea, setValue]
    );

    const onModeChange = useCallback((event: ModeChangeEvent) => {
        if (event.mode === 'draw_polygon') {
            setCursor('crosshair');
            return;
        }

        setCursor('grab');
    }, []);

    return (
        <>
            {/* `zIndex` is what keeps the floating search results above the map:
             * the map wrapper below is a sibling that also establishes a
             * positioned box, so without a positive `zIndex` here the panel
             * paints underneath it. */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                <SelectFilesMapHeader
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    mapSearchOptions={mapSearchOptions}
                    mapSearchQuery={mapSearchQuery}
                    onMapSearchQueryChange={setMapSearchQuery}
                    onMapSearchSelect={handleMapSearchSelect}
                    onMapSearchClear={handleMapSearchClear}
                    isLoadingMapSearch={isLoadingMapSearch}
                    isMapSearchQueryValid={isMapSearchQueryValid}
                    listSearchQuery={searchQuery}
                    onListSearchQueryChange={setSearchQuery}
                />
            </div>

            <div
                style={{
                    position: 'relative',
                    minHeight: 360,
                    paddingBottom: getThemedSpacing(900),
                }}
            >
                {viewMode === 'map' ? (
                    <Map
                        ref={mapRef}
                        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''}
                        style={{ height: 360 }}
                        dragRotate={false}
                        initialViewState={{ longitude: 0, latitude: 0, zoom: 1 }}
                        touchZoomRotate={false}
                        mapStyle="mapbox://styles/mapbox/streets-v9"
                        onClick={handleMapClick}
                        cursor={cursor}
                    >
                        <HideBoundaries />

                        {markers?.map((marker, index) => (
                            <Marker key={index} longitude={marker[0]} latitude={marker[1]} />
                        ))}

                        {geojsons
                            .filter((item) => !item.address)
                            .map((geojson, index) => (
                                <Source key={index} type="geojson" data={geojson as never}>
                                    <Layer
                                        id={`fill-layer-${index}`}
                                        type="fill"
                                        paint={{
                                            'fill-color':
                                                geojson.filtered || geojson.selected
                                                    ? '#023020'
                                                    : '#BAE1BD',
                                            'fill-opacity': 0.3,
                                        }}
                                    />
                                    <Layer
                                        id={`line-layer-${index}`}
                                        type="line"
                                        paint={{
                                            'line-width': 0.5,
                                            'line-color': '#32864B',
                                        }}
                                    />
                                </Source>
                            ))}

                        <DrawControl
                            position="top-left"
                            onClear={() => {
                                setCursor('grab');
                                setValue('bbox', null);
                            }}
                            displayControlsDefault={false}
                            controls={{ polygon: true }}
                            onModeChange={onModeChange}
                            defaultMode="simple_select"
                            onCreate={onUpdate}
                            onUpdate={onUpdate}
                            onDelete={() => {
                                setCursor('grab');
                                setValue('bbox', null);
                            }}
                        />
                    </Map>
                ) : (
                    <div
                        style={{
                            minHeight: 360,
                            height: 360,
                            overflowY: 'auto',
                            borderTop: `1px solid ${getThemedColor('neutral', 300)}`,
                            paddingBottom: getThemedSpacing(300),
                        }}
                    >
                        {filteredGeojsons.map((geojson) => {
                            const resource = geojson.datafile;
                            const isSelected = !!geojson.selected;

                            return (
                                <div
                                    // Tile geojsons share their resource id, so the
                                    // geojson id (unique per tile) is the key.
                                    key={geojson.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: getThemedSpacing(200),
                                        padding: `${getThemedSpacing(200)} ${getThemedSpacing(400)}`,
                                        borderBottom: `1px solid ${getThemedColor('neutral', 300)}`,
                                    }}
                                >
                                    <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={(event) => {
                                            if (event.checked !== isSelected) {
                                                if (onToggleTile) {
                                                    onToggleTile(geojson);
                                                    return;
                                                }
                                                onToggleResource(resource);
                                            }
                                        }}
                                    />
                                    <span
                                        style={{
                                            fontSize: getThemedFontSize(400),
                                            color: getThemedColor('neutral', 900),
                                        }}
                                    >
                                        {geojson.name ??
                                            resource.name ??
                                            resource.title ??
                                            resource.id}
                                    </span>
                                </div>
                            );
                        })}

                        {filteredGeojsons.length === 0 && (
                            <div
                                style={{
                                    minHeight: 360,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: getThemedColor('neutral', 700),
                                    fontSize: getThemedFontSize(400),
                                }}
                            >
                                No tiles found.
                            </div>
                        )}
                    </div>
                )}

                <SelectFilesMapSelectionBar
                    selectedCount={selectedGeojsons.length}
                    totalCount={geojsons.length}
                    selectedTotalBytes={selectedTotalBytes}
                    onSelectAll={handleSelectAll}
                    onClearAll={handleClearAll}
                    emptyMessage={emptySelectionMessage}
                />
            </div>
        </>
    );
}
