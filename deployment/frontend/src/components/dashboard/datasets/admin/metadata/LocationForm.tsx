import {
    ArrowUpTrayIcon,
    Bars4Icon,
    GlobeEuropeAfricaIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/outline'
import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup'
import { Disclosure, Tab } from '@headlessui/react'
import { SimpleEditor } from '@/components/dashboard/datasets/admin/metadata/RTE/SimpleEditor'
import { MetadataAccordion } from './MetadataAccordion'
import { TextArea } from '@/components/_shared/SimpleTextArea'
import { UseFormReturn } from 'react-hook-form'
import { DatasetFormType } from '@/schema/dataset.schema'
import { DefaultTooltip } from '@/components/_shared/Tooltip'
import { MapPinIcon } from '@heroicons/react/20/solid'
import { useEffect, useRef, useState } from 'react'
import classNames from '@/utils/classnames'
import { match } from 'ts-pattern'
import GeocoderControl from '@/components/search/GeocoderControl'
import { Layer, Map, Source } from 'react-map-gl'
import notify from '@/utils/notify'
import Spinner from '@/components/_shared/Spinner'

export function LocationForm({
    formObj,
}: {
    formObj: UseFormReturn<DatasetFormType>
}) {
    const [isLoadingGeoJSON, setIsLoadingGeoJSON] = useState(false)

    const {
        formState: { errors },
        setValue,
        watch,
    } = formObj

    const uploadInputRef = useRef<HTMLInputElement>(null)

    /*
     * This useEffect prevents page from scrolling to the map
     *
     */
    useEffect(() => {
        const chooseAddress = document.getElementById('choose-address')

        if (chooseAddress) {
            chooseAddress.style.visibility = 'hidden'
            setTimeout(() => {
                chooseAddress.style.visibility = 'visible'
            }, 2000)
        }
    }, [])

    function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) {
            return
        }

        setIsLoadingGeoJSON(true)

        const file = e?.target?.files[0]

        if (!file) {
            return
        }

        if (
            file?.type &&
            !file.type.startsWith('application/geo') &&
            !file.type.startsWith('application/json')
        ) {
            notify('File is not GeoJSON', 'error')
            return
        }

        const reader = new FileReader()
        reader.addEventListener('load', (event) => {
            setIsLoadingGeoJSON(false)
            try {
                const json = JSON.parse(event?.target?.result as string)
                setValue(`spatial`, json)
            } catch (e) {
                console.error(e)
                notify('Failed to parse GeoJSON file', 'error')
            }
        })

        reader.readAsText(file)
    }

    return (
        <MetadataAccordion
            defaultOpen
            label={
                <>
                    <MapPinIcon className="h-7 w-7" />
                    Location Coverage
                    <DefaultTooltip content="This field defines whether a dataset will show up on the results or not when doing a search by location">
                        <InformationCircleIcon
                            className="h-5 w-5 text-neutral-500"
                            aria-hidden="true"
                        />
                    </DefaultTooltip>
                </>
            }
        >
            <input
                ref={uploadInputRef}
                onChange={(e) => onInputChange(e)}
                type="file"
                className="hidden"
                accept="application/geojson"
            />
            <Disclosure.Panel className="flex flex-col gap-y-8 pb-12 pt-5">
                <Tab.Group
                    selectedIndex={match(watch('spatial_type'))
                        .with('geom', () => 0)
                        .with('address', () => 1)
                        .with('global', () => 2)
                        .otherwise(() => undefined)}
                >
                    <Tab.List
                        as="div"
                        className={classNames(
                            'grid max-w-[35rem] grid-cols-2 sm:grid-cols-3 gap-3 py-4'
                        )}
                    >
                        <Tab
                            onClick={() => {
                                !watch('spatial')
                                    ? uploadInputRef.current?.click()
                                    : setValue('spatial', undefined)

                                setValue('spatial_type', 'geom')
                                setValue('spatial_address', undefined)
                            }}
                            id="tabUpload"
                            className={classNames(
                                'group flex aspect-square w-full flex-col items-center justify-center rounded-sm border-b-2 border-amber-400 bg-neutral-100 shadow transition hover:bg-amber-400 md:gap-y-2'
                            )}
                        >
                            <ArrowUpTrayIcon className="h-5 w-5 text-blue-800 sm:h-9 sm:w-9" />
                            <div
                                className={classNames(
                                    'font-acumin text-xs font-normal text-black group-hover:font-bold sm:text-sm'
                                )}
                            >
                                Upload a GeoJSON file
                            </div>
                        </Tab>
                        <Tab
                            id="tabLink"
                            onClick={() => {
                                setValue(`spatial_type`, 'address')
                                setValue(`spatial`, undefined)
                            }}
                        >
                            {({ selected }) => (
                                <span
                                    className={classNames(
                                        'group flex aspect-square w-full flex-col items-center justify-center rounded-sm border-b-2 border-amber-400 bg-neutral-100 shadow transition hover:bg-amber-400 md:gap-y-2',
                                        selected ? 'bg-amber-400' : ''
                                    )}
                                >
                                    <MapPinIcon className="h-5 w-5 text-blue-800 sm:h-9 sm:w-9" />
                                    <div
                                        className={classNames(
                                            'font-acumin text-xs font-normal text-black group-hover:font-bold sm:text-sm',
                                            selected ? 'font-bold' : ''
                                        )}
                                    >
                                        Choose location
                                    </div>
                                </span>
                            )}
                        </Tab>
                        <Tab
                            id="tabLink"
                            onClick={() => {
                                setValue(`spatial_type`, 'global')
                                setValue(`spatial`, undefined)
                                setValue(`spatial_address`, 'Global')
                            }}
                        >
                            {({ selected }) => (
                                <span
                                    className={classNames(
                                        'group flex aspect-square w-full flex-col items-center justify-center rounded-sm border-b-2 border-amber-400 bg-neutral-100 shadow transition hover:bg-amber-400 md:gap-y-2',
                                        selected ? 'bg-amber-400' : ''
                                    )}
                                >
                                    <GlobeEuropeAfricaIcon className="h-5 w-5 text-blue-800 sm:h-9 sm:w-9" />
                                    <div
                                        className={classNames(
                                            'font-acumin text-xs font-normal text-black group-hover:font-bold sm:text-sm',
                                            selected ? 'font-bold' : ''
                                        )}
                                    >
                                        Global Dataset
                                    </div>
                                </span>
                            )}
                        </Tab>
                    </Tab.List>
                    <Tab.Panels as="div" className="mt-2">
                        <Tab.Panel>
                            {watch('spatial') && (
                                <Map
                                    mapboxAccessToken="pk.eyJ1IjoicmVzb3VyY2V3YXRjaCIsImEiOiJjbHNueG5idGIwOXMzMmp0ZzE1NWVjZDV1In0.050LmRm-9m60lrzhpsKqNA"
                                    style={{ height: 300 }}
                                    mapStyle="mapbox://styles/mapbox/streets-v9"
                                    initialViewState={{ zoom: 2 }}
                                >
                                    <Source
                                        type="geojson"
                                        data={watch('spatial')}
                                    >
                                        <Layer
                                            type="fill"
                                            paint={{ 'fill-color': '#F3B229' }}
                                        />
                                    </Source>
                                </Map>
                            )}
                            {isLoadingGeoJSON && (
                                <div className="w-full justify-center flex">
                                    <Spinner />
                                </div>
                            )}
                        </Tab.Panel>
                        <Tab.Panel id="choose-address">
                            <Map
                                mapboxAccessToken="pk.eyJ1IjoicmVzb3VyY2V3YXRjaCIsImEiOiJjbHNueG5idGIwOXMzMmp0ZzE1NWVjZDV1In0.050LmRm-9m60lrzhpsKqNA"
                                style={{ height: 300 }}
                                mapStyle="mapbox://styles/mapbox/streets-v9"
                            >
                                <GeocoderControl
                                    mapboxAccessToken="pk.eyJ1IjoicmVzb3VyY2V3YXRjaCIsImEiOiJjbHNueG5idGIwOXMzMmp0ZzE1NWVjZDV1In0.050LmRm-9m60lrzhpsKqNA"
                                    position="bottom-right"
                                    onResult={(e) => {
                                        setValue(
                                            'spatial_address',
                                            e?.result?.place_name
                                        )
                                    }}
                                    onClear={(e) => {
                                        setValue('spatial_address', '')
                                    }}
                                    initialValue={watch('spatial_address')}
                                />
                            </Map>
                        </Tab.Panel>
                        <Tab.Panel></Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>
            </Disclosure.Panel>
        </MetadataAccordion>
    )
}
