import { HideBoundaries } from '@/components/_shared/HideBoundaries';
import DrawControl from '@/components/search/Draw';
import GeocoderControl from '@/components/search/GeocoderControl';
import { type Resource } from '@/interfaces/dataset.interface';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type UseFormReturn } from 'react-hook-form';
import { Layer, Map, type MapLayerMouseEvent, type MapRef, Marker, Source } from 'react-map-gl';
import { useQuery } from 'react-query';

export type LocationSearchFormType = {
    bbox: Array<Array<number>> | null;
    point: Array<number> | null;
    location: string;
};

type SelectFilesMapProps = {
    geojsons: any[];
    formObj: UseFormReturn<LocationSearchFormType>;
    onToggleResource: (resource: Resource) => void;
};

export default function SelectFilesMap({
    geojsons,
    formObj,
    onToggleResource,
}: SelectFilesMapProps) {
    const { setValue } = formObj;
    const [cursor, setCursor] = useState('grab');
    const mapRef = useRef<MapRef | null>(null);

    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';
    const { data: markers } = useQuery(['markers', geojsons.length], async () => {
        const markerAddresses = geojsons
            .filter((item) => item.address)
            .filter(Boolean)
            .map((item) => item.address);

        return await Promise.all(
            markerAddresses.map(async (address) => {
                const response = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?access_token=${accessToken}&limit=1`
                );
                const json = await response.json();
                return json.features[0].center;
            })
        );
    });

    const layerGeojsonMap = useRef<Record<string, any>>({});

    useEffect(() => {
        const newMap: Record<string, any> = {};

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
        (event: any) => {
            for (const feature of event.features) {
                if (feature.geometry.coordinates[0].length === 5) {
                    setValue('point', null);
                    setValue('location', '');
                    setValue('bbox', [
                        feature.geometry.coordinates[0][2],
                        feature.geometry.coordinates[0][4],
                    ]);
                } else {
                    setValue('bbox', null);
                }
            }
        },
        [setValue]
    );

    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.resize();
        }
    }, [mapRef.current]);

    const onModeChange = useCallback((event: any) => {
        if (event.mode === 'draw_polygon') {
            setCursor('crosshair');
            return;
        }

        setCursor('grab');
    }, []);

    return (
        <Map
            ref={(_map) => {
                if (_map) {
                    mapRef.current = _map.getMap() as unknown as MapRef;
                }
            }}
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            style={{ height: 360 }}
            dragRotate={false}
            initialViewState={{ longitude: 0, latitude: 0, zoom: 1 }}
            touchZoomRotate={false}
            mapStyle="mapbox://styles/mapbox/streets-v9"
            onClick={handleMapClick}
            cursor={cursor}
        >
            <HideBoundaries />

            <GeocoderControl
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                position="bottom-right"
                placeholder="Search files by location"
                initialValue={formObj.getValues('location')}
                onResult={(event) => {
                    setValue('bbox', [
                        [event.result.bbox[0], event.result.bbox[1]],
                        [event.result.bbox[2], event.result.bbox[3]],
                    ]);
                    setValue('point', event.result.center);

                    if (event.result.place_name.split(',').length <= 2) {
                        setValue('location', event.result.place_name);
                    }
                }}
                onClear={() => {
                    setValue('point', null);
                    setValue('bbox', null);
                    setValue('location', '');
                }}
            />

            {markers?.map((marker, index) => (
                <Marker key={index} longitude={marker[0]} latitude={marker[1]} />
            ))}

            {geojsons
                .filter((item) => !item.address)
                .map((geojson, index) => (
                    <Source key={index} type="geojson" data={geojson}>
                        <Layer
                            id={`fill-layer-${index}`}
                            type="fill"
                            paint={{
                                'fill-color':
                                    geojson.filtered || geojson.selected ? '#023020' : '#BAE1BD',
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
    );
}
