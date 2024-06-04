import {
    ArrowUpTrayIcon,
    GlobeEuropeAfricaIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/outline'
import { Disclosure, Tab } from '@headlessui/react'
import { DatasetFormType } from '@/schema/dataset.schema'
import { MapPinIcon } from '@heroicons/react/20/solid'
import { useEffect, useRef, useState } from 'react'
import classNames from '@/utils/classnames'
import { match } from 'ts-pattern'
import GeocoderControl from '@/components/search/GeocoderControl'
import { Layer, Map, Source } from 'react-map-gl'
import notify from '@/utils/notify'
import Spinner from '@/components/_shared/Spinner'
import { UseFormReturn } from 'react-hook-form'
import * as turf from '@turf/turf'

export function DatafileLocation({
    formObj,
    index,
}: {
    formObj: UseFormReturn<DatasetFormType>
    index: number
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
        const chooseAddress = document.getElementById(`choose-address-${index}`)

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
                const geojsonType = json?.type

                const geometries = []
                if (geojsonType == 'Feature') {
                    geometries.push(json.geometry)
                } else if (geojsonType == 'FeatureCollection') {
                    const features = json.features
                    for (let feature of features) {
                        geometries.push(feature.geometry)
                    }
                } else {
                    geometries.push(json)
                }

                let union = geometries[0]
                let i
                for (i = 1; i < geometries.length; i++) {
                    union = turf.union(union, geometries[i])
                }

                // union = turf.simplify(union, { tolerance: 1 })

                setValue(`resources.${index}.spatial_geom`, union)
            } catch (e) {
                console.error(e)
                notify('Failed to parse GeoJSON file', 'error')
            }
        })

        reader.readAsText(file)
    }

    return (
        <div>
            <input
                ref={uploadInputRef}
                onChange={(e) => onInputChange(e)}
                type="file"
                className="hidden"
                accept="application/geojson"
            />
            <Disclosure.Panel className="flex flex-col gap-y-8 pb-12 pt-5">
                <Tab.Group
                    selectedIndex={match(
                        watch(`resources.${index}.spatial_type`)
                    )
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
                                !watch(`resources.${index}.spatial_geom`)
                                    ? uploadInputRef.current?.click()
                                    : setValue(
                                          `resources.${index}.spatial_geom`,
                                          undefined
                                      )

                                setValue(
                                    `resources.${index}.spatial_type`,
                                    'geom'
                                )
                                setValue(
                                    `resources.${index}.spatial_address`,
                                    undefined
                                )
                                setValue(
                                    `resources.${index}.spatial_coordinates`,
                                    undefined
                                )
                            }}
                            id="locationUpload"
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
                            id="locationString"
                            onClick={() => {
                                setValue(
                                    `resources.${index}.spatial_type`,
                                    'address'
                                )
                                setValue(
                                    `resources.${index}.spatial_geom`,
                                    undefined
                                )
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
                                setValue(
                                    `resources.${index}.spatial_type`,
                                    'global'
                                )
                                setValue(
                                    `resources.${index}.spatial_geom`,
                                    undefined
                                )
                                setValue(
                                    `resources.${index}.spatial_address`,
                                    'Global'
                                )
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
                                        Global Datafile
                                    </div>
                                </span>
                            )}
                        </Tab>
                    </Tab.List>
                    <Tab.Panels as="div" className="mt-2">
                        <Tab.Panel>
                            {watch(`resources.${index}.spatial_geom`) && (
                                <Map
                                    mapboxAccessToken="pk.eyJ1IjoicmVzb3VyY2V3YXRjaCIsImEiOiJjbHNueG5idGIwOXMzMmp0ZzE1NWVjZDV1In0.050LmRm-9m60lrzhpsKqNA"
                                    style={{ height: 300 }}
                                    mapStyle="mapbox://styles/mapbox/streets-v9"
                                    initialViewState={{ zoom: 2 }}
                                >
                                    <Source
                                        type="geojson"
                                        data={watch(
                                            `resources.${index}.spatial_geom`
                                        )}
                                    >
                                        <Layer
                                            type="fill"
                                            paint={{ 'fill-color': '#BAE1BD', 'fill-opacity': 0.3 }}
                                        />
                                        <Layer
                                            type="line"
                                            paint={{
                                                'line-width': 0.5,
                                                'line-color': '#32864B'
                                            }}
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
                        <Tab.Panel id={`choose-address-${index}`}>
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
                                            `resources.${index}.spatial_address`,
                                            e?.result?.place_name
                                        )
                                        setValue(
                                            `resources.${index}.spatial_coordinates`,
                                            e?.result?.center
                                        )
                                    }}
                                    onClear={(e) => {
                                        setValue(
                                            `resources.${index}.spatial_address`,
                                            ''
                                        )
                                        setValue(
                                            `resources.${index}.spatial_coordinates`,
                                            undefined
                                        )
                                    }}
                                    initialValue={watch(
                                        `resources.${index}.spatial_address`
                                    )}
                                />
                            </Map>
                        </Tab.Panel>
                        <Tab.Panel></Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>
            </Disclosure.Panel>
        </div>
    )
}
