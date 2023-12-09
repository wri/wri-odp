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
import { Accordion } from './Accordion'
import { CodeEditor } from '@/components/dashboard/_shared/CodeEditor'
import { v4 as uuidv4 } from 'uuid'
import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup'
import { Input } from '@/components/_shared/SimpleInput'
import { TextArea } from '@/components/_shared/SimpleTextArea'
import { convertLayerObjToForm, getApiSpecFromRawObj } from './convertObjects'
import { DefaultTooltip } from '@/components/_shared/Tooltip'

export function BuildALayerRaw({
    formObj,
    index,
}: {
    formObj: UseFormReturn<DatasetFormType>
    index: number
}) {
    const {
        register,
        getValues,
        setValue,
        formState: { errors },
    } = formObj

    const getLayerObj = () => {
        try {
            const apiSpec = getApiSpecFromRawObj(getValues(`resources.${index}.layerObjRaw`))
            return getValues(`resources.${index}.layerObjRaw`) ? { ...apiSpec, id: uuidv4() } : null
        } catch (e) {
            return null
        }
    }

    const convertToForm = () => {
        const layerObj = getLayerObj()
        console.log('LAYER OBJ', layerObj)
        if (layerObj) {
            setValue(`resources.${index}.type`, 'layer')
            setValue(`resources.${index}.layerObjRaw`, null)
            setValue(
                `resources.${index}.layerObj`,
                convertLayerObjToForm(layerObj)
            )
        }
    }

    const [preview, setPreview] = useState<APILayerSpec | null>(getLayerObj())
    const updatePreview = () => {
        setPreview(getLayerObj())
    }

    return (
        <>
            <div className="grid lg:grid-cols-2">
                <div className="pt-4 pr-4 flex flex-col gap-y-2">
                    <div className="flex items-center justify-end">
                        <DefaultTooltip content="This button will try to convert the layer config typed out directly as JSON into a form that can be edited by users that do not know the mapbox spec, there is the possiblity of data being lost">
                            <Button
                                onClick={() => convertToForm()}
                                type="button"
                            >
                                Convert to form
                            </Button>
                        </DefaultTooltip>
                    </div>
                    <InputGroup
                        label="Title"
                        required
                        className="sm:grid-cols-1 gap-x-2"
                        labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                    >
                        <Input
                            placeholder="Some name"
                            {...register(`resources.${index}.title`)}
                            type="text"
                            maxWidth="max-w-[70rem]"
                        />
                        <ErrorDisplay
                            name={`resources.${index}.title`}
                            errors={errors}
                        />
                    </InputGroup>
                    <InputGroup
                        label="Description"
                        className="sm:grid-cols-1 gap-x-2"
                        labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                    >
                        <TextArea
                            placeholder="Add description"
                            {...register(`resources.${index}.description`)}
                            type="text"
                            maxWidth="max-w-[70rem]"
                        />
                    </InputGroup>
                    <Accordion text="General Config">
                        <div className="mt-4">
                            <CodeEditor
                                formObj={formObj}
                                name={`resources.${index}.layerObjRaw.generalConfig`}
                            />
                        </div>
                    </Accordion>
                    <Accordion text="Layer Config">
                        <div className="mt-4">
                            <CodeEditor
                                formObj={formObj}
                                name={`resources.${index}.layerObjRaw.layerConfig`}
                            />
                        </div>
                    </Accordion>
                    <Accordion text="Legends Config">
                        <div className="mt-4">
                            <CodeEditor
                                formObj={formObj}
                                name={`resources.${index}.layerObjRaw.legendConfig`}
                            />
                        </div>
                    </Accordion>
                    <Accordion text="Interaction Config">
                        <div className="mt-4">
                            <CodeEditor
                                formObj={formObj}
                                name={`resources.${index}.layerObjRaw.interactionConfig`}
                            />
                        </div>
                    </Accordion>
                </div>
                <div>
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
                    height: '450px',
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
