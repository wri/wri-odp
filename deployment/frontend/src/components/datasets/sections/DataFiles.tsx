import { Button } from '@/components/_shared/Button'
import classNames from '@/utils/classnames'
import { Disclosure, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import {
    ArrowPathIcon,
    FingerPrintIcon,
    MagnifyingGlassIcon,
    MapPinIcon,
} from '@heroicons/react/24/outline'
import { DownloadButton } from './datafiles/Download'
import { OpenInButton } from './datafiles/OpenIn'
import { Resource, View } from '@/interfaces/dataset.interface'
import { getFormatColor } from '@/utils/formatColors'
import { Index } from 'flexsearch'
import { useCallback, useMemo, useRef, useState } from 'react'
import { WriDataset } from '@/schema/ckan.schema'
import { useLayersFromRW } from '@/utils/queryHooks'
import { useActiveCharts, useActiveLayerGroups } from '@/utils/storeHooks'
import { TabularResource } from '../visualizations/Visualizations'
import { APIButton } from './datafiles/API'
import { Layer, Map, MapRef, Marker, Source } from 'react-map-gl'
import GeocoderControl from '@/components/search/GeocoderControl'
import { useQuery } from 'react-query'
import { UseFormReturn, useForm } from 'react-hook-form'
import { api } from '@/utils/api'
import DrawControl from '@/components/search/Draw'

export function LocationSearch({
    geojsons,
    formObj,
}: {
    geojsons: any[]
    formObj: UseFormReturn<LocationSearchFormType>
}) {
    const { setValue } = formObj
    const mapRef = useRef<MapRef | null>(null)
    const accessToken =
        'pk.eyJ1IjoicmVzb3VyY2V3YXRjaCIsImEiOiJjajFlcXZhNzcwMDBqMzNzMTQ0bDN6Y3U4In0.FRcIP_yusVaAy0mwAX1B8w'
    const { data: markers } = useQuery(
        ['markers', geojsons.length],
        async () => {
            const _markers = geojsons
                .filter((g) => g.address)
                .filter(Boolean)
                .map((g) => g.address)
            return await Promise.all(
                _markers.map(async (m) => {
                    const res = await fetch(
                        `https://api.mapbox.com/geocoding/v5/mapbox.places/${m}.json?access_token=${accessToken}&limit=1`
                    )
                    const json = await res.json()
                    return json.features[0].center
                })
            )
        }
    )

    const onUpdate = useCallback((e: any) => {
        const newFeatures = {}
        for (const f of e.features) {
            if (f.geometry.coordinates[0].length === 5) {
                setValue('point', null)
                setValue('location', '')
                setValue('bbox', [
                    f.geometry.coordinates[0][2],
                    f.geometry.coordinates[0][4],
                ])
            } else {
                setValue('bbox', null)
            }
        }
    }, [])

    return (
        <Map
            ref={(_map) => {
                if (_map) mapRef.current = _map.getMap() as unknown as MapRef
            }}
            mapboxAccessToken="pk.eyJ1IjoicmVzb3VyY2V3YXRjaCIsImEiOiJjajFlcXZhNzcwMDBqMzNzMTQ0bDN6Y3U4In0.FRcIP_yusVaAy0mwAX1B8w"
            style={{ height: 300, width: '100%' }}
            mapStyle="mapbox://styles/mapbox/streets-v9"
        >
            <GeocoderControl
                mapboxAccessToken="pk.eyJ1IjoicmVzb3VyY2V3YXRjaCIsImEiOiJjajFlcXZhNzcwMDBqMzNzMTQ0bDN6Y3U4In0.FRcIP_yusVaAy0mwAX1B8w"
                position="bottom-right"
                initialValue={formObj.getValues('location')}
                onResult={(e) => {
                    setValue('point', e.result.geometry.coordinates)
                    setValue('bbox', null)
                    setValue('location', e.result.place_name)
                }}
                onClear={(e) => {
                    setValue('point', null)
                    setValue('location', '')
                }}
            />
            {markers &&
                markers.map((m, index) => (
                    <Marker key={index} longitude={m[0]} latitude={m[1]} />
                ))}
            {geojsons
                .filter((g) => !g.address)
                .map((geojson, index) => (
                    <Source key={index} type="geojson" data={geojson}>
                        <Layer
                            type="fill"
                            paint={{ 'fill-color': '#F3B229' }}
                        />
                    </Source>
                ))}{' '}
            <DrawControl
                position="top-left"
                onClear={() => setValue('bbox', null)}
                displayControlsDefault={false}
                controls={{
                    polygon: true,
                }}
                defaultMode="draw_polygon"
                onCreate={onUpdate}
                onUpdate={onUpdate}
                onDelete={() => {
                    setValue('bbox', null)
                }}
            />
        </Map>
    )
}

interface LocationSearchFormType {
    bbox: Array<Array<number>> | null
    point: Array<number> | null
    location: string
}

export function DataFiles({
    dataset,
    index,
    setTabularResource,
    setDisplayNoPreview,
    tabularResource,
    isCurrentVersion,
    diffFields,
    mapDisplaypreview,
    setMapDisplayPreview,
}: {
    dataset: WriDataset
    index: Index
    setTabularResource: (tabularResource: TabularResource | null) => void
    setDisplayNoPreview: (displayNoPreview: boolean) => void
    setMapDisplayPreview: (mapDisplaypreview: boolean) => void
    mapDisplaypreview: boolean
    tabularResource: TabularResource | null
    isCurrentVersion?: boolean
    diffFields: Array<Record<string, { old_value: string; new_value: string }>>
}) {
    const { addLayerToLayerGroup, removeLayerFromLayerGroup } =
        useActiveLayerGroups()
    const { data: activeLayers } = useLayersFromRW()
    const datafiles = dataset?.resources
    const formObj = useForm<LocationSearchFormType>({
        defaultValues: {
            bbox: null,
            point: null,
            location: '',
        },
    })
    const { data: searchedResources, isLoading: isLoadingLocationSearch } =
        api.dataset.resourceLocationSearch.useQuery({
            ...formObj.watch(),
            package_id: dataset.name,
        })
    const [q, setQ] = useState('')
    const filteredDatafilesByName =
        q !== ''
            ? datafiles?.filter((datafile) =>
                  index.search(q).includes(datafile.id)
              )
            : datafiles
    const filteredDatafilesIds = filteredDatafilesByName?.map((df) => df.id)
    const filteredDatafiles = searchedResources
        ? searchedResources?.filter((r) => filteredDatafilesIds.includes(r.id))
        : filteredDatafilesByName

    const geojsons = useMemo(() => {
        return filteredDatafilesByName.map((df) => ({
            ...df.spatial_geom,
            address: df.spatial_address,
            id: df.id,
        }))
    }, [filteredDatafilesByName.length])
    return (
        <>
            <div className="relative py-4">
                <input
                    className="block w-full rounded-md border-b border-wri-green py-3 pl-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-black focus:ring-2 focus:ring-inset focus:ring-wri-green sm:text-sm sm:leading-6"
                    onChange={(e) => setQ(e.target.value)}
                    value={q}
                    placeholder="Search data"
                />
                <MagnifyingGlassIcon className="w-5 h-5 text-black absolute top-[30px] right-4" />
                <LocationSearch geojsons={geojsons} formObj={formObj} />
            </div>
            <div className="flex justify-between pb-1">
                <span className="font-acumin text-base font-normal text-black">
                    {filteredDatafiles?.length ?? 0} Data Files
                </span>
                <div className="flex gap-x-4">
                    <button
                        onClick={() => {
                            dataset.resources.forEach((r) => {
                                if (
                                    r.format == 'Layer' &&
                                    // @ts-ignore
                                    !activeLayers.some((l) => l.id == r?.rw_id)
                                ) {
                                    // @ts-ignore
                                    addLayerToLayerGroup(r.rw_id, dataset.id)
                                }
                            })
                        }}
                        className="font-['Acumin Pro SemiCondensed'] text-sm font-normal text-black underline"
                    >
                        Show All Layers
                    </button>
                    <button
                        className="font-['Acumin Pro SemiCondensed'] text-sm font-normal text-black underline"
                        onClick={() => {
                            dataset.resources.forEach((r) => {
                                if (r.format == 'Layer') {
                                    removeLayerFromLayerGroup(
                                        // @ts-ignore
                                        r.rw_id,
                                        dataset.id
                                    )
                                }
                            })
                        }}
                    >
                        Hide All
                    </button>
                </div>
            </div>
            <div className="flex flex-col gap-y-4">
                {isLoadingLocationSearch &&
                (formObj.watch('bbox') !== null ||
                    formObj.watch('point') !== null) ? (
                    <div className="flex h-20">
                        <svg
                            className={classNames('h-5 w-5 animate-spin mr-2')}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        Loading data
                    </div>
                ) : filteredDatafiles?.length === 0 ? (
                    <div className="flex items-center justify-center h-20">
                        <p className="font-acumin text-base font-normal text-black">
                            No data files found
                        </p>
                    </div>
                ) : (
                    <>
                        {filteredDatafiles?.map((datafile, index) => (
                            <DatafileCard
                                setMapDisplayPreview={setMapDisplayPreview}
                                mapDisplaypreview={mapDisplaypreview}
                                tabularResource={tabularResource}
                                setTabularResource={setTabularResource}
                                key={datafile.id}
                                datafile={datafile}
                                dataset={dataset}
                                diffFields={diffFields}
                                isCurrentVersion={isCurrentVersion}
                                index={index}
                            />
                        ))}
                    </>
                )}
            </div>
        </>
    )
}

function DatafileCard({
    datafile,
    dataset,
    setTabularResource,
    tabularResource,
    diffFields,
    isCurrentVersion,
    index,
    mapDisplaypreview,
    setMapDisplayPreview,
}: {
    datafile: Resource
    dataset: WriDataset
    setTabularResource: (tabularResource: TabularResource | null) => void
    tabularResource: TabularResource | null
    isCurrentVersion?: boolean
    diffFields: Array<Record<string, { old_value: string; new_value: string }>>
    index: number
    setMapDisplayPreview: (mapDisplaypreview: boolean) => void
    mapDisplaypreview: boolean
}) {
    const { activeCharts, addCharts, removeCharts } = useActiveCharts()
    const { data: activeLayers } = useLayersFromRW()
    const { removeLayerFromLayerGroup, addLayerToLayerGroup } =
        useActiveLayerGroups()

    const created_at = new Date(datafile?.created ?? '')
    const last_updated = new Date(datafile?.metadata_modified ?? '')
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    } as const

    const higlighted = (field: string, value: string) => {
        if (diffFields && !isCurrentVersion) {
            if (
                diffFields.some(
                    (diffField) =>
                        diffField[field] &&
                        diffField[field]?.new_value === value
                )
            ) {
                return 'bg-yellow-200'
            }
        }
        return ''
    }
    const newDatafile = () => {
        if (diffFields && !isCurrentVersion) {
            if (
                diffFields[index] &&
                diffFields[index]?.undefined?.old_value === null
            ) {
                return 'bg-yellow-200'
            }
        }
        return ''
    }

    return (
        <Disclosure>
            {({ open }) => (
                <div
                    className={classNames(
                        'flex flex-col gap-y-2 border-b-2 border-green-700 p-5 shadow transition hover:bg-slate-100',
                        open ? 'bg-slate-100' : '',
                        newDatafile()
                    )}
                >
                    <div
                        className={classNames(
                            'flex flex-row items-center justify-between',
                            open ? 'border-b border-neutral-400 pb-2' : ''
                        )}
                    >
                        <div className="flex items-center gap-3">
                            {datafile?.format && (
                                <span
                                    className={classNames(
                                        'hidden h-7 w-fit items-center justify-center rounded-sm px-3 text-center text-xs font-normal text-black md:flex',
                                        getFormatColor(datafile?.format ?? '')
                                    )}
                                >
                                    <span className="my-auto">
                                        {datafile.format}
                                    </span>
                                </span>
                            )}
                            <Disclosure.Button>
                                <h3
                                    className={`font-acumin sm:text-sm xl:text-lg font-semibold text-stone-900 ${
                                        datafile.title
                                            ? higlighted(
                                                  'title',
                                                  datafile.title
                                              )
                                            : higlighted('name', datafile.name!)
                                    }`}
                                >
                                    {datafile.title ?? datafile.name}
                                </h3>
                                {datafile.spatial_address && (
                                    <div className="flex items-center gap-x-1">
                                        <MapPinIcon className="h-3 w-3 text-blue-800" />
                                        <p
                                            className={`font-['Acumin Pro SemiCondensed'] text-xs font-light leading-snug text-stone-900 sm:text-sm ${higlighted(
                                                'spatial_address',
                                                datafile.spatial_address
                                            )}`}
                                        >
                                            {datafile.spatial_address}
                                        </p>
                                    </div>
                                )}
                            </Disclosure.Button>
                        </div>
                        <div className="flex gap-x-2">
                            {/* @ts-ignore */}
                            {datafile?.rw_id && (
                                <>
                                    {activeLayers.some(
                                        (a) =>
                                            datafile.url?.endsWith(a.id) ||
                                            datafile.id === a.id
                                    ) ? (
                                        <Button
                                            variant="light"
                                            size="sm"
                                            onClick={() => {
                                                {
                                                }
                                                // @ts-ignore
                                                if (datafile.rw_id) {
                                                    removeLayerFromLayerGroup(
                                                        // @ts-ignore
                                                        datafile?.rw_id,
                                                        dataset.id
                                                    )
                                                }
                                            }}
                                        >
                                            <span className="mt-1 text-xs 2xl:text-sm whitespace-nowrap">
                                                Remove Layer
                                            </span>
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                // @ts-ignore
                                                if (datafile.rw_id) {
                                                    if (!mapDisplaypreview) {
                                                        setMapDisplayPreview(
                                                            true
                                                        )
                                                    }
                                                    addLayerToLayerGroup(
                                                        // @ts-ignore
                                                        datafile.rw_id,
                                                        dataset.id
                                                    )
                                                }
                                            }}
                                        >
                                            <span className="text-xs 2xl:text-sm whitespace-nowrap">
                                                Show Layer
                                            </span>
                                        </Button>
                                    )}
                                </>
                            )}
                            {datafile.datastore_active && (
                                <>
                                    {tabularResource &&
                                    tabularResource.id === datafile.id ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setTabularResource(null)
                                            }
                                        >
                                            <span className="text-xs 2xl:text-sm whitespace-nowrap">
                                                Remove Tabular View
                                            </span>
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                setTabularResource({
                                                    provider: 'datastore',
                                                    id: datafile.id as string,
                                                    name: datafile?.title ?? datafile.name as string,
                                                })
                                            }
                                        >
                                            <span className="text-xs 2xl:text-sm whitespace-nowrap">
                                                View Table Preview
                                            </span>
                                        </Button>
                                    )}
                                </>
                            )}

                            {datafile._hasChartView && (
                                <>
                                    {datafile?._views?.some((v) =>
                                        activeCharts
                                            .map((c: View) => c.id)
                                            .includes(v.id)
                                    ) ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const viewIds =
                                                    datafile._views?.map(
                                                        (v: View) => v.id
                                                    )
                                                if (viewIds) {
                                                    removeCharts(
                                                        viewIds as string[]
                                                    )
                                                }
                                            }}
                                        >
                                            <span className="text-xs 2xl:text-sm whitespace-nowrap">
                                                Remove Chart Preview
                                            </span>
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                if (datafile._views)
                                                    addCharts(datafile._views)
                                            }}
                                        >
                                            <span className="text-xs 2xl:text-sm whitespace-nowrap">
                                                View Chart Preview
                                            </span>
                                        </Button>
                                    )}
                                </>
                            )}

                            <Disclosure.Button>
                                <ChevronDownIcon
                                    className={`${
                                        open
                                            ? 'rotate-180 transform  transition'
                                            : ''
                                    } h-5 w-5 text-stone-900`}
                                />
                            </Disclosure.Button>
                        </div>
                    </div>
                    <Transition
                        enter="transition duration-100 ease-out"
                        enterFrom="transform scale-95 opacity-0"
                        enterTo="transform scale-100 opacity-100"
                        leave="transition duration-75 ease-out"
                        leaveFrom="transform scale-100 opacity-100"
                        leaveTo="transform scale-95 opacity-0"
                    >
                        <Disclosure.Panel className="py-3">
                            <p
                                className={`font-acumin text-base font-light text-stone-900 ${
                                    datafile.description
                                        ? higlighted(
                                              'description',
                                              datafile.description
                                          )
                                        : ''
                                }`}
                            >
                                {datafile.description ?? 'No Description'}
                            </p>
                            <div className="mt-[0.33rem] flex justify-start gap-x-3">
                                <div className="flex flex-row items-center gap-x-1">
                                    <FingerPrintIcon className="h-3 w-3 text-blue-800" />
                                    <p className="text-xs font-normal leading-snug text-stone-900 sm:text-sm">
                                        {created_at.toLocaleDateString(
                                            'en-US',
                                            options
                                        )}
                                    </p>
                                </div>
                                <div className="flex items-center gap-x-1">
                                    <ArrowPathIcon className="h-3 w-3 text-blue-800" />
                                    <p className="text-xs font-normal leading-snug text-stone-900 sm:text-sm">
                                        {last_updated.toLocaleDateString(
                                            'en-US',
                                            options
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="grid max-w-[30rem] grid-cols-3 gap-x-3 py-4 ">
                                <DownloadButton datafile={datafile} />
                                {/*<LearnMoreButton datafile={datafile} dataset={dataset} />*/}
                                <OpenInButton />
                                <APIButton datafile={datafile} />
                            </div>
                        </Disclosure.Panel>
                    </Transition>
                </div>
            )}
        </Disclosure>
    )
}
