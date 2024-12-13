import { WriDataset } from '@/schema/ckan.schema'
import {
    ExclamationCircleIcon,
    ExclamationTriangleIcon,
    GlobeAltIcon,
    TableCellsIcon,
} from '@heroicons/react/20/solid'
import {
    ArrowPathIcon,
    ClockIcon,
    MapPinIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline'

import { ChevronRightIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import {
    Tooltip,
    TooltipContent,
    TooltipPortal,
    TooltipProvider,
    TooltipTrigger,
} from '../_shared/Tooltip'
import Chip from '../_shared/Chip'
import { useSession } from 'next-auth/react'
import { visibilityTypeLabels } from '@/utils/constants'
import { getFormatColor, formatColors } from '@/utils/formatColors'
import TabularViewIcon from '../datasets/view-icons/TabularViewIcon'
import MapViewIcon from '../datasets/view-icons/MapViewIcon'
import ChartViewIcon from '../datasets/view-icons/ChartViewIcon'

export default function DatasetHorizontalCard({
    dataset,
}: {
    dataset: WriDataset
}) {
    const session = useSession()

    const formats = [
        ...new Set(dataset.resources.map((r) => r.format).filter((f) => f)),
    ]

    const hasMapView = dataset?.resources?.some((r) => r.format == 'Layer')

    const hasTabularView =
        dataset?.rw_id || dataset?.resources?.some((r) => r.datastore_active)

    return (
        <div className="flex flex-col border border-[#C9C9C9] hover:border-wri-green bg-white p-5 mb-2 shadow-wri-dcard transition hover:bg-[#EFF5F7] group rounded-[4px]">
            <div className="flex flex-col lg:flex-row gap-y-2">
                <div className="flex items-center grow shrink ">
                    <h3 className="font-acumin text-[18px] font-bold leading-[28px] text-stone-900 line-clamp-1 group-hover:text-wri-green">
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

                <div className="flex lg:ml-auto gap-x-[12px]  shrink-0">
                    {formats.slice(0, 4).map((format) => (
                        <span
                            key={`dataset-${dataset.name}-format-${format}`}
                            className={` font-acumin inline-flex  w-fit items-center justify-center rounded-[9999px]  px-[12px] py-[4px] text-center text-[12px] font-bold leading-[16px] ${
                                format &&
                                Object.keys(formatColors).includes(
                                    format.toLowerCase()
                                )
                                    ? getFormatColor(format.toLowerCase())
                                    : 'bg-wri-light-green'
                            }`}
                        >
                            <span className="my-auto">{format}</span>
                        </span>
                    ))}
                </div>
            </div>

            <p className="font-acumin text-[1rem] leading-[22px] font-light text-[#1A1919] line-clamp-4 mt-[12px] w-full  h-[88px] lg:w-[733.783px] mb-[21px] ">
                {dataset.short_description ?? ''}
            </p>

            <div className="flex flex-col lg:flex-row gap-x-1.5 gap-y-2">
                <div className="flex items-center grow shrink gap-x-[16px] gap-y-[4px] flex-wrap">
                    {dataset.organization?.title && (
                        <TooltipProvider delayDuration={100}>
                            <Tooltip>
                                <TooltipTrigger>
                                    <div className="flex flex-row items-center gap-x-1">
                                        <UserGroupIcon className="h-3 w-3 text-wri-green" />
                                        <p className="font-acumin text-[14px] leading-[14px] font-normal text-[#4F4E4E] ">
                                            {dataset.organization?.title}
                                        </p>
                                    </div>
                                </TooltipTrigger>
                                <TooltipPortal>
                                    <TooltipContent>
                                        <p>Team</p>
                                    </TooltipContent>
                                </TooltipPortal>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    <TooltipProvider delayDuration={100}>
                        <Tooltip>
                            <TooltipTrigger>
                                <div className="flex flex-row items-center gap-x-1">
                                    <ArrowPathIcon className="h-3 w-3 text-wri-green" />
                                    <p className="font-acumin text-[14px] leading-[14px] font-normal text-[#4F4E4E] ">
                                        {dataset.metadata_modified
                                            ? 'Last Updated ' +
                                              new Date(
                                                  dataset.metadata_modified
                                              )
                                                  .toLocaleDateString('en-US', {
                                                      day: 'numeric',
                                                      month: 'short',
                                                      year: 'numeric',
                                                  })
                                                  .replace(
                                                      /^([a-zA-Z]+) (\d+), (\d+)$/,
                                                      '$2 $1 $3'
                                                  )
                                            : ''}
                                    </p>
                                </div>
                            </TooltipTrigger>
                            <TooltipPortal>
                                <TooltipContent>
                                    <p>Last modified</p>
                                </TooltipContent>
                            </TooltipPortal>
                        </Tooltip>
                    </TooltipProvider>
                    {(dataset.temporal_coverage_start ||
                        dataset.temporal_coverage_end) && (
                        <TooltipProvider delayDuration={100}>
                            <Tooltip>
                                <TooltipTrigger>
                                    <div className="flex flex-row items-center gap-x-1">
                                        <ClockIcon className="h-3 w-3 text-blue-800" />
                                        <p className="font-acumin flex text-[14px] leading-[14px] font-normal text-[#4F4E4E]">
                                            {dataset.temporal_coverage_start ||
                                                '?'}
                                            {' - '}
                                            {dataset.temporal_coverage_end ||
                                                '?'}
                                        </p>
                                    </div>
                                </TooltipTrigger>
                                <TooltipPortal>
                                    <TooltipContent>
                                        Temporal Coverage
                                    </TooltipContent>
                                </TooltipPortal>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
                <Link href={`/datasets/${dataset.name}`}>
                    <div className="flex justify-end lg:justify-start lg:ml-auto shrink-0 group-hover:text-wri-green">
                        <div className="text-base  leading-[24px] font-bold">
                            View dataset
                        </div>
                        <div className="pt-0.5">
                            <ChevronRightIcon className="h-4 w-4 stroke-current stroke-[3] " />
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    )
}
