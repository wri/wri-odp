import React from 'react'
import Row from '../_shared/Row'
import { RowProfilev2 } from '../_shared/RowProfile'
import type { IRowProfile } from '../_shared/RowProfile'
import { api } from '@/utils/api'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/_shared/Table'
import { User, WriDataset } from '@/schema/ckan.schema'
import { formatDate, formatDiff } from '@/utils/general'
import Spinner from '@/components/_shared/Spinner'
import { DefaultTooltip } from '@/components/_shared/Tooltip'

export type IApprovalRow = {
    dataset: string
    rowId: string
    user: IRowProfile
    date: string
    status: boolean
}

// Define an array of patterns
const patterns: RegExp[] = [
    /metadata_modified/,
    /resource\[\d+\]\.connector/,
    /modified/,
    /datastore_active/,
    /rw_id/,
    /new/,
    /preview/,
    /hash/,
    /total_record_count/,
]

// Function to test if any pattern matches the string
function matchesAnyPattern(item: string): boolean {
    return patterns.some((pattern) => pattern.test(item))
}

// a function that will return this following keys and value from Wridataset object
function filteredDataset(dataset: WriDataset) {
    return [
        {
            title: 'Title',
            description: dataset.title,
        },

        {
            title: 'Maintainer Name',
            description: dataset?.maintainer ?? '',
        },
        {
            title: 'Maintainer Email',
            description: dataset?.maintainer_email ?? '',
        },
        {
            title: 'Short description',
            description: dataset?.short_description ?? '',
        },
        {
            title: 'Technical Notes',
            description: dataset?.technical_notes ?? '',
        },
        {
            title: 'Update Frequency',
            description: dataset?.update_frequency ?? '',
        },
    ]
}

function Card({ approvalInfo }: { approvalInfo: WriDataset }) {
    const user = approvalInfo.user as User ?? { email: '', name: '' } 
    user.name = user?.email ?? user?.name ?? 'Unknown'
    user.image_display_url = user?.image_display_url
        ? user?.image_display_url
        : `https://gravatar.com/avatar/${user?.email_hash}?s=270&d=identicon`

    // the orange indicator should stand for if nay issue has being created or not
    return (
        <div className="flex flex-col sm:flex-row gap-y-3 sm:items-center  py-2 pt-4 sm:pt-2 sm:pl-6 w-full  font-normal text-[15px]">
            <div className="w-2 h-2 rounded-full  my-auto hidden sm:block"></div>
            <div className="flex items-center sm:w-[30%]  gap-x-8 ml-2 ">
                {/* <div className="flex gap-x-2">
                    {approvalInfo.status && (
                        <div className="w-2 h-2 rounded-full bg-wri-gold my-auto sm:hidden"></div>
                    )}
                    <div>{approvalInfo.rowId}</div>
                </div> */}
                <div className=" line-clamp-1"> {approvalInfo.title}</div>
            </div>
            <div className=" flex flex-col sm:flex-row ml-4 gap-y-2 sm:ml-0 sm:items-center gap-x-8 sm:w-[60%]  lg:w-1/2 sm:gap-x-6 lg:gap-x-12">
                <div className="order-last sm:order-first">
                    {' '}
                    {formatDate(approvalInfo.metadata_modified!)}
                </div>
                <div className="lg:max-w-[200px] lg:w-fit xl:max-w-fit xl:w-fit">
                    <RowProfilev2
                        profile={user}
                        imgStyle="w-8 h-8 mt-2"
                        isPad
                    />
                </div>
            </div>
        </div>
    )
}

