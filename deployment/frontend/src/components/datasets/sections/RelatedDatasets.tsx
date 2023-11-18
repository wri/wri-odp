import { Button } from '@/components/_shared/Button'
import Modal from '@/components/_shared/Modal'
import classNames from '@/utils/classnames'
import {
    ChartBarIcon,
    ExclamationTriangleIcon,
    GlobeAltIcon,
    MagnifyingGlassIcon,
    TableCellsIcon,
} from '@heroicons/react/20/solid'
import {
    ArrowPathIcon,
    ClockIcon,
    MapPinIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import Map from '@/components/_shared/map/Map'
import Link from 'next/link'
import { WriDataset } from '@/schema/ckan.schema'
import { getFormatColor } from '@/utils/formatColors'
import { DefaultTooltip } from '@/components/_shared/Tooltip'

export function RelatedDatasets({
    datasets,
    original,
}: {
    datasets: WriDataset[]
    original: string
}) {
    if (datasets.length === 0) {
        return (
            <div className="flex flex-col gap-y-4 py-2">
                No related datasets found
            </div>
        )
    }
    return (
        <div className="flex flex-col gap-y-4 py-2">
            {datasets.map((dataset) => (
                <DatasetCard
                    key={dataset.name}
                    dataset={dataset}
                    original={original}
                />
            ))}
        </div>
    )
}

export default function DatasetCard({
    dataset,
    original,
}: {
    dataset: WriDataset
    original?: string
}) {
    const [addDatasetModalOpen, setAddDatasetModalOpen] = useState(false)
    const [selectedDataFileNames, setSelectedDataFileNames] = useState<
        Array<string>
    >([])

    const dataFiles = [...new Array(20).keys()].map((i) => ({
        name: `data-file-${i}`,
        title: `Data File ${i}`,
        format: `TIFF`,
        description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam porta sem malesuada magna mollis euismod. Aenean lacinia.`,
    }))

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
            <Link
                href={`/datasets/${dataset.name}`}
            >
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
                    (dataset?.temporal_coverage_end ? (
                        <div className="flex items-center gap-x-1">
                            <ClockIcon className="h-3 w-3 text-blue-800" />
                            <p className="font-['Acumin Pro SemiCondensed'] text-xs font-light leading-snug text-stone-900 sm:text-sm">
                                `${dataset?.temporal_coverage_start ?? ''} - $
                                {dataset?.temporal_coverage_end ?? ''}`
                            </p>
                        </div>
                    ) : null)}
            </div>
            <div className="mt-4 flex justify-start gap-x-3">
                <div
                    className={classNames(
                        'flex justify-start gap-x-3 pr-3',
                        dataset.cautions ? 'border-r border-black' : ''
                    )}
                >
                    <div className="rounded-full bg-stone-100 p-1">
                        <ChartBarIcon className="h-5 w-5 text-blue-700" />
                    </div>
                    <div className="rounded-full bg-stone-100 p-1">
                        <GlobeAltIcon className="h-5 w-5 text-emerald-700" />
                    </div>
                    <div className="rounded-full bg-stone-100 p-1">
                        <TableCellsIcon className="h-5 w-5 text-green-600" />
                    </div>
                </div>
                {dataset.cautions && (
                    <DefaultTooltip content="This dataset contains cautions">
                        <div className="rounded-full bg-stone-100 p-1">
                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                        </div>
                    </DefaultTooltip>
                )}
            </div>
            {dataset.resources.filter(
                (resource) => resource.url_type === 'layer'
            ).length > 0 && (
                <Button
                    className="mt-4"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation()
                        setAddDatasetModalOpen(true)
                    }}
                >
                    Add to map
                </Button>
            )}
            <Modal
                open={addDatasetModalOpen}
                setOpen={setAddDatasetModalOpen}
                className="mx-2 max-w-[1144px]"
            >
                <div className="w-full h-full flex gap-x-4 flex-wrap lg:flex-nowrap">
                    <div className="basis-full lg:basis-1/2">
                        <h2 className="text-2xl">{'<Name of Dataset>'}</h2>
                        <p className="text-base font-light wri-light-gray mt-2">
                            Select one or more data files to be added.
                        </p>
                        <hr className="mt-4 mb-2" />
                        <div className="relative py-4">
                            <input
                                className="block w-full rounded-md border-b border-wri-green py-3 pl-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-black focus:ring-2 focus:ring-inset focus:ring-wri-green sm:text-sm sm:leading-6"
                                placeholder="Search data files"
                            />
                            <MagnifyingGlassIcon className="w-5 h-5 text-black absolute top-[30px] right-4" />
                        </div>
                        <div>
                            <div className="flex justify-between">
                                <span className="text-base">
                                    {dataFiles.length} Data Files,{' '}
                                    {selectedDataFileNames.length} Data Files
                                    Selected
                                </span>
                                <div className="text-sm">
                                    <button
                                        className="underline mr-3"
                                        onClick={() =>
                                            setSelectedDataFileNames(
                                                dataFiles.map((df) => df.name)
                                            )
                                        }
                                    >
                                        Select All
                                    </button>
                                    <button
                                        className="underline"
                                        onClick={() =>
                                            setSelectedDataFileNames([])
                                        }
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-col mt-2 max-h-[500px] overflow-y-scroll">
                                {dataFiles.map((df, i) => {
                                    return (
                                        <button
                                            className={classNames(
                                                `text-left p-5 py-6 shadow border-b-[2px] border-b-wri-green flex justify-between items-center transition-all`,
                                                selectedDataFileNames.includes(
                                                    df.name
                                                )
                                                    ? 'bg-[#EFF5F7]'
                                                    : ''
                                            )}
                                            onClick={() => {
                                                setSelectedDataFileNames(
                                                    (prev) => {
                                                        if (
                                                            prev.includes(
                                                                df.name
                                                            )
                                                        ) {
                                                            return [
                                                                ...prev,
                                                            ].filter(
                                                                (i) =>
                                                                    i != df.name
                                                            )
                                                        } else {
                                                            return [
                                                                ...prev,
                                                                df.name,
                                                            ]
                                                        }
                                                    }
                                                )
                                            }}
                                        >
                                            <div className="basis-4/5">
                                                <div className="flex">
                                                    <span
                                                        className={classNames(
                                                            'mr-2 hidden h-7 w-fit items-center justify-center rounded-sm px-3 text-center text-xs font-normal text-black md:flex',
                                                            getFormatColor(
                                                                df.format
                                                            )
                                                        )}
                                                    >
                                                        <span className="my-auto">
                                                            {df.format}
                                                        </span>
                                                    </span>
                                                    <h2 className="text-lg">
                                                        {df.title}
                                                    </h2>
                                                </div>
                                                <p className="text-sm font-light mt-2">
                                                    {df.description}
                                                </p>
                                            </div>
                                            <div>
                                                {selectedDataFileNames.includes(
                                                    df.name
                                                ) && <CheckIcon />}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                            <Button className="float-right my-5">
                                Add to map
                            </Button>
                        </div>
                    </div>
                    <div className="basis-full lg:basis-1/2 mt-10 lg:mt-0">
                        <div className="lg:-mt-6 lg:-mr-6 h-[calc(100%+50px)]">
                            <Map
                                layers={[]}
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
