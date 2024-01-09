import { Button } from '@/components/_shared/Button'
import Modal from '@/components/_shared/Modal'
import { DefaultTooltip } from '@/components/_shared/Tooltip'
import Map from '@/components/_shared/map/Map'
import { APILayerSpec } from '@/interfaces/layer.interface'
import { ActiveLayerGroup } from '@/interfaces/state.interface'
import { WriDataset } from '@/schema/ckan.schema'
import classNames from '@/utils/classnames'
import { getFormatColor } from '@/utils/formatColors'
import { useActiveLayerGroups, useRelatedDatasets } from '@/utils/storeHooks'
import {
    ChartBarIcon,
    ExclamationTriangleIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/20/solid'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { Index } from 'flexsearch'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import MapViewIcon from '../view-icons/MapViewIcon'
import TabularViewIcon from '../view-icons/TabularViewIcon'

export function RelatedDatasets() {
    const { relatedDatasets: datasets } = useRelatedDatasets()
    if (datasets.length === 0) {
        return (
            <div className="flex flex-col gap-y-4 py-2">
                No related datasets found
            </div>
        )
    }
    return (
        <div className="flex flex-col gap-y-4 py-2">
            {datasets.map((dataset: WriDataset) => (
                <DatasetCard key={`related-dataset-card-${dataset.name}`} dataset={dataset} />
            ))}
        </div>
    )
}

export default function DatasetCard({ dataset }: { dataset: WriDataset }) {
    const { activeLayerGroups, replaceLayersForLayerGroup } =
        useActiveLayerGroups()

    const activeLayerGroup = activeLayerGroups.find(
        (lg: any) => lg.datasetId == dataset.id
    )

    const activeDataFiles = dataset.resources.filter(
        (df: any) => activeLayerGroup?.layers?.includes(df.rw_id)
    )

    const activeDataFilesIds = activeDataFiles.map((df) => df.id)

    const [layers, setLayers] = useState<APILayerSpec[]>([])
    const [addDatasetModalOpen, setAddDatasetModalOpen] = useState(false)
    const [selectedDataFileIds, setSelectedDataFileIds] = useState<
        Array<string>
    >(activeDataFilesIds || [])

    useEffect(() => {
        let countdown = 10
        Promise.all(
            selectedDataFileIds.map(async (dfId) => {
                const df = dataFiles.find((df) => df.id == dfId)
                const layer = df?.url?.split('/').at(-1)
                const response = await fetch(
                    `https://api.resourcewatch.org/v1/layer/${layer}`
                )
                const layerData = await response.json()
                const { id, attributes } = layerData.data
                return {
                    id: id,
                    ...attributes,
                    layerConfig: {
                        ...attributes.layerConfig,
                        zIndex: countdown,
                        visibility:
                            layers.length > 1 ? attributes.default : true,
                    },
                    active: layers.length > 1 ? attributes.default : true,
                }
            })
        ).then((layers) => {
            setLayers(layers)
        })
    }, [selectedDataFileIds])

    const dataFiles = dataset.resources.filter((r) => r.rw_id)

    const [q, setQ] = useState('')
    const index = new Index({
        tokenize: 'full',
    })
    dataFiles?.forEach((resource) => {
        index.add(
            resource.id,
            `${resource.description} ${resource.format} ${resource.url} ${resource.name}`
        )
    })

    const filteredDatafiles =
        q !== ''
            ? dataFiles?.filter((datafile) =>
                  index.search(q).includes(datafile.id)
              )
            : dataFiles

    const created_at = new Date(dataset?.metadata_created ?? '')
    const last_updated = new Date(dataset?.metadata_modified ?? '')
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    } as const

    return (
        <div className="font-acumin gap-y-3 border-b-2 border-wri-green bg-white p-5 shadow-wri transition hover:bg-slate-100">
            <p className="font-['Acumin Pro SemiCondensed'] text-xs font-bold uppercase leading-none tracking-wide text-wri-green">
                {dataset.organization?.title ?? 'No team'}
            </p>
            <Link href={`/datasets/${dataset.name}`}>
                <h3 className="font-['Acumin Pro SemiCondensed'] mt-2 text-xl font-bold text-stone-900">
                    {dataset.title ?? dataset.name}
                </h3>
            </Link>
            <p className="font-['Acumin Pro SemiCondensed'] text-base font-light text-stone-900">
                {dataset.short_description ?? 'No description'}
            </p>
            <div className="mt-[0.33rem] flex justify-start gap-x-3">
                <div className="flex flex-row items-center gap-x-1">
                    <ArrowPathIcon className="h-3 w-3 text-blue-800" />
                    <p className="font-['Acumin Pro SemiCondensed'] text-xs font-light leading-snug text-stone-900 sm:text-sm">
                        {last_updated.toLocaleDateString('en-US', options)}
                    </p>
                </div>{' '}
                {dataset?.temporal_coverage_start ||
                dataset?.temporal_coverage_end ? (
                    <div className="flex items-center gap-x-1">
                        <p className="font-['Acumin Pro SemiCondensed'] text-xs font-light leading-snug text-stone-900 sm:text-sm">
                            {dataset?.temporal_coverage_start ?? ''} -{' '}
                            {dataset?.temporal_coverage_end ?? ''}
                        </p>
                    </div>
                ) : (
                    ''
                )}
            </div>
            <div className="mt-4 flex justify-start gap-x-3">
                <div
                    className={classNames(
                        'flex justify-start gap-x-3 pr-3',
                        dataset.cautions ? 'border-r border-black' : ''
                    )}
                >
                    {false && (
                        <div className="rounded-full bg-stone-100 p-1">
                            <ChartBarIcon className="h-5 w-5 text-blue-700" />
                        </div>
                    )}
                    <MapViewIcon dataset={dataset} />
                    <TabularViewIcon dataset={dataset} />
                </div>
                {dataset.cautions && (
                    <DefaultTooltip content="This dataset contains cautions">
                        <div className="rounded-full bg-stone-100 p-1">
                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                        </div>
                    </DefaultTooltip>
                )}
            </div>
            {dataset.resources.filter((resource) => resource.format == 'Layer')
                .length > 0 && (
                <Button
                    className="mt-4"
                    variant={
                        activeLayerGroups.some(
                            (lg: ActiveLayerGroup) => lg.datasetId == dataset.id
                        )
                            ? 'light'
                            : 'outline'
                    }
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation()
                        setAddDatasetModalOpen(true)
                    }}
                >
                    {activeLayerGroups.some(
                        (lg: ActiveLayerGroup) => lg.datasetId == dataset.id
                    )
                        ? 'Active'
                        : 'Add to map'}
                </Button>
            )}
            <Modal
                open={addDatasetModalOpen}
                setOpen={setAddDatasetModalOpen}
                className="mx-2 max-w-[1144px]"
            >
                <div className="w-full h-full flex gap-x-4 flex-wrap lg:flex-nowrap">
                    <div className="basis-full lg:basis-1/2">
                        <h2 className="text-2xl">{dataset.title}</h2>
                        <p className="text-base font-light wri-light-gray mt-2">
                            Select one or more data files to be added.
                        </p>
                        <hr className="mt-4 mb-2" />
                        <div className="relative py-4">
                            <input
                                className="block w-full rounded-md border-b border-wri-green py-3 pl-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-black focus:ring-2 focus:ring-inset focus:ring-wri-green sm:text-sm sm:leading-6"
                                placeholder="Search data files"
                                onChange={(e) => setQ(e.target.value)}
                                value={q}
                            />
                            <MagnifyingGlassIcon className="w-5 h-5 text-black absolute top-[30px] right-4" />
                        </div>
                        <div>
                            <div className="flex justify-between">
                                <span className="text-base">
                                    {filteredDatafiles.length} Data Files,{' '}
                                    {selectedDataFileIds.length} Data Files
                                    Selected
                                </span>
                                <div className="text-sm">
                                    <button
                                        className="underline mr-3"
                                        onClick={() =>
                                            setSelectedDataFileIds(
                                                dataFiles.map((df) => df.id)
                                            )
                                        }
                                    >
                                        Select All
                                    </button>
                                    <button
                                        className="underline"
                                        onClick={() =>
                                            setSelectedDataFileIds([])
                                        }
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-col mt-2 max-h-[500px] overflow-y-scroll">
                                {filteredDatafiles.map((df, i) => {
                                    return (
                                        <button
                                            className={classNames(
                                                `text-left p-5 py-6 shadow border-b-[2px] border-b-wri-green flex justify-between items-center transition-all`,
                                                selectedDataFileIds.includes(
                                                    df.id
                                                )
                                                    ? 'bg-[#EFF5F7]'
                                                    : ''
                                            )}
                                            onClick={() => {
                                                setSelectedDataFileIds(
                                                    (prev) => {
                                                        if (
                                                            prev.includes(df.id)
                                                        ) {
                                                            return [
                                                                ...prev,
                                                            ].filter(
                                                                (i) =>
                                                                    i != df.id
                                                            )
                                                        } else {
                                                            return [
                                                                ...prev,
                                                                df.id,
                                                            ]
                                                        }
                                                    }
                                                )
                                            }}
                                        >
                                            <div className="basis-4/5">
                                                <div className="flex">
                                                    {df.format && (
                                                        <span
                                                            className={classNames(
                                                                'mr-2 hidden h-7 w-fit items-center justify-center rounded-sm px-3 text-center text-xs font-normal text-black md:flex',
                                                                getFormatColor(
                                                                    df.format ??
                                                                        ''
                                                                )
                                                            )}
                                                        >
                                                            <span className="my-auto">
                                                                {df.format}
                                                            </span>
                                                        </span>
                                                    )}
                                                    <h2 className="text-lg">
                                                        {df.name}
                                                    </h2>
                                                </div>
                                                <p className="text-sm font-light mt-2">
                                                    {df.description}
                                                </p>
                                            </div>
                                            <div>
                                                {selectedDataFileIds.includes(
                                                    df.id
                                                ) && <CheckIcon />}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                            <Button
                                id="add-to-map-modal-btn"
                                onClick={() => {
                                    const layerIds = dataFiles
                                        .filter((df) =>
                                            selectedDataFileIds.includes(df.id)
                                        )
                                        .map((df) => df?.url?.split('/').at(-1))
                                        .filter((l) => l != undefined)

                                    replaceLayersForLayerGroup(
                                        // @ts-ignore
                                        layerIds,
                                        dataset.id
                                    )

                                    setAddDatasetModalOpen(false)
                                }}
                                className="float-right my-5"
                            >
                                {activeDataFilesIds.length > 0
                                    ? 'Update map'
                                    : 'Add to map'}
                            </Button>
                        </div>
                    </div>
                    <div className="basis-full lg:basis-1/2 mt-10 lg:mt-0">
                        <div className="lg:-mt-6 lg:-mr-6 h-[calc(100%+50px)]">
                            <Map
                                layers={layers}
                                showControls={false}
                                showLegends={false}
                                mapHeight="100%"
                            />
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

function CheckIcon() {
    return (
        <svg
            width="37"
            height="37"
            viewBox="0 0 37 37"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle cx="19" cy="19" r="12" fill="#58B161" />
            <path
                d="M13.875 19.6641L17.3438 23.1328L23.125 15.0391"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}
