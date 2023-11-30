import { WriDataset } from '@/schema/ckan.schema'
import {
    ChartBarIcon,
    ExclamationCircleIcon,
    ExclamationTriangleIcon,
    GlobeAltIcon,
    TableCellsIcon,
} from '@heroicons/react/20/solid'
import {
    ArrowPathIcon,
    ClockIcon,
    MapPinIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '../_shared/Tooltip'
import Chip from '../_shared/Chip'
import { useSession } from 'next-auth/react'
import { visibilityTypeLabels } from '@/utils/constants'
import { getFormatColor, formatColors } from '@/utils/formatColors'

export default function DatasetHorizontalCard({
    dataset,
}: {
    dataset: WriDataset
}) {
    const session = useSession()

    const formats = [
        ...new Set(dataset.resources.map((r) => r.format).filter((f) => f)),
    ]

    return (
        <Link href={`/datasets/${dataset.name}`}>
            <div className="grid gap-y-3 border-b-2 border-wri-green bg-white p-5 mb-2 shadow-wri transition hover:bg-slate-100 lg:grid-cols-5">
                <div className="col-span-full lg:col-span-4">
                    <div className="pr-4">
                        <p className="font-['Acumin Pro SemiCondensed'] text-xs font-bold uppercase leading-none tracking-wide text-wri-green line-clamp-1">
                            {dataset.organization?.title.toUpperCase()}
                        </p>

                        <div className="flex items-center">
                            <h3 className="font-['Acumin Pro SemiCondensed'] mt-2 text-xl font-bold text-stone-900 line-clamp-1">
                                {dataset.title}
                            </h3>
                            {dataset.visibility_type &&
                                session.status == 'authenticated' &&
                                dataset.visibility_type != 'public' && (
                                    <Chip
                                        text={
                                            visibilityTypeLabels[
                                                dataset.visibility_type
                                            ] ?? ''
                                        }
                                    />
                                )}
                        </div>

                        <p className="font-['Acumin Pro SemiCondensed'] text-base font-light text-stone-900 h-[4.5em] line-clamp-3">
                            {dataset.short_description ?? dataset.notes}
                        </p>
                        <div className="mt-[0.33rem] flex justify-start gap-x-3">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <div className="flex flex-row items-center gap-x-1">
                                            <ArrowPathIcon className="h-3 w-3 text-blue-800" />
                                            <p className="font-['Acumin Pro SemiCondensed'] text-xs font-light leading-snug text-stone-900 sm:text-sm">
                                                {dataset.metadata_modified
                                                    ? new Date(
                                                          dataset.metadata_modified
                                                      ).toLocaleDateString(
                                                          'en-US',
                                                          {
                                                              day: 'numeric',
                                                              month: 'short',
                                                              year: 'numeric',
                                                          }
                                                      )
                                                    : ''}
                                            </p>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Last modified</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            {(dataset.temporal_coverage_start ||
                                dataset.temporal_coverage_end) && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <div className="flex items-center gap-x-1">
                                                <ClockIcon className="h-3 w-3 text-blue-800" />
                                                <p className="font-['Acumin Pro SemiCondensed'] text-xs font-light leading-snug text-stone-900 sm:text-sm">
                                                    {dataset.temporal_coverage_start ||
                                                        '?'}
                                                    {' - '}
                                                    {dataset.temporal_coverage_end ||
                                                        '?'}
                                                </p>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Temporal Coverage
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                            {dataset.spatial_address && (
                                <div className="flex items-center gap-x-1">
                                    <MapPinIcon className="h-3 w-3 text-blue-800" />
                                    <p className="font-['Acumin Pro SemiCondensed'] text-xs font-light leading-snug text-stone-900 sm:text-sm">
                                        {dataset.spatial_address}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 flex justify-start gap-x-3">
                        <div
                            className={`flex justify-start gap-x-3 ${
                                dataset.cautions || !dataset.technical_notes
                                    ? 'border-r border-black'
                                    : ''
                            } pr-3`}
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
                            <div className="rounded-full bg-stone-100 p-1 w-7 h-7">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-neutral-200">
                                            <p>Dataset contains cautions</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        )}
                        {!dataset.technical_notes && (
                            <div className="rounded-full bg-stone-100 p-1 w-7 h-7">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-neutral-200">
                                            <p>
                                                This dataset is not approved by
                                                RDI
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        )}
                    </div>
                </div>
                <div className="col-span-full w-full border-t border-stone-200 lg:col-span-1 lg:border-l lg:border-t-0">
                    <div className="flex gap-[5px] pt-3 lg:flex-col lg:pl-5 lg:pt-0">
                        {formats.slice(0, 4).map((format) => (
                            <span
                                key={`dataset-${dataset.name}-format-${format}`}
                                className={`flex h-7 w-fit items-center justify-center rounded-sm px-3 text-center text-xs font-normal text-black ${
                                    format &&
                                    format in Object.keys(formatColors)
                                        ? getFormatColor(format)
                                        : 'bg-wri-light-green'
                                }`}
                            >
                                <span className="my-auto">{format}</span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </Link>
    )
}
