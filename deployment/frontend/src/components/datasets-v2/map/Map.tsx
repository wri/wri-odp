import { useIsDrawing, useMapState } from '@/utils/storeHooks';
import { getThemedColor } from '@worldresources/wri-design-systems';
import { useEffect, useRef, useState } from 'react';
import ReactMapGL, { type MapRef } from 'react-map-gl';
import { useInteractiveLayers } from '@/utils/queryHooks';
import Tooltip, { type TooltipRef } from './Tooltip';
import { type APILayerSpec } from '@/interfaces/layer.interface';
import { Legends } from './controls/Legends';
import Controls from './controls/Controls';
import Basemap from './Basemap';
import Labels from './Labels';
import dynamic from 'next/dynamic';
import YourLocationButton from './YourLocationButton';

const DynamicLayerManger = dynamic(() => import('./LayerManager'), {
    ssr: false,
});

export default function Map({
    layers,
    showControls = true,
    showLegends = true,
    mapHeight = 'calc(100vh - 48px)',
    datasetId,
    layerRwId,
}: {
    layers: APILayerSpec[];
    showControls?: boolean;
    showLegends?: boolean;
    mapHeight?: string;
    datasetId?: string;
    layerRwId?: string | null;
}) {
    const { setViewState, viewState } = useMapState();
    const mapRef = useRef<MapRef | null>(null);
    const mapTooltipRef = useRef<TooltipRef | null>(null);
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const [ready, setReady] = useState(false);
    const { data: activeLayersIds } = useInteractiveLayers();
    const { isDrawing } = useIsDrawing();

    useEffect(() => {
        const ro = new ResizeObserver(() => {
            if (mapRef.current) {
                mapRef.current.resize();
            }
        });
        const map = document.getElementById('map');

        if (map) ro.observe(map);

        return () => ro.disconnect();
    }, []);

    return (
        <div
            ref={mapContainerRef}
            className="h-full"
            style={{ borderLeft: `1px solid ${getThemedColor('neutral', 400)}` }}
            id="map"
        >
            <ReactMapGL
                ref={(_map) => {
                    if (_map) mapRef.current = _map.getMap() as unknown as MapRef;
                }}
                {...viewState}
                mapStyle="mapbox://styles/resourcewatch/cjzmw480d00z41cp2x81gm90h"
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                dragRotate={false}
                touchZoomRotate={false}
                style={{
                    height: mapHeight ?? 'calc(100vh - 48px)',
                }}
                interactiveLayerIds={activeLayersIds ?? []}
                onMove={(evt) => setViewState(evt.viewState)}
                onClick={mapTooltipRef.current?.onClickLayer}
                onLoad={() => {
                    setReady(true);
                }}
            >
                {!!mapRef.current && layers && ready && (
                    <>
                        <DynamicLayerManger
                            layers={layers}
                            datasetId={datasetId}
                            layerRwId={layerRwId}
                        />
                        <Basemap mapRef={mapRef} />
                        <Labels mapRef={mapRef} />
                        {showControls && (
                            <Controls mapRef={mapRef} mapContainerRef={mapContainerRef} />
                        )}

                        {!isDrawing && <Tooltip ref={mapTooltipRef} />}

                        {showLegends && <Legends />}
                        <YourLocationButton mapRef={mapRef} />
                    </>
                )}
            </ReactMapGL>
        </div>
    );
}
