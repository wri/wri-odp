import React, { useState } from 'react'
import {
    CheckIcon,
    XMarkIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/outline'
import Modal from '@/components/_shared/Modal'
import { useRouter } from 'next/router'
import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, LoaderButton } from '@/components/_shared/Button'
import type { IssueSchemaType } from '@/schema/issue.schema'
import { IssueSchema } from '@/schema/issue.schema'
import { api } from '@/utils/api'
import notify from '@/utils/notify'
import { ErrorAlert } from '@/components/_shared/Alerts'
import { SimpleEditor } from '../dashboard/datasets/admin/metadata/RTE/SimpleEditor'
import { Dialog } from '@headlessui/react'
import { useSession } from 'next-auth/react'
import Spinner from '../_shared/Spinner'

export default function ApprovalRequestCard({
    datasetName,
    owner_org,
    creator_id,
    datasetId,
    diffField,
}: {
    datasetName: string
    owner_org: string | null
    creator_id: string | null
    datasetId: string
    diffField: string[] | never[]
}) {
    const [open, setOpen] = useState(false)
    const [approveOpen, setApproveOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const router = useRouter()
    const { data: session } = useSession()
    const { query } = router
    const utils = api.useUtils()
    const formObj = useForm<IssueSchemaType>({
        resolver: zodResolver(IssueSchema),
        mode: 'onBlur',
        defaultValues: {
            title: '',
            description: '',
            dataset_id: datasetId,
            owner_org: owner_org,
            creator_id: creator_id,
        },
    })

    const { errors } = formObj.formState

    const { data: userIdentity, isLoading: isLoadingIUser } =
        api.user.getUserCapacity.useQuery()
    const approveDataset = api.dataset.approvePendingDataset.useMutation({
        onSuccess: async (data) => {
            await utils.dataset.getPendingDatasets.invalidate({
                search: '',
                page: { start: 0, rows: 10 },
                sortBy: 'metadata_modified desc',
            })
            await utils.dataset.showPendingDiff.invalidate({
                id: datasetId,
            })
            setApproveOpen(false)
            notify(
                `Successfully approved the dataset ${datasetName}`,
                'success'
            )
            router.push(`/dashboard/datasets`)
        },
        onError: (error) => {
            setErrorMessage(error.message)
            setApproveOpen(false)
        },
    })
    const createIssueApi = api.dataset.createIssue.useMutation({
        onSuccess: async (data) => {
            await utils.dataset.getDatasetIssues.invalidate({
                id: datasetName,
            })
            await utils.dataset.getPendingDatasets.invalidate({
                search: '',
                page: { start: 0, rows: 10 },
                sortBy: 'metadata_modified desc',
            })
            formObj.reset()
            setOpen(false)
            notify('Issue successfully created', 'success')
        },
        onError: (error) => setErrorMessage(error.message),
    })

    if (!session?.user.sysadmin && isLoadingIUser) {
        return <Spinner className="mx-auto my-2" />
    }

    if (
        !session?.user.sysadmin &&
        userIdentity &&
        !userIdentity.isOrgAdmin &&
        diffField.length === 0
    ) {
        return ''
    }

    return (
        <>
            <div className="bg-slate-100 w-full h-40 sm:h-20  flex  flex-col sm:flex-row justify-center items-center  gap-x-2 gap-y-4">
                <button
                    className="flex justify-center items-center  bg-[#58B161] rounded-md text-white font-semibold text-base px-6 py-2"
                    onClick={() => setApproveOpen(true)}
                >
                    <CheckIcon className="w-5 h-5 text-white mr-2" />
                    Approve request
                </button>
                <button
                    className="flex justify-center items-center  bg-[#DD0000] rounded-md text-white font-semibold text-base px-6 py-2"
                    onClick={() => setOpen(true)}
                >
                    <XMarkIcon className="w-5 h-5 text-white mr-2" />
                    Reject request
                </button>
            </div>
            <Modal
                open={open}
                setOpen={setOpen}
                className="w-full max-w-[22rem] sm:max-w-3xl   sm:py-14 rounded-sm "
            >
                <div className="flex flex-col px-4">
                    <p className="font-normal text-[1.563rem]">
                        Describe the reason for rejection
                    </p>
                    {/* <p className='font-normal text-base text-[#666666]'>Lorem ipsum mipsum hipsum dolor....</p> */}
                    <form
                        onSubmit={formObj.handleSubmit((data) => {
                            createIssueApi.mutate(data)
                        })}
                    >
                        <ErrorDisplay name="title" errors={errors} />
                        <input
                            id="title"
                            className="w-full h-12 bg-white rounded-sm border border-[#E5E5E5] mt-4 p-4"
                            placeholder="Title"
                            {...formObj.register('title')}
                        />
                        <ErrorDisplay name="description" errors={errors} />
                        {/* <textarea
                            id="description"
                            className="w-full h-40 bg-white rounded-sm border border-[#E5E5E5] mt-4 p-4"
                            placeholder="Description..."
                            {...formObj.register('description')}
                        /> */}
                        <SimpleEditor
                            formObj={formObj}
                            name="description"
                            defaultValue=""
                            className="w-full h-40  border-[#E5E5E5] mt-4 "
                            placeholder="Description..."
                        />
                        <div className="flex justify-end mt-4">
                            <LoaderButton
                                variant="destructive"
                                type="submit"
                                loading={createIssueApi.isLoading}
                                id="reject"
                            >
                                {' '}
                                Reject and send feedback
                            </LoaderButton>
                        </div>
                        {errorMessage && (
                            <div className="py-4">
                                <ErrorAlert text={errorMessage} />
                            </div>
                        )}
                    </form>
                </div>
            </Modal>
            <Modal
                open={approveOpen}
                setOpen={setApproveOpen}
                className="sm:w-full sm:max-w-lg"
            >
                <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <InformationCircleIcon
                            className="h-6 w-6 text-green-600"
                            aria-hidden="true"
                        />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <Dialog.Title
                            as="h3"
                            className="text-base font-semibold leading-6 text-gray-900"
                        >
                            Approve Dataset
                        </Dialog.Title>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                Are you sure you want to approve this dataset?
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 gap-x-4 sm:flex sm:flex-row-reverse">
                    <LoaderButton
                        variant="default"
                        loading={approveDataset.isLoading}
                        onClick={() => approveDataset.mutate({ id: datasetId })}
                    >
                        Approve Dataset
                    </LoaderButton>
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => setApproveOpen(false)}
                    >
                        Cancel
                    </Button>
                </div>
            </Modal>
        </>
    )
}
