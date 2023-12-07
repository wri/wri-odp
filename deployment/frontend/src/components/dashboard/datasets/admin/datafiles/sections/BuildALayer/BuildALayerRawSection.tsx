import { useState, useRef } from 'react'
import ReactMapGL, { MapRef } from 'react-map-gl'
import { UseFormReturn } from 'react-hook-form'
import { DatasetFormType } from '@/schema/dataset.schema'
import { Button } from '@/components/_shared/Button'
import { Legends } from './preview/Legends'
import { getInteractiveLayers } from '@/utils/queryHooks'
import Tooltip from './preview/Tooltip'
import { LngLat, MapGeoJSONFeature } from 'react-map-gl/dist/esm/types'
import { APILayerSpec } from '@/interfaces/layer.interface'
import LayerManagerPreview from './preview/LayerManagerPreview'

export function BuildALayerRaw({
    formObj,
    index,
}: {
    formObj: UseFormReturn<DatasetFormType>
    index: number
}) {
    const [preview, setPreview] = useState<APILayerSpec | null>(
        formObj.getValues(`resources.${index}.layerObjRaw`)
    )

    const updatePreview = () => {
        setPreview(formObj.getValues(`resources.${index}.layerObjRaw`))
    }

    return (
        <>
            <div className="grid lg:grid-cols-2">
                <div></div>
                <div className="pt-4">
                    <PreviewMap
                        layerFormObj={preview ?? null}
                        updatePreview={updatePreview}
                    />
                </div>
            </div>
        </>
    )
}

export function PreviewMap({
    layerFormObj,
    updatePreview,
}: {
    layerFormObj: APILayerSpec | null
    updatePreview?: () => void
}) {
    const [viewState, setViewState] = useState({
        longitude: -100,
        latitude: 40,
        zoom: 1,
    })

    const mapRef = useRef<MapRef | null>(null)
    const interactiveLayerIds = layerFormObj
        ? getInteractiveLayers([layerFormObj])
        : []
    const [coordinates, setCoordinates] = useState<{
        longitude: number
        latitude: number
    } | null>(null)
    const [layersInfo, setLayersInfo] = useState<any>([])
    const close = () => {
        setCoordinates(null)
        setLayersInfo([])
    }

    const layers = layerFormObj ? [layerFormObj] : []

    const onClickLayer = ({
        features,
        lngLat,
    }: {
        features?: MapGeoJSONFeature[]
        lngLat: LngLat
    }) => {
        setCoordinates({ longitude: lngLat.lng, latitude: lngLat.lat })
        const layersInfo = []
        console.log('LAYERS INSIDE ON CLICK', layers)
        for (let layer of layers) {
            const feature = features?.find(
                //  @ts-ignore
                (f) => (f?.source || f.layer?.source) === layer.id
            )
            const { interactionConfig } = layer

            console.log('FOUND INTERACTION CONFIG', interactionConfig)
            const layerInfo = {
                id: layer.id,
                name: layer.name ?? 'sample-name',
            }

            if (feature && interactionConfig?.output) {
                //  TODO: output is supposed to be an array
                //  @ts-ignore
                layerInfo.properties = interactionConfig.output.map(
                    (c: any) => {
                        return {
                            config: c,
                            //  TODO: c.column is supposed to be a string
                            //  @ts-ignore
                            value: feature.properties[c.column],
                        }
                    }
                )
            }

            layersInfo.push(layerInfo)
        }
        setLayersInfo(layersInfo)
    }

    return (
        <div className="relative">
            {updatePreview && (
                <Button
                    className="z-10 absolute top-0 right-0"
                    type="button"
                    onClick={updatePreview}
                >
                    Update Preview
                </Button>
            )}
            <ReactMapGL
                {...viewState}
                ref={(_map) => {
                    if (_map)
                        mapRef.current = _map.getMap() as unknown as MapRef
                }}
                mapStyle="mapbox://styles/mapbox/light-v9"
                mapboxAccessToken="pk.eyJ1IjoicmVzb3VyY2V3YXRjaCIsImEiOiJjajFlcXZhNzcwMDBqMzNzMTQ0bDN6Y3U4In0.FRcIP_yusVaAy0mwAX1B8w"
                onMove={(evt) => setViewState(evt.viewState)}
                onClick={onClickLayer}
                interactiveLayerIds={interactiveLayerIds ?? []}
                style={{
                    height: '400px',
                }}
            >
                {layerFormObj && (
                    <LayerManagerPreview layers={[layerFormObj]} />
                )}
                <Tooltip
                    layersInfo={layersInfo}
                    coordinates={coordinates}
                    close={close}
                />
                {layerFormObj && layerFormObj.legendConfig && (
                    <Legends layerObj={layerFormObj} />
                )}
            </ReactMapGL>
        </div>
    )
}
