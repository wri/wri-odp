import { useIsDrawing, useMapState } from '@/utils/storeHooks'
import { useEffect, useRef, useState } from 'react'
import ReactMapGL, { type MapRef } from 'react-map-gl'
import LayerManager from './LayerManager'
import { useInteractiveLayers } from '@/utils/queryHooks'
import Tooltip, { type TooltipRef } from './Tooltip'
import { type APILayerSpec } from '@/interfaces/layer.interface'
import { Legends } from './controls/Legends'
import Controls from './controls/Controls'
import Basemap from './Basemap'
import Labels from './Labels'

export default function Map({
    layers,
    showControls = true,
    showLegends = true,
    mapHeight = 'calc(100vh - 63px)',
    onClickAddLayers = () => {},
}: {
    layers: APILayerSpec[]
    showControls?: boolean
    showLegends?: boolean
    mapHeight?: string
    onClickAddLayers?: () => void
}) {
    const { setViewState, viewState } = useMapState()
    const mapRef = useRef<MapRef | null>(null)
    const mapTooltipRef = useRef<TooltipRef | null>(null)
    const mapContainerRef = useRef<HTMLDivElement | null>(null)
    const [ready, setReady] = useState(false)
    const { data: activeLayersIds } = useInteractiveLayers()
    const { isDrawing } = useIsDrawing()

    useEffect(() => {
        const ro = new ResizeObserver(() => {
            if (mapRef.current) {
                mapRef.current.resize()
            }
        })
        const map = document.getElementById('map')

        if (map) ro.observe(map)

        return () => ro.disconnect()
    }, [])

    console.log('LAYERS', layers)
    console.log('ACTIVE LAYERS', activeLayersIds)
    return (
        <div ref={mapContainerRef} className="h-full" id="map">
            <ReactMapGL
                ref={(_map) => {
                    if (_map)
                        mapRef.current = _map.getMap() as unknown as MapRef
                }}
                {...viewState}
                mapStyle="mapbox://styles/resourcewatch/cjzmw480d00z41cp2x81gm90h"
                mapboxAccessToken="pk.eyJ1IjoicmVzb3VyY2V3YXRjaCIsImEiOiJjajFlcXZhNzcwMDBqMzNzMTQ0bDN6Y3U4In0.FRcIP_yusVaAy0mwAX1B8w"
                style={{
                    height: mapHeight ?? 'calc(100vh - 63px)',
                    minHeight: '800px',
                }}
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
                        {showControls && (
                            <>
                                <Controls
                                    mapRef={mapRef}
                                    mapContainerRef={mapContainerRef}
                                />
                                <button
                                    onClick={onClickAddLayers}
                                    className="absolute bg-[#FFD271] hover:bg-opacity-90 transition-all px-6 py-3 text-base font-semibold top-5 z-20 left-1/2 -translate-x-[50%]"
                                >
                                    + Add layers
                                </button>
                            </>
                        )}

                        {isDrawing && <Tooltip ref={mapTooltipRef} />}

                        {showLegends && <Legends />}
                    </>
                )}
            </ReactMapGL>
        </div>
    )
}
