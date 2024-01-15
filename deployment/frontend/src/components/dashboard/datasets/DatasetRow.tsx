import React from 'react'
import { ArrowPathIcon, StarIcon } from '@heroicons/react/24/outline'
import Row from '../_shared/Row'
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import type { WriDataset } from '@/schema/ckan.schema'
import { formatDate } from '@/utils/general'
import { useRouter } from 'next/router'

function subFields(dataset: WriDataset) {
    return [
        {
            title: 'Status',
            description: dataset.technical_notes
                ? 'RDI Approved'
                : 'RDI Pending',
        },
        {
            title: 'Coverage Start',
            description: dataset?.temporal_coverage_start,
        },
        {
            title: 'Coverage End',
            description: dataset?.temporal_coverage_end,
        },
        {
            title: 'Short description',
            description: dataset?.short_description,
        },
        {
            title: 'Technical Notes',
            description: dataset?.technical_notes,
        },
        {
            title: 'Team',
            description: dataset?.organization?.title,
        },
    ]
}

function DatasetCardProfile({ dataset }: { dataset: WriDataset }) {
    const created = dataset?.metadata_modified ? dataset.metadata_modified : ''
    return (
        <div className="flex flex-col p-1 py-3 rounded-md pl-4 sm:pl-14">
            <p className="font-semibold text-[15px]">
                {dataset?.title ?? dataset?.name}
            </p>
            <div className="flex font-normal">
                <ArrowPathIcon className="w-3 h-3  text-[#3654A5] mt-[2px]" />
                <div className="ml-1 w-fit h-[12px] text-[12px] text-[#666666]">
                    {formatDate(created)}
                </div>
            </div>
        </div>
    )
}

function SubCardProfile({ dataset }: { dataset: WriDataset }) {
    const status = subFields(dataset)
    return (
        <div>
            <div className="ml-14  w-[90%] outline outline-1 outline-wri-gray"></div>
            <div className="grid grid-cols-2 grid-rows-4 sm:grid-cols-4 sm:grid-rows-2 gap-x-5 gap-y-2 sm:gap-y-0 px-2 pt-4  sm:pl-14 sm:pr-20 sm:pt-4">
                {status.map((item, index) => {
                    return (
                        <div key={index} className="flex flex-col">
                            <p className="font-semibold text-[15px]">
                                {item.title}
                            </p>
                            <p className="font-normal text-[14px] text-[#4B4B4B]">
                                {item.description}
                            </p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default function DatasetRow({
    className,
    dataset,
    handleOpenModal,
    authorized,
}: {
    className?: string
    dataset: WriDataset
    authorized?: boolean
    handleOpenModal: (dataset: WriDataset) => void
}) {
    const router = useRouter()
    return (
        <Row
            authorized={authorized}
            className={`pr-2 sm:pr-4 ${className ? className : ''}`}
            rowMain={<DatasetCardProfile dataset={dataset} />}
            controlButtons={[
                {
                    label: 'Edit',
                    color: 'bg-wri-gold hover:bg-yellow-400',
                    icon: <PencilSquareIcon className="w-4 h-4 text-white" />,
                    tooltip: {
                        id: `edit-tooltip-${dataset.name}`,
                        content: 'Edit dataset',
                    },
                    onClick: () => {
                        router.push(`/dashboard/datasets/${dataset.name}/edit`)
                    },
                },
                {
                    label: 'Delete',
                    color: 'bg-red-600 hover:bg-red-500',
                    icon: <TrashIcon className="w-4 h-4 text-white" />,
                    tooltip: {
                        id: `delete-tooltip-${dataset.name}`,
                        content: 'Delete dataset',
                    },
                    onClick: () => handleOpenModal(dataset),
                },
            ]}
            linkButton={{
                label: 'View dataset',
                link: `../datasets/${dataset.name}`,
            }}
            rowSub={<SubCardProfile dataset={dataset} />}
            isDropDown
        />
    )
}

export function FavouriteRow({
    className,
    dataset,
    handleOpenModal,
}: {
    className?: string
    dataset: WriDataset
    handleOpenModal: (dataset: WriDataset) => void
}) {
    return (
        <Row
            className={`pr-2 sm:pr-4  ${className ? className : ''}`}
            rowMain={<DatasetCardProfile dataset={dataset} />}
            linkButton={{
                label: 'View dataset',
                link: `../datasets/${dataset.name}`,
            }}
            controlButtons={[
                {
                    label: 'Remove from favorites',
                    color: 'bg-red-600 hover:bg-red-500',
                    icon: (
                        <StarIcon className="cursor-pointer h-4 w-4 text-white" />
                    ),
                    tooltip: {
                        id: `delete-tooltip-${dataset.name}`,
                        content: 'Remove from favorites',
                    },
                    onClick: () => handleOpenModal(dataset),
                },
            ]}
            rowSub={<SubCardProfile dataset={dataset} />}
            isDropDown
        />
    )
}

export function DraftRow({
    className,
    dataset,
    handleOpenModal,
}: {
    className?: string
    dataset: WriDataset
    handleOpenModal: (dataset: WriDataset) => void
}) {
    const router = useRouter()
    return (
        <Row
            authorized={true}
            className={`pr-2 sm:pr-4 ${className ? className : ''}`}
            rowMain={<DatasetCardProfile dataset={dataset} />}
            controlButtons={[
                {
                    label: 'Edit',
                    color: 'bg-wri-gold hover:bg-green-400',
                    icon: <PencilSquareIcon className="w-4 h-4 text-white" />,
                    tooltip: {
                        id: `delete-tooltip-${dataset.name}`,
                        content: 'Edit dataset',
                    },
                    onClick: () => {
                        router.push(`/dashboard/datasets/${dataset.name}/edit`)
                    },
                },
                {
                    label: 'Delete',
                    color: 'bg-red-600 hover:bg-red-500',
                    icon: <TrashIcon className="w-4 h-4 text-white" />,
                    tooltip: {
                        id: `delete-tooltip-${dataset.name}`,
                        content: 'Delete dataset',
                    },
                    onClick: () => handleOpenModal(dataset),
                },
            ]}
            rowSub={<SubCardProfile dataset={dataset} />}
            isDropDown
        />
    )
}
