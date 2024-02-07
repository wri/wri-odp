import classNames from '@/utils/classnames'
import { useMachine } from '@xstate/react'
import layerEditorMachine from './layerEditorMachine'
import SourceForm from './forms/SourceForm'
import LegendForm from './forms/LegendsForm'
import InteractionForm from './forms/InteractionForm'
import RenderForm from './forms/RenderForm'
import { useEffect, useState, useRef } from 'react'
import ReactMapGL, { MapRef } from 'react-map-gl'
import { FormProvider, UseFormReturn, useForm } from 'react-hook-form'
import { DatasetFormType } from '@/schema/dataset.schema'
import { LayerFormType, layerSchema } from './layer.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/_shared/Button'
import { convertFormToLayerObj, getRawObjFromApiSpec } from './convertObjects'
import { Legends } from './preview/Legends'
import { Steps } from './Steps'
import { getInteractiveLayers } from '@/utils/queryHooks'
import Tooltip from './preview/Tooltip'
import { LngLat, MapGeoJSONFeature } from 'react-map-gl/dist/esm/types'
import { APILayerSpec } from '@/interfaces/layer.interface'
import LayerManagerPreview from './preview/LayerManagerPreview'
import { slugify } from '@/utils/slugify'

export function BuildALayer({
    formObj,
    index,
}: {
    formObj: UseFormReturn<DatasetFormType>
    index: number
}) {
    const [current, send] = useMachine(layerEditorMachine)
    const [preview, setPreview] = useState<APILayerSpec | null>(
        formObj.getValues(`resources.${index}.layerObj`)
            ? convertFormToLayerObj(
                  layerSchema.parse(
                      formObj.getValues(`resources.${index}.layerObj`)
                  )
              )
            : null
    )
    const layerFormObj = useForm<LayerFormType>({
        resolver: zodResolver(layerSchema),
        defaultValues: {
            layerConfig: {
                type: { value: 'vector', label: 'Vector' },
                source: {
                    provider: {
                        account: 'wri-rw',
                        type: {
                            value: 'carto',
                            label: 'Carto',
                        },
                    },
                },
            },
            ...formObj.getValues(`resources.${index}.layerObj`),
        },
    })

    const convertToRaw = () => {
        formObj.setValue(`resources.${index}.type`, 'layer-raw')
        const layerObjRaw = getRawObjFromApiSpec(
            convertFormToLayerObj(layerFormObj.getValues())
        )
        formObj.setValue(`resources.${index}.layerObjRaw`, layerObjRaw)
        formObj.setValue(`resources.${index}.layerObj`, null)
    }

    const syncValues = () => {
        const values = layerFormObj.getValues()
        formObj.setValue(`resources.${index}.layerObj`, values)
    }

    useEffect(() => {
        syncValues()
    }, [layerFormObj.watch()])

    const updatePreview = () => {
        syncValues()
        console.log('UPDATING PREVIEW', layerFormObj.getValues())
        setPreview(convertFormToLayerObj(layerFormObj.getValues()))
    }

    const {
        watch,
        setValue,
        formState: { dirtyFields, touchedFields },
    } = layerFormObj
    useEffect(() => {
        if (!dirtyFields['connectorUrl'])
            setValue(
                'connectorUrl',
                `https://${watch(
                    'layerConfig.source.provider.account'
                )}.carto.com:443/api/v2/sql?q=${
                    watch('layerConfig.source.provider.layers.0.options.sql') ??
                    ''
                }`
            )
    }, [
        watch('layerConfig.source.provider.account'),
        watch('layerConfig.source.provider.layers.0.options.sql'),
    ])

    useEffect(() => {
        if (!dirtyFields['slug']) setValue('slug', slugify(watch('name')))
    }, [watch('name')])
    useEffect(() => {
        syncValues()
        if (
            Object.keys(dirtyFields).length > 0 ||
            Object.keys(touchedFields).length > 0
        ) {
            const dirty = Object.keys(dirtyFields)
            const touched = Object.keys(touchedFields)
            dirty.push(...touched)
            //session storage
            sessionStorage.setItem('dirtyFields', JSON.stringify(dirty))
        }
    }, [watch()])

    console.log('IN HERE TO SEE')
    return (
        <FormProvider {...layerFormObj}>
            <Steps state={current.toStrings()[0] ?? 'setSourceConfig'} />
            <div className="grid lg:grid-cols-2">
                <div>
                    {current.matches('setSourceConfig') && (
                        <SourceForm
                            convertToRaw={convertToRaw}
                            onNext={() => {
                                syncValues()
                                layerFormObj.watch(
                                    'layerConfig.source.provider.type'
                                ).value === 'carto'
                                    ? send('GO_TO_RENDER')
                                    : send('GO_TO_LEGEND')
                            }}
                        />
                    )}
                    {current.matches('setRenderConfig') && (
                        <RenderForm
                            onPrev={() => {
                                syncValues()
                                send('BACK_TO_SOURCE')
                            }}
                            onNext={() => {
                                syncValues()
                                send('GO_TO_LEGEND')
                            }}
                        />
                    )}
                    {current.matches('setLegendConfig') && (
                        <LegendForm
                            onNext={() => {
                                syncValues()
                                send('NEXT')
                            }}
                            onPrev={() => {
                                syncValues()
                                layerFormObj.watch(
                                    'layerConfig.source.provider.type'
                                ).value === 'carto'
                                    ? send('BACK_TO_RENDER')
                                    : send('BACK_TO_SOURCE')
                            }}
                        />
                    )}
                    {current.matches('setInteractionConfig') && (
                        <InteractionForm
                            onPrev={() => {
                                syncValues()
                                send('PREV')
                            }}
                            onNext={() => {
                                syncValues()
                                send('NEXT')
                            }}
                        />
                    )}
                </div>
                <div className="pt-4">
                    <PreviewMap
                        layerFormObj={preview ?? null}
                        updatePreview={updatePreview}
                    />
                </div>
            </div>
        </FormProvider>
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
