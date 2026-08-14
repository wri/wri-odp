import { HideBoundaries } from '@/components/_shared/HideBoundaries';
import DrawControl from '@/components/search/Draw';
import { type Resource } from '@/interfaces/dataset.interface';
import {
    Checkbox,
    getThemedColor,
    getThemedFontSize,
    getThemedSpacing,
    type ListItemProps,
} from '@worldresources/wri-design-systems';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type SyntheticEvent } from 'react';
import { type UseFormReturn } from 'react-hook-form';
import { Layer, Map, type MapLayerMouseEvent, type MapRef, Marker, Source } from 'react-map-gl';
import { useQuery } from 'react-query';
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
    [key: string]: unknown;
};

type MarkerCoords = [number, number];

type GeoCoderResultEvent = {
    result: {
        bbox: [number, number, number, number];
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
};

type ViewMode = 'map' | 'list';

export default function SelectFilesMap({
    geojsons,
    formObj,
    onToggleResource,
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
            const searchableText = [resource.name, resource.title, resource.id]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return searchableText.includes(query);
        });
    }, [geojsons, searchQuery]);

    const selectedTotalBytes = useMemo(
        () =>
            selectedGeojsons.reduce(
                (total, geojson) => total + Number(geojson.datafile.size ?? 0),
                0
            ),
        [selectedGeojsons]
    );

    const { mapSearchResults, mapSearchOptions, isLoadingMapSearch } = useMapGeocoderSearch({
        query: mapSearchQuery,
        accessToken,
        enabled: viewMode === 'map',
    });

    const handleSelectAll = useCallback(() => {
        geojsons.forEach((geojson) => {
            if (!geojson.selected) {
                onToggleResource(geojson.datafile);
            }
        });
    }, [geojsons, onToggleResource]);

    const handleClearAll = useCallback(() => {
        geojsons.forEach((geojson) => {
            if (geojson.selected) {
                onToggleResource(geojson.datafile);
            }
        });
    }, [geojsons, onToggleResource]);

    const handleGeocoderResult = useCallback(
        (event: GeoCoderResultEvent) => {
            setValue('bbox', [
                [event.result.bbox[0], event.result.bbox[1]],
                [event.result.bbox[2], event.result.bbox[3]],
            ]);
            setValue('point', event.result.center);

            if (event.result.place_name.split(',').length <= 2) {
                setValue('location', event.result.place_name);
            }

            mapRef.current?.fitBounds(
                [
                    [event.result.bbox[0], event.result.bbox[1]],
                    [event.result.bbox[2], event.result.bbox[3]],
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
        (selectedOption: ListItemProps | SyntheticEvent<HTMLInputElement>) => {
            if (!('label' in selectedOption)) {
                return;
            }

            const optionId = selectedOption.id;
            if (!optionId) {
                return;
            }

            const selectedResult = mapSearchResults.find((result) => result.id === optionId);
            if (!selectedResult) {
                return;
            }

            setMapSearchQuery(selectedResult.label);

            if (selectedResult.bbox) {
                handleGeocoderResult({
                    result: {
                        bbox: selectedResult.bbox,
                        center: selectedResult.center,
                        place_name: selectedResult.label,
                    },
                });
                return;
            }

            setValue('point', selectedResult.center);
            setValue('location', selectedResult.label);
            mapRef.current?.flyTo({ center: selectedResult.center, zoom: 5 });
        },
        [handleGeocoderResult, mapSearchResults, setValue]
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

            onToggleResource(geojson.datafile);
        },
        [onToggleResource]
    );

    const onUpdate = useCallback(
        (event: { features: object[]; action?: string }) => {
            for (const feature of event.features) {
                const typedFeature = feature as {
                    geometry?: {
                        coordinates?: number[][][];
                    };
                };
                const coordinates = typedFeature.geometry?.coordinates?.[0];

                if (coordinates?.length === 5) {
                    const [, , minLng, , maxLat] = coordinates as [
                        number[],
                        number[],
                        number[],
                        number[],
                        number[],
                    ];
                    setValue('point', null);
                    setValue('location', '');
                    setValue('bbox', [minLng, maxLat]);
                } else {
                    setValue('bbox', null);
                }
            }
        },
        [setValue]
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
            <div style={{ position: 'relative', isolation: 'isolate' }}>
                <SelectFilesMapHeader
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    mapSearchOptions={mapSearchOptions}
                    mapSearchQuery={mapSearchQuery}
                    onMapSearchQueryChange={setMapSearchQuery}
                    onMapSearchSelect={handleMapSearchSelect}
                    onMapSearchClear={handleMapSearchClear}
                    isLoadingMapSearch={isLoadingMapSearch}
                    listSearchQuery={searchQuery}
                    onListSearchQueryChange={setSearchQuery}
                />
            </div>

            <div
                style={{
                    position: 'relative',
                    minHeight: 360,
                    paddingBottom: getThemedSpacing(900),
                    zIndex: 0,
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
                                    key={resource.id}
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
                                        {resource.name ?? resource.title ?? resource.id}
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
                />
            </div>
        </>
    );
}