function SubCardProfile({
    isLoading,
    diff,
    data,
}: {
    isLoading: boolean
    diff: Record<string, { old_value: string; new_value: string }>
    data: WriDataset
}) {
    if (isLoading) return <Spinner className="mx-auto my-2" />
    const diff2 = formatDiff(diff)
    return (
        <div className=" mx-auto w-4/5 my-4 max-h-[300px] overflow-auto">
            {diff &&
            Object.keys(diff).filter((x) => !matchesAnyPattern(x)).length >
                0 ? (
                <>
                    <p className="mb-3">Version Table:</p>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-neutral-50">
                                <TableHead className="font-acumin text-xs font-semibold text-black">
                                    Field Name
                                </TableHead>
                                <TableHead className="font-acumin text-xs font-semibold text-black">
                                    New value
                                </TableHead>
                                <TableHead className="font-acumin text-xs font-semibold text-black">
                                    Old value
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Object.keys(diff).filter(
                                (x) => !matchesAnyPattern(x)
                            ).length > 0 &&
                                Object.keys(diff2).map((key) => {
                                    return (
                                        <TableRow
                                            key={key}
                                            className="border-0"
                                        >
                                            <TableCell className="font-acumin text-xs font-normal text-black">
                                                {key}
                                            </TableCell>
                                            <TableCell className="font-acumin text-xs font-normal text-black">
                                                <pre>
                                                    {JSON.stringify(
                                                        diff2[key]?.new_value,
                                                        null,
                                                        2
                                                    )}
                                                </pre>
                                            </TableCell>
                                            <TableCell className="font-acumin text-xs font-normal text-black">
                                                <pre>
                                                    {JSON.stringify(
                                                        diff2[key]?.old_value,
                                                        null,
                                                        2
                                                    )}
                                                </pre>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                        </TableBody>
                    </Table>
                </>
            ) : (
                <>
                    <p className="mb-3">
                        This is a new dataset, a previous version does not
                        exist. Table shows the current values.
                    </p>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-neutral-50">
                                <TableHead className="font-acumin text-xs font-semibold text-black">
                                    Field Name
                                </TableHead>
                                <TableHead className="font-acumin text-xs font-semibold text-black">
                                    value
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredDataset(data)
                                .filter((d) => d.description !== '')
                                .map((key, index) => {
                                    return (
                                        <TableRow
                                            key={index}
                                            className="border-0"
                                        >
                                            <TableCell className="font-acumin text-xs font-normal text-black">
                                                {key.title}
                                            </TableCell>
                                            <TableCell className="font-acumin text-xs font-normal text-black">
                                                {key.description}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                        </TableBody>
                    </Table>
                </>
            )}
        </div>
    )
}

export default function ApprovalRow({
    approvalInfo,
    className,
    handleOpenModal,
}: {
    approvalInfo: WriDataset
    className: string
    handleOpenModal: (
        dataset: WriDataset,
        approvalType: 'approve' | 'reject'
    ) => void
}) {
    const { data, isLoading } = api.dataset.showPendingDiff.useQuery({
        id: approvalInfo.id,
    })

    console.log('APPROVAL INFO', approvalInfo)
    return (
        <Row
            className={`sm:pr-4 ${className ? className : ''}`}
            rowMain={<Card approvalInfo={approvalInfo} />}
            authorized={true}
            controlButtons={[
                {
                    label: 'Approve',
                    color: 'bg-wri-green hover:bg-green-500',
                    icon: <CheckIcon className="w-4 h-4 text-white" />,
                    tooltip: {
                        id: `approve-tooltip-${approvalInfo.name}`,
                        content: 'Approve dataset',
                    },
                    onClick: () => handleOpenModal(approvalInfo, 'approve'),
                },
                {
                    label: 'Reject',
                    color: 'bg-red-600 hover:bg-red-500',
                    icon: <XMarkIcon className="w-4 h-4 text-white" />,
                    tooltip: {
                        id: `delete-tooltip-${approvalInfo.name}`,
                        content: 'Reject dataset',
                    },
                    onClick: () => handleOpenModal(approvalInfo, 'reject'),
                },
            ]}
            linkButton={{
                label: 'Review',
                link: `/datasets/${approvalInfo.name}?approval=true`,
            }}
            rowSub={
                <SubCardProfile
                    isLoading={isLoading}
                    diff={data!}
                    data={approvalInfo}
                />
            }
            isDropDown
        />
    )
}
