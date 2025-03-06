import { Button, LoaderButton } from '@/components/_shared/Button'
import classNames from '@/utils/classnames'
import { Disclosure, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import {
    ArrowDownCircleIcon,
    ArrowPathIcon,
    FingerPrintIcon,
    GlobeAmericasIcon,
    MagnifyingGlassIcon,
    MapPinIcon,
    PaperAirplaneIcon,
    PlusCircleIcon,
} from '@heroicons/react/24/outline'
import { DownloadButton } from './datafiles/Download'
import { OpenInButton } from './datafiles/OpenIn'
import { Resource, View } from '@/interfaces/dataset.interface'
import { getFormatColor } from '@/utils/formatColors'
import { Index } from 'flexsearch'
import {
    Fragment,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import { WriDataset } from '@/schema/ckan.schema'
import { useLayersFromRW } from '@/utils/queryHooks'
import { useActiveCharts, useActiveLayerGroups } from '@/utils/storeHooks'
import { TabularResource } from '../visualizations/Visualizations'
import { APIButton } from './datafiles/API'
import {
    Layer,
    Map,
    MapLayerMouseEvent,
    MapRef,
    Marker,
    Source,
} from 'react-map-gl'
import GeocoderControl from '@/components/search/GeocoderControl'
import { useQuery } from 'react-query'
import { UseFormReturn, useForm } from 'react-hook-form'
import { api } from '@/utils/api'
import DrawControl from '@/components/search/Draw'
import DefaultTooltip from '@/components/_shared/Tooltip'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Modal from '@/components/_shared/Modal'
import Spinner from '@/components/_shared/Spinner'
import { toast } from 'react-toastify'
import { ErrorDisplay } from '@/components/_shared/InputGroup'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/_shared/Popover'
import { SearchIcon } from '@/components/_shared/icons/SearchIcon'
import GlobalError from 'next/dist/client/components/error-boundary'
import { env } from '@/env.mjs'
import { DownloadPopup } from '@/components/_shared/DownloadPopup'

function customDataLayer(data: { event: string; resource_name: string }) {
    if (env.NEXT_PUBLIC_DISABLE_HOTJAR !== 'disabled') {
        //@ts-ignore
        dataLayer.push({
            event: data.event,
            resource_name: data.resource_name,
        })
    }
}

function LocationSearch({
    geojsons,
    formObj,
    open,
    toggleDatafileToDownload,
}: {
    geojsons: any[]
    open: boolean
    formObj: UseFormReturn<LocationSearchFormType>
    toggleDatafileToDownload: (datafile: Resource) => void
}) {
    const { setValue } = formObj
    const [cursor, setCursor] = useState('grab')

    const mapRef = useRef<MapRef | null>(null)
    const accessToken =
        'pk.eyJ1IjoicmVzb3VyY2V3YXRjaCIsImEiOiJjbHNueG5idGIwOXMzMmp0ZzE1NWVjZDV1In0.050LmRm-9m60lrzhpsKqNA'
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

    // Store a reference to the geojsons by layer ID for lookup
    const layerGeojsonMap = useRef<Record<string, any>>({})

    // Set up the layer reference map whenever geojsons change
    useEffect(() => {
        const newMap: Record<string, any> = {}
        geojsons
            .filter((g) => !g.address)
            .forEach((geojson, index) => {
                const fillLayerId = `fill-layer-${index}`
                const lineLayerId = `line-layer-${index}`
                newMap[fillLayerId] = geojson
                newMap[lineLayerId] = geojson
            })
        layerGeojsonMap.current = newMap
    }, [geojsons])

    // Handle map clicks and determine if a layer was clicked
    const handleMapClick = useCallback(
        (event: MapLayerMouseEvent) => {
            if (!mapRef.current) return

            // Get the features at the clicked point
            const features = mapRef.current.queryRenderedFeatures(event.point)

            // Check if any of our layers were clicked
            if (features.length > 0) {
                const clickedLayerId = features[0]?.layer.id
                if (!clickedLayerId) return
                const geojson = layerGeojsonMap.current[clickedLayerId]

                if (geojson) {
                    console.log('Layer clicked:', geojson)
                    // Call your toggle function or other actions
                    if (geojson.datafile) {
                        toggleDatafileToDownload(geojson.datafile)
                    }
                }
            }
        },
        [toggleDatafileToDownload]
    )

    // Handle mouse movement to change cursor
    const handleMouseMove = useCallback((event: MapLayerMouseEvent) => {
        if (!mapRef.current) return

        const features = mapRef.current.queryRenderedFeatures(event.point)

        // Check if any of our layers are under the mouse
        if (features.length > 0) {
            const hoveredLayerId = features[0]?.layer.id
            if (!hoveredLayerId) return

            // If the layer ID is in our mapping, it's one of our layers
            if (layerGeojsonMap.current[hoveredLayerId]) {
                setCursor('default') // Set to default arrow cursor
            } else {
                setCursor('grab') // Set to the default map grabbing cursor
            }
        } else {
            setCursor('grab') // Default map cursor
        }
    }, [])

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

    useEffect(() => {
        if (mapRef.current && open) {
            mapRef.current.resize()
        }
    }, [mapRef.current, open])

    return (
        <Map
            ref={(_map) => {
                if (_map) mapRef.current = _map.getMap() as unknown as MapRef
            }}
            mapboxAccessToken="pk.eyJ1IjoicmVzb3VyY2V3YXRjaCIsImEiOiJjbHNueG5idGIwOXMzMmp0ZzE1NWVjZDV1In0.050LmRm-9m60lrzhpsKqNA"
            style={{ height: 300 }}
            dragRotate={false}
            touchZoomRotate={false}
            mapStyle="mapbox://styles/mapbox/streets-v9"
            onClick={handleMapClick}
            onMouseMove={handleMouseMove}
            cursor={cursor}
        >
            <GeocoderControl
                mapboxAccessToken="pk.eyJ1IjoicmVzb3VyY2V3YXRjaCIsImEiOiJjbHNueG5idGIwOXMzMmp0ZzE1NWVjZDV1In0.050LmRm-9m60lrzhpsKqNA"
                position="bottom-right"
                placeholder="Search datafiles by location"
                initialValue={formObj.getValues('location')}
                onResult={(e) => {
                    setValue('bbox', [
                        [e.result.bbox[0], e.result.bbox[1]],
                        [e.result.bbox[2], e.result.bbox[3]],
                    ])
                    setValue('point', e.result.center)
                    if (e.result.place_name.split(',').length <= 2) {
                        setValue('location', e.result.place_name)
                    }
                }}
                onClear={(e) => {
                    setValue('point', null)
                    setValue('bbox', null)
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
                            id={`fill-layer-${index}`} // Unique ID is crucial
                            type="fill"
                            paint={{
                                'fill-color':
                                    geojson.filtered || geojson.selected
                                        ? '#023020'
                                        : '#BAE1BD',
                                'fill-opacity': 0.3,
                            }}
                        />
                        <Layer
                            type="line"
                            paint={{
                                'line-width': 0.5,
                                'line-color': '#32864B',
                            }}
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
                defaultMode="simple_select"
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
    global: 'include' | 'exclude' | 'only'
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
    const [datafilesToDownload, setDatafilesToDownload] = useState<Resource[]>(
        []
    )
    const datafiles = dataset?.resources
    const formObj = useForm<LocationSearchFormType>({
        defaultValues: {
            bbox: null,
            point: null,
            location: '',
            global: 'include',
        },
    })
    const { data: searchedResources, isLoading: isLoadingLocationSearch } =
        api.dataset.resourceLocationSearch.useQuery({
            bbox: formObj.watch('bbox'),
            point: formObj.watch('point'),
            location: formObj.watch('location'),
            package_id: dataset.name,
            is_pending: false,
        })
    const [q, setQ] = useState('')
    const filteredDatafilesByName =
        q !== ''
            ? datafiles?.filter((datafile) =>
                  index.search(q).includes(datafile.id)
              )
            : datafiles
    const searchedDatafilesIds = searchedResources?.map((df) => df.id) ?? []
    let filteredDatafiles = searchedResources
        ? filteredDatafilesByName?.filter(
              (r) =>
                  searchedDatafilesIds.includes(r.id) ||
                  (formObj.watch('global') === 'include' &&
                      r.spatial_address === 'Global')
          )
        : filteredDatafilesByName
    if (formObj.watch('global') === 'exclude') {
        filteredDatafiles = filteredDatafiles.filter(
            (r) => r.spatial_address !== 'Global'
        )
    }
    if (formObj.watch('global') === 'only') {
        filteredDatafiles = filteredDatafilesByName.filter(
            (r) => r.spatial_address === 'Global'
        )
    }

    const geojsons = useMemo(() => {
        return filteredDatafilesByName
            .filter((r) => r.spatial_type !== 'global')
            .filter((r) => r.spatial_address || r.spatial_geom)
            .map((df) => ({
                ...df.spatial_geom,
                address: df.spatial_address,
                selected: datafilesToDownload.some((f) => f.id === df.id),
                filtered:
                    filteredDatafiles.length !==
                        filteredDatafilesByName.length &&
                    filteredDatafiles.some((f) => f.id === df.id),
                id: df.id,
                datafile: df,
            }))
    }, [filteredDatafilesByName, filteredDatafiles, datafilesToDownload])

    const addDatafileToDownload = (datafile: Resource) => {
        setDatafilesToDownload((prev) => [...prev, datafile])
    }
    const removeDatafileToDownload = (datafile: Resource) => {
        setDatafilesToDownload((prev) =>
            prev.filter((r) => r.id !== datafile.id)
        )
    }

    const toggleDatafileToDownload = (datafile: Resource) => {
        if (datafilesToDownload.some((f) => f.id === datafile.id)) {
            removeDatafileToDownload(datafile)
        } else {
            addDatafileToDownload(datafile)
        }
    }

    const filteredUploadedDatafiles = filteredDatafiles.filter(
        (r) => r.url_type === 'upload' || r.url_type === 'link'
    )

    const uploadedDatafiles = datafiles.filter(
        (r) => r.url_type === 'upload' || r.url_type === 'link'
    )

    const filteredDatafilesEqualToDownloadDatafiles = () => {
        return (
            datafilesToDownload.length === filteredDatafiles.length &&
            datafilesToDownload.every((r) =>
                filteredDatafiles.some((f) => f.id === r.id)
            )
        )
    }
    const downloadZipped = api.dataset.downloadZippedResources.useMutation()
    const createDownloadEvent = api.downloadEvents.createEvents.useMutation({
        onError: (err) => {
            toast('Failed to send your information', {
                type: 'error',
            })
            setOpenDownload(false)
        },
    })

    const keys = datafilesToDownload
        .map((r) => r.key ?? r.url)
        .filter(Boolean) as string[]
    const handleFormSubmit = (data: any) => {
        downloadZipped.mutate(
            {
                email: data.email,
                dataset_id: dataset.id,
                keys,
            },
            {
                onSuccess: () => {
                    const _data = {
                        ...data,
                        resources: datafilesToDownload.map((r) => r.id),
                        package_id: dataset.id ?? '',
                        typeOfForm: 'email-download',
                        package_name: dataset.title ?? dataset.name,
                    }
                    console.log('Creating download event with data:', _data)
                    createDownloadEvent.mutate(_data)
                    toast("You'll receive an email when the file is ready", {
                        type: 'success',
                    })
                    setOpenDownload(false)
                },
                onError: (err) => {
                    console.error(err)
                    toast('Failed to request file', {
                        type: 'error',
                    })
                },
            }
        )
    }
    const [openDownload, setOpenDownload] = useState(false)
    return (
        <>
            <div className="relative py-4">
                <input
                    className="block w-full rounded-t-md border-wri-green py-3 pl-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-black focus:ring-2 focus:ring-inset focus:ring-wri-green sm:text-sm sm:leading-6"
                    onChange={(e) => setQ(e.target.value)}
                    value={q}
                    placeholder="Search datafiles by title or description"
                />
                <MagnifyingGlassIcon className="w-5 h-5 text-black absolute top-[30px] right-4" />
                {dataset.is_approved && geojsons.length > 0 && (
                    <Disclosure defaultOpen={true}>
                        {({ open }) => (
                            <>
                                <Disclosure.Button as={Fragment}>
                                    <Button className="my-2 ml-auto group sm:flex items-center justify-center h-8 rounded-md gap-x-1 bg-blue-100 hover:bg-blue-800 hover:text-white text-blue-800 text-xs px-3">
                                        {open
                                            ? 'Collapse'
                                            : 'Open Filter by Location'}
                                        <GlobeAmericasIcon className="group-hover:text-white h-4 w-4 text-blue-800 mb-1" />
                                    </Button>
                                </Disclosure.Button>
                                <Disclosure.Panel
                                    unmount={false}
                                    className="pb-3 w-full"
                                >
                                    <div className="pb-3 space-y-4 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                onChange={() =>
                                                    formObj.setValue(
                                                        'global',
                                                        formObj.watch(
                                                            'global'
                                                        ) === 'only'
                                                            ? 'include'
                                                            : 'only'
                                                    )
                                                }
                                                checked={
                                                    formObj.watch('global') ===
                                                    'only'
                                                }
                                                className="h-4 w-4 rounded border-gray-300 text-gray-500 focus:ring-gray-500"
                                            />
                                            <label className="ml-3 block text-sm font-medium leading-6 text-gray-900">
                                                Only global
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                onChange={() =>
                                                    formObj.setValue(
                                                        'global',
                                                        formObj.watch(
                                                            'global'
                                                        ) === 'exclude'
                                                            ? 'include'
                                                            : 'exclude'
                                                    )
                                                }
                                                checked={
                                                    formObj.watch('global') ===
                                                    'exclude'
                                                }
                                                className="h-4 w-4 rounded border-gray-300 text-gray-500 focus:ring-gray-500"
                                            />
                                            <label className="ml-3 block text-sm font-medium leading-6 text-gray-900">
                                                Exclude global
                                            </label>
                                        </div>
                                    </div>
                                    <div
                                        className={classNames(
                                            formObj.watch('global') === 'only'
                                                ? 'hidden'
                                                : 'block'
                                        )}
                                    >
                                        <LocationSearch
                                            toggleDatafileToDownload={
                                                toggleDatafileToDownload
                                            }
                                            open={open}
                                            geojsons={geojsons}
                                            formObj={formObj}
                                        />
                                    </div>
                                </Disclosure.Panel>
                            </>
                        )}
                    </Disclosure>
                )}
            </div>
            <span className="font-acumin text-base font-normal text-black">
                {filteredDatafiles?.length ?? 0} Data Files
            </span>
            <div className="flex justify-end pb-1 lg:flex-col xl:flex-row">
                <div className="flex gap-x-4 lg:justify-end">
                    {datafiles.some(
                        (r) => r.url_type === 'upload' || r.url_type === 'link'
                    ) && (
                        <>
                            {' '}
                            {datafilesToDownload.length !==
                                uploadedDatafiles.length && (
                                <button
                                    onClick={() =>
                                        setDatafilesToDownload(
                                            uploadedDatafiles
                                        )
                                    }
                                    className="font-['Acumin Pro SemiCondensed'] text-sm font-normal text-black underline"
                                >
                                    Select all datafiles
                                </button>
                            )}
                            {!filteredDatafilesEqualToDownloadDatafiles() &&
                                datafilesToDownload.length !==
                                    uploadedDatafiles.length && (
                                    <button
                                        onClick={() =>
                                            setDatafilesToDownload(
                                                filteredUploadedDatafiles
                                            )
                                        }
                                        className="font-['Acumin Pro SemiCondensed'] text-sm font-normal text-black underline"
                                    >
                                        Select all filtered datafiles
                                    </button>
                                )}
                            {datafilesToDownload.length > 0 && (
                                <button
                                    onClick={() => setDatafilesToDownload([])}
                                    className="font-['Acumin Pro SemiCondensed'] text-sm font-normal text-black underline"
                                >
                                    Unselect all datafiles
                                </button>
                            )}
                        </>
                    )}
                    {datafiles.some(
                        (r) =>
                            r.url_type === 'layer' || r.url_type === 'layer-raw'
                    ) && (
                        <>
                            <button
                                onClick={() => {
                                    dataset.resources.forEach((r) => {
                                        if (
                                            r.format == 'Layer' &&
                                            r.rw_id &&
                                            // @ts-ignore
                                            !activeLayers.some(
                                                (l) => l.id == r?.rw_id
                                            )
                                        ) {
                                            addLayerToLayerGroup(
                                                r.rw_id ?? '',
                                                dataset.id
                                            )
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
                                Hide All Layers
                            </button>
                        </>
                    )}
                </div>
            </div>
            {datafilesToDownload.length > 0 && (
                <Button
                    onClick={() => setOpenDownload(true)}
                    className="group sm:flex items-center justify-center h-8 rounded-md gap-x-1 bg-blue-100 hover:bg-blue-800 hover:text-white text-blue-800 text-xs px-3"
                >
                    Download Selected Datafiles
                    <ArrowDownCircleIcon className="group-hover:text-white h-4 w-4 text-blue-800 mb-1" />
                </Button>
            )}
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
                                selected={datafilesToDownload.some(
                                    (r) => r.id === datafile.id
                                )}
                                addDatafileToDownload={addDatafileToDownload}
                                removeDatafileToDownload={
                                    removeDatafileToDownload
                                }
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
            <DownloadPopup
                title="The selected datafiles are being prepared for download"
                subtitle="Please enter your information so that you receive the download link via email"
                isOpen={openDownload}
                onClose={() => setOpenDownload(false)}
                dataset={dataset}
                onSubmit={handleFormSubmit}
                downloadButton={
                    <LoaderButton
                        className="whitespace-nowrap"
                        type="submit"
                        loading={downloadZipped.isLoading}
                    >
                        Submit
                    </LoaderButton>
                }
            />
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
    selected,
    addDatafileToDownload,
    removeDatafileToDownload,
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
    selected: boolean
    addDatafileToDownload: (datafile: Resource) => void
    removeDatafileToDownload: (datafile: Resource) => void
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
                            {['upload', 'link'].includes(
                                datafile.url_type ?? ''
                            ) && (
                                <DefaultTooltip content="Select to download">
                                    <input
                                        aria-label={`Select ${datafile.title}`}
                                        type="checkbox"
                                        className="h-4 w-4  rounded  bg-white "
                                        checked={selected}
                                        onChange={() => {
                                            if (selected) {
                                                removeDatafileToDownload(
                                                    datafile
                                                )
                                            } else {
                                                addDatafileToDownload(datafile)
                                            }
                                        }}
                                    />
                                </DefaultTooltip>
                            )}
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
                        <div className="gap-x-2 hidden sm:flex">
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
                                            id={`layerviews-${datafile.id}`}
                                            className="text-xs 2xl:text-sm whitespace-nowrap"
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

                                                customDataLayer({
                                                    event: 'gtm.click',
                                                    resource_name:
                                                        datafile.title ??
                                                        datafile.name!,
                                                })
                                            }}
                                        >
                                            Show Layer
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
                                            id={`tableviews-${datafile.id}`}
                                            className="text-xs 2xl:text-sm whitespace-nowrap"
                                            onClick={() => {
                                                setTabularResource({
                                                    provider: 'datastore',
                                                    datasetName:
                                                        dataset.title ??
                                                        dataset.name,
                                                    id: datafile.id as string,
                                                    name:
                                                        datafile?.title ??
                                                        (datafile.name as string),
                                                })

                                                customDataLayer({
                                                    event: 'gtm.click',
                                                    resource_name:
                                                        datafile.title ??
                                                        datafile.name!,
                                                })
                                            }}
                                        >
                                            View Table Preview
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
                                            id={`chartviews-${datafile.id}`}
                                            className="text-xs 2xl:text-sm whitespace-nowrap"
                                            data-resource={
                                                datafile.title ?? datafile.name!
                                            }
                                            onClick={() => {
                                                if (datafile._views)
                                                    addCharts(datafile._views)

                                                //@ts-ignore
                                                customDataLayer({
                                                    event: 'gtm.click',
                                                    resource_name:
                                                        datafile.title ??
                                                        datafile.name!,
                                                })
                                            }}
                                        >
                                            View Chart Preview
                                        </Button>
                                    )}
                                </>
                            )}

                            <Disclosure.Button
                                role="button"
                                aria-label="expand"
                            >
                                <ChevronDownIcon
                                    className={`${
                                        open
                                            ? 'rotate-180 transform  transition'
                                            : ''
                                    } h-5 w-5 text-stone-900`}
                                />
                            </Disclosure.Button>
                        </div>
                        <Popover>
                            <PopoverTrigger className="sm:hidden">
                                <PlusCircleIcon className="h-5 w-5 sm:h-9 sm:w-9" />
                            </PopoverTrigger>
                            <PopoverContent className="w-fit flex flex-col">
                                {datafile?.rw_id && (
                                    <>
                                        {activeLayers.some(
                                            (a) =>
                                                datafile.url?.endsWith(a.id) ||
                                                datafile.id === a.id
                                        ) ? (
                                            <Button
                                                variant="ghost"
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
                                                id={`layerviews-${datafile.id}`}
                                                className="text-xs 2xl:text-sm whitespace-nowrap"
                                                onClick={() => {
                                                    // @ts-ignore
                                                    if (datafile.rw_id) {
                                                        if (
                                                            !mapDisplaypreview
                                                        ) {
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

                                                    customDataLayer({
                                                        event: 'gtm.click',
                                                        resource_name:
                                                            datafile.title ??
                                                            datafile.name!,
                                                    })
                                                }}
                                            >
                                                Show Layer
                                            </Button>
                                        )}
                                    </>
                                )}
                                {datafile.datastore_active && (
                                    <>
                                        {tabularResource &&
                                        tabularResource.id === datafile.id ? (
                                            <Button
                                                variant="ghost"
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
                                                variant="ghost"
                                                size="sm"
                                                id={`tableviews-${datafile.id}`}
                                                className="text-xs 2xl:text-sm whitespace-nowrap"
                                                onClick={() => {
                                                    setTabularResource({
                                                        provider: 'datastore',
                                                        datasetName:
                                                            dataset.title ??
                                                            dataset.name,
                                                        id: datafile.id as string,
                                                        name:
                                                            datafile?.title ??
                                                            (datafile.name as string),
                                                    })

                                                    customDataLayer({
                                                        event: 'gtm.click',
                                                        resource_name:
                                                            datafile.title ??
                                                            datafile.name!,
                                                    })
                                                }}
                                            >
                                                View Table Preview
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
                                                variant="ghost"
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
                                                variant="ghost"
                                                size="sm"
                                                id={`chartviews-${datafile.id}`}
                                                className="text-xs 2xl:text-sm whitespace-nowrap"
                                                onClick={() => {
                                                    if (datafile._views)
                                                        addCharts(
                                                            datafile._views
                                                        )

                                                    customDataLayer({
                                                        event: 'gtm.click',
                                                        resource_name:
                                                            datafile.title ??
                                                            datafile.name!,
                                                    })
                                                }}
                                            >
                                                View Chart Preview
                                            </Button>
                                        )}
                                    </>
                                )}
                            </PopoverContent>
                        </Popover>
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
                                {datafile.url_type === 'link' ||
                                datafile.url_type === 'upload' ? (
                                    <>
                                        <DownloadButton
                                            datafile={datafile}
                                            dataset={dataset}
                                        />
                                    </>
                                ) : (
                                    <></>
                                )}
                                {/*<LearnMoreButton datafile={datafile} dataset={dataset} />*/}
                                <APIButton datafile={datafile} />
                            </div>
                        </Disclosure.Panel>
                    </Transition>
                </div>
            )}
        </Disclosure>
    )
}
