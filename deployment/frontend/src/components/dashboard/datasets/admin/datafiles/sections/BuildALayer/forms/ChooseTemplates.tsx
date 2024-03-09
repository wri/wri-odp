import React, { useState } from 'react'
import dynamic from 'next/dynamic';
const Modal = dynamic(() => import('@/components/_shared/Modal'), {
    ssr: false,
});
import { Button, LoaderButton } from '@/components/_shared/Button'
import { democracy_index } from '@/templateLayers/democracy_index'
import { energy_facilities } from '@/templateLayers/energy_facilities'
import { roads } from '@/templateLayers/roads'
import { hdi } from '@/templateLayers/hdi'
import { marine_ecoregions } from '@/templateLayers/marine_ecoregions'
import { temperature } from '@/templateLayers/temperature'
import { useMutation, useQuery } from 'react-query'
import { Input } from '@/components/_shared/SimpleInput'
import { useFormContext } from 'react-hook-form'
import { LayerFormType } from '../layer.schema'
import { convertLayerObjToForm } from '../convertObjects'
import { APILayerSpec } from '@/interfaces/layer.interface'
import Image from 'next/image'
import { ScrollArea, ScrollBar } from '@/components/_shared/ScrollArea'

interface IProps {
    setOpen: (open: boolean) => void
    open: boolean
}

export function ChooseTemplates(props: IProps) {
    const { open, setOpen } = props
    const { reset } = useFormContext<LayerFormType>()
    const [layer, setLayer] = useState('')
    const loadLayer = useMutation(['templateLayer', layer], async () => {
        const response = await fetch(
            `https://api.resourcewatch.org/v1/layer/${layer}`
        )
        const layerData = await response.json()
        const { id, attributes } = layerData.data
        const templateLayer: APILayerSpec = {
            id: id,
            ...attributes,
            application: ['data-explorer'],
            protected: false,
            published: false,
            env: 'staging',
        }
        if (templateLayer.layerConfig.type === 'vector') {
            const account =
                layerData.data.attributes.layerConfig.source.provider.account
            const sql = layerData.data.attributes.layerConfig.source.sql
            templateLayer.connectorUrl = `https://${account}.carto.com/api/v2/sql?q=${sql}`
        }
        setTemplate(templateLayer)
    })

    const setTemplate = (layerObj: APILayerSpec) => {
        const formObj = convertLayerObjToForm(layerObj)
        reset(formObj)
        setOpen(false)
    }

    return (
        <Modal open={open} setOpen={setOpen} className="max-w-2xl">
            <div className="p-6">
                <div className="border-b border-zinc-100 pb-5">
                    <div className="font-acumin text-3xl  text-neutral-700">
                        Use a template
                    </div>
                    <div className="font-acumin text-base font-light text-neutral-600">
                        You can either select one of the predefined templates as
                        a basis
                    </div>
                </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-4">
                            <h2 className="font-acumin text-base font-bold  text-neutral-700">
                                Continous Data - Polygon - Using filters
                            </h2>
                            <Image
                                onClick={() =>
                                    setTemplate(democracy_index as any)
                                }
                                src={democracy_index.thumbnailUrl}
                                alt="Thumbnail image for the democracy index template"
                                className="cursor-pointer"
                                height={300}
                                width={300}
                            />
                        </div>
                        <div className="flex flex-col gap-4">
                            <h2 className="font-acumin text-base font-bold  text-neutral-700">
                                Continous Data - Polygon - Using steps
                            </h2>
                            <Image
                                onClick={() => setTemplate(hdi as any)}
                                src={hdi.thumbnailUrl}
                                alt="Thumbnail image for the HDI template"
                                className="cursor-pointer"
                                height={300}
                                width={300}
                            />
                        </div>
                        <div className="flex flex-col gap-4">
                            <h2 className="font-acumin text-base font-bold  text-neutral-700">
                                Categorical Data - Lines - Using filters
                            </h2>
                            <Image
                                onClick={() => setTemplate(roads as any)}
                                src={roads.thumbnailUrl}
                                alt="Thumbnail image for the roads template"
                                className="cursor-pointer"
                                height={300}
                                width={300}
                            />
                        </div>
                        <div className="flex flex-col gap-4">
                            <h2 className="font-acumin text-base font-bold  text-neutral-700">
                                Categorical Data - Polygon - Using filters
                            </h2>
                            <Image
                                onClick={() =>
                                    setTemplate(marine_ecoregions as any)
                                }
                                src={marine_ecoregions.thumbnailUrl}
                                alt="Thumbnail image for the marine ecoregions template"
                                className="cursor-pointer"
                                height={300}
                                width={300}
                            />
                        </div>
                        <div className="flex flex-col gap-4">
                            <h2 className="font-acumin text-base font-bold  text-neutral-700">
                                Continous Data - Polygon - Using ramps
                            </h2>
                            <Image
                                onClick={() => setTemplate(temperature as any)}
                                src={temperature.thumbnailUrl}
                                alt="Thumbnail image for the temperature template"
                                className="cursor-pointer"
                                height={300}
                                width={300}
                            />
                        </div>
                        <div className="flex flex-col gap-4">
                            <h2 className="font-acumin text-base font-bold  text-neutral-700">
                                Continous Data - Point - Using filters
                            </h2>
                            <Image
                                onClick={() =>
                                    setTemplate(energy_facilities as any)
                                }
                                src={energy_facilities.thumbnailUrl}
                                alt="Thumbnail image for the energy facilities template"
                                className="cursor-pointer"
                                height={300}
                                width={300}
                            />
                        </div>
                    </div>
                <div>
                    <div className="font-acumin text-base font-light pt-6 text-neutral-600">
                        Or type the ID/Slug of the layer you want to fetch from
                        the Resource Watch API
                    </div>
                    <div className="flex flex-col sm:flex-row gap-5 items-center">
                        <Input
                            onChange={(e) => setLayer(e.target.value)}
                            type="text"
                            value={layer}
                        />
                        <LoaderButton
                            onClick={() => loadLayer.mutate()}
                            loading={loadLayer.isLoading}
                            className="whitespace-nowrap"
                        >
                            Load Template
                        </LoaderButton>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
