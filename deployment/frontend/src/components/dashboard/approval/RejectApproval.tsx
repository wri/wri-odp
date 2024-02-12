import { WriDataset } from '@/schema/ckan.schema'
import React, { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import type { IssueSchemaType } from '@/schema/issue.schema'
import { IssueSchema } from '@/schema/issue.schema'
import { api } from '@/utils/api'
import notify from '@/utils/notify'
import { ErrorAlert } from '@/components/_shared/Alerts'
import { SimpleEditor } from '../../dashboard/datasets/admin/metadata/RTE/SimpleEditor'
import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, LoaderButton } from '@/components/_shared/Button'

export default function RejectApproval({
    dataset,
    setRejectOpen,
}: {
    dataset: WriDataset
    setRejectOpen: () => void
}) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const utils = api.useUtils()
    const formObj = useForm<IssueSchemaType>({
        resolver: zodResolver(IssueSchema),
        mode: 'onBlur',
        defaultValues: {
            title: '',
            description: '',
            dataset_id: dataset.id,
            owner_org: dataset.owner_org ? dataset.owner_org : null,
            creator_id: dataset.creator_user_id,
        },
    })
    const { errors } = formObj.formState

    const createIssueApi = api.dataset.createIssue.useMutation({
        onSuccess: async (data) => {
            await utils.dataset.getDatasetIssues.invalidate({
                id: dataset.name,
            })
            await utils.dataset.getPendingDatasets.invalidate({
                search: '',
                page: { start: 0, rows: 100 },
                sortBy: 'metadata_modified desc',
            })
            await utils.dataset.getPendingDatasets.invalidate({
                search: '',
                page: { start: 0, rows: 10 },
                sortBy: 'metadata_modified desc',
            })
            formObj.reset()
            setRejectOpen()
            notify(`Dataset ${dataset.title} is successfully rejected`, 'error')
        },
        onError: (error) => {
            formObj.reset()
            setErrorMessage(error.message)
            setRejectOpen()
        },
    })

    return (
        <div className="flex flex-col px-4">
            <p className="font-normal text-[1.563rem]">
                Describe the reason for rejection
            </p>
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
                <SimpleEditor
                    formObj={formObj}
                    name="description"
                    defaultValue=""
                    className="w-full h-40  border-[#E5E5E5] mt-4 "
                    placeholder="Description..."
                />
                <div className="mt-5 sm:mt-4 gap-x-4 sm:flex sm:flex-row-reverse">
                    <LoaderButton
                        variant="destructive"
                        type="submit"
                        loading={createIssueApi.isLoading}
                        id="reject"
                    >
                        {' '}
                        Reject and send feedback
                    </LoaderButton>
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => setRejectOpen()}
                    >
                        Cancel
                    </Button>
                </div>
                {errorMessage && (
                    <div className="py-4">
                        <ErrorAlert text={errorMessage} />
                    </div>
                )}
            </form>
        </div>
    )
}
