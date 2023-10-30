import { useIsDrawing, useMapState } from '@/utils/storeHooks'
import { useRef, useState } from 'react'
import ReactMapGL, { type MapRef } from 'react-map-gl'
import LayerManager from './LayerManager'
import { useInteractiveLayers } from '@/utils/queryHooks'
import Tooltip, { type TooltipRef } from './Tooltip'
import { type APILayerSpec } from '@/interfaces/layer.interface'
import { Legends } from './controls/Legends'
import Controls from './controls/Controls'
import Basemap from './Basemap'
import Labels from './Labels'

export default function Map({ layers }: { layers: APILayerSpec[] }) {
    const { setViewState, viewState } = useMapState()
    const mapRef = useRef<MapRef | null>(null)
    const mapTooltipRef = useRef<TooltipRef | null>(null)
    const mapContainerRef = useRef<HTMLDivElement | null>(null)
    const [ready, setReady] = useState(false)
    const { data: activeLayersIds } = useInteractiveLayers()
    const { isDrawing } = useIsDrawing()

    return (
        <div ref={mapContainerRef}>
            <ReactMapGL
                ref={(_map) => {
                    if (_map)
                        mapRef.current = _map.getMap() as unknown as MapRef
                }}
                {...viewState}
                mapStyle="mapbox://styles/resourcewatch/cjzmw480d00z41cp2x81gm90h"
                mapboxAccessToken="pk.eyJ1IjoicmVzb3VyY2V3YXRjaCIsImEiOiJjajFlcXZhNzcwMDBqMzNzMTQ0bDN6Y3U4In0.FRcIP_yusVaAy0mwAX1B8w"
                style={{ height: 'calc(100vh - 63px)', minHeight: '800px' }}
                interactiveLayerIds={activeLayersIds ? activeLayersIds : []}
                onMove={(evt) => setViewState(evt.viewState)}
                onClick={mapTooltipRef.current?.onClickLayer}
                onLoad={() => {
                    setReady(true)
                }}
            >
                {!!mapRef.current && layers && ready && (
                    <>
                        <LayerManager layers={layers} />
                        <Basemap mapRef={mapRef} />
                        <Labels mapRef={mapRef} />
                        <Controls
                            mapRef={mapRef}
                            mapContainerRef={mapContainerRef}
                        />

                        {isDrawing && <Tooltip ref={mapTooltipRef} />}

                        <Legends />
                    </>
                )}
            </ReactMapGL>
        </div>
    )
}
