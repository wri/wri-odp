import React, { useState } from 'react'
import {
    MagnifyingGlassIcon,
    ChatBubbleLeftIcon,
    ClockIcon,
} from '@heroicons/react/24/outline'
import { Issue } from '@/schema/ckan.schema'
import { Disclosure, Transition } from '@headlessui/react'
import { Index } from 'flexsearch'
import classNames from '@/utils/classnames'
import { SimpleEditorV2 } from '@/components/dashboard/datasets/admin/metadata/RTE/SimpleEditorv2'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { CommentIssueType } from '@/schema/issue.schema'
import { CommentSchema } from '@/schema/issue.schema'
import { ErrorDisplay } from '@/components/_shared/InputGroup'
import { Button, LoaderButton } from '@/components/_shared/Button'
import { api } from '@/utils/api'
import notify from '@/utils/notify'
import Modal from '@/components/_shared/Modal'
import {
    ExclamationTriangleIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/outline'
import { Dialog } from '@headlessui/react'
import SimpleSelect from '@/components/_shared/SimpleSelect'
import { ErrorAlert } from '@/components/_shared/Alerts'

export default function Issues({
    issues,
    index,
    datasetName,
    owner_org,
    creator_id,
}: {
    issues: Issue[]
    index: Index
    datasetName: string
    owner_org: string | null
    creator_id: string | null
}) {
    const [issueState, setIssueState] = useState<'open' | 'closed'>('open')
    const [q, setQ] = useState('')
    const filteredIssues =
        q !== ''
            ? issues?.filter((issue) => index.search(q).includes(issue.id))
            : issues

    return (
        <section id="issues">
            <div className="relative pb-5">
                <input
                    onChange={(e) => setQ(e.target.value)}
                    value={q}
                    className="block w-full rounded-md border-b border-wri-green py-3 pl-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-black focus:ring-2 focus:ring-inset focus:ring-wri-green sm:text-sm sm:leading-6"
                    placeholder="Find an issue"
                />
                <MagnifyingGlassIcon className="w-5 h-5 text-black absolute top-[15px] right-4" />
            </div>
            <div className="flex flex-col gap-x-3 gap-y-3 min-h-[10rem]">
                <div className="flex flex-col sm:flex-row gap-y-3">
                    <span className="mb-1">
                        {
                            filteredIssues.filter(
                                (issue) => issue.status === issueState
                            ).length
                        }{' '}
                        Issues
                    </span>

                    <div className="ml-auto w-36 ">
                        <SimpleSelect
                            name="issuestate"
                            placeholder="Open"
                            maxWidth="xl:max-w-[28rem]"
                            options={[
                                { value: 'open', label: 'Open' },
                                { value: 'closed', label: 'Closed' },
                            ]}
                            onChange={(data) => {
                                const state = data as 'closed' | 'open'
                                setIssueState(state)
                            }}
                        />
                    </div>
                </div>

                <div className="  max-h-[60vh] overflow-auto w-full h-full flex flex-col gap-x-3 gap-y-3">
                    {filteredIssues
                        .filter((issue) => issue.status === issueState)
                        .map((issue, index) => (
                            <IssueCard
                                key={issue.number}
                                issue={issue}
                                datasetName={datasetName}
                                owner_org={owner_org}
                                creator_id={creator_id}
                            />
                        ))}
                </div>
            </div>
        </section>
    )
}

function IssueCard({
    issue,
    datasetName,
    owner_org,
    creator_id,
}: {
    issue: Issue
    datasetName: string
    owner_org: string | null
    creator_id: string | null
}) {
    const [isOpenDelete, setOpenDelete] = useState(false)
    const [isOpenClose, setOpenClose] = useState(false)
    const [isSubmitting, setIsubmiting] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const created_at = new Date(issue.created ?? '')
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    } as const
    const formObj = useForm<CommentIssueType>({
        resolver: zodResolver(CommentSchema),
        mode: 'onBlur',
        defaultValues: {
            issue_number: issue.number,
            dataset_id: datasetName,
            comment: '',
            owner_org: owner_org,
            creator_id: creator_id,
            issuetitle: issue.title,
        },
    })
    const { errors } = formObj.formState

    const utils = api.useUtils()
    const commentIssueApi = api.dataset.createIssueComment.useMutation({
        onSuccess: async (data) => {
            await utils.dataset.getDatasetIssues.invalidate({
                id: datasetName,
            })
            notify(`Comment successfully added`, 'success')
            setIsubmiting(false)
        },
        onError: (error) => {
            setIsubmiting(false)
            setErrorMessage(error.message)
        },
    })

    const closeOpenIssueApi = api.dataset.CloseOpenIssue.useMutation({
        onSuccess: async (data) => {
            await utils.dataset.getDatasetIssues.invalidate({
                id: datasetName,
            })
            setOpenClose(false)
            notify(`Issue successfully ${data}`, 'success')
        },
        onError: (error) => setErrorMessage(error.message),
    })

    const deleteIssueApi = api.dataset.deleteIssue.useMutation({
        onSuccess: async (data) => {
            await utils.dataset.getDatasetIssues.invalidate({
                id: datasetName,
            })
            setOpenDelete(false)
            notify(`Issue #${data} successfully deleted`, 'error')
        },
        onError: (error) => setErrorMessage(error.message),
    })

    const OnSubmit = (data: CommentIssueType) => {
        if (!isOpenClose && !isOpenDelete) {
            setIsubmiting(true)
            commentIssueApi.mutate(data)
            formObj.resetField('comment')
        }
    }

    return (
        <Disclosure
            as="div"
            className={classNames(
                'flex flex-col relative font-acumin gap-y-1 border-b-2 border-wri-green bg-white p-5 shadow-wri transition hover:bg-slate-100 cursor-pointer'
            )}
        >
            <Disclosure.Button as="div">
                <div className="relative">
                    <div className="flex gap-x-2">
                        <h3 className="font-semibold text-[1.125rem]">
                            {issue.title}
                        </h3>
                        {issue.status === 'closed' && (
                            <div className=" bg-red-500 text-white text-[10px] font-thin rounded-sm my-auto px-[1.5px]">
                                closed
                            </div>
                        )}
                    </div>
                    {issue.comment_count > 0 && (
                        <div className="flex absolute right-8 sm:top-[40%] gap-x-1 items-center">
                            <ChatBubbleLeftIcon className="w-5 h-5 text-blue-800" />
                            <div className=" font-normal text-base">
                                {issue.comment_count}
                            </div>
                        </div>
                    )}
                    <p
                        className="font-light text-base w-full sm:w-[80%] text-[#1A1919]"
                        dangerouslySetInnerHTML={{
                            __html: issue.description,
                        }}
                    ></p>
                    <div className="flex items-center gap-x-1 ">
                        <ClockIcon className="w-4 h-4 text-blue-800" />
                        <div className=" font-light text-[0.875rem] mt-2">
                            {' '}
                            {created_at.toLocaleDateString('en-US', options)}
                        </div>
                    </div>
                </div>
            </Disclosure.Button>
            <Transition
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
            >
                <Disclosure.Panel className="border-t border-gray-400 my-4 pt-4">
                    <p className="font-acumin text-base w-full text-[#1A1919]">
                        Comments
                    </p>
                    {issue.comments.map((comment) => (
                        <li key={comment.id} className="flex gap-x-4 pt-2">
                            <img
                                className="h-12 w-12 flex-none rounded-full bg-gray-50"
                                src={
                                    comment.user.gravatar_url ??
                                    comment.user.image_display_url ??
                                    '/images/placeholders/user/userdefault.png'
                                }
                                alt=""
                            />
                            <div className="flex-auto">
                                <div className="flex items-baseline justify-between gap-x-4">
                                    <p className="text-sm font-semibold leading-6 text-gray-900">
                                        {comment.user.display_name ??
                                            comment.user.name}
                                    </p>
                                    <p className="flex-none text-xs text-gray-600">
                                        <time dateTime={comment.created}>
                                            {new Date(
                                                comment.created
                                            ).toLocaleDateString(
                                                'en-US',
                                                options
                                            )}
                                        </time>
                                    </p>
                                </div>
                                <p
                                    className="mt-1 line-clamp-2 text-sm leading-6 text-gray-600"
                                    dangerouslySetInnerHTML={{
                                        __html: comment.comment,
                                    }}
                                ></p>
                            </div>
                        </li>
                    ))}

                    <form
                        className=" border-t-2 mt-3 pt-3 flex flex-col w-full divide-x-2"
                        onSubmit={formObj.handleSubmit(OnSubmit)}
                        id={issue.number.toString()}
                    >
                        <ErrorDisplay name="comment" errors={errors} />
                        <SimpleEditorV2
                            formObj={formObj}
                            name="comment"
                            defaultValue=""
                            isSubmitting={isSubmitting}
                        />
                        <div className="flex ml-auto gap-x-2 mt-2">
                            <Button
                                variant="destructive"
                                className="rounded-md"
                                onClick={() => {
                                    setOpenDelete(true)
                                }}
                                id={issue.id.toString()}
                            >
                                Delete
                            </Button>
                            <Button
                                className=" bg-wri-gray border-2 rounded-md"
                                onClick={() => {
                                    setOpenClose(true)
                                }}
                                id={issue.id.toString()}
                            >
                                {issue.status === 'open' ? 'Close' : 'Re-open'}
                            </Button>
                            <LoaderButton
                                loading={commentIssueApi.isLoading}
                                type="submit"
                                className="rounded-md"
                                id={issue.number.toString()}
                            >
                                Comment
                            </LoaderButton>
                        </div>
                        {errorMessage && (
                            <div className="py-4">
                                <ErrorAlert text={errorMessage} />
                            </div>
                        )}
                    </form>
                    <Modal
                        open={isOpenDelete}
                        setOpen={setOpenDelete}
                        className="sm:w-full sm:max-w-lg"
                    >
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                <ExclamationTriangleIcon
                                    className="h-6 w-6 text-red-600"
                                    aria-hidden="true"
                                />
                            </div>
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                <Dialog.Title
                                    as="h3"
                                    className="text-base font-semibold leading-6 text-gray-900"
                                >
                                    Delete Issue
                                </Dialog.Title>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        Are you sure you want to delete this
                                        Issue?
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-5 sm:mt-4 gap-x-4 sm:flex sm:flex-row-reverse">
                            <LoaderButton
                                variant="destructive"
                                loading={deleteIssueApi.isLoading}
                                onClick={() => {
                                    deleteIssueApi.mutate(formObj.getValues())
                                }}
                                id={issue.number.toString()}
                            >
                                Delete Issue
                            </LoaderButton>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setOpenDelete(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </Modal>
                    <Modal
                        open={isOpenClose}
                        setOpen={setOpenClose}
                        className="sm:w-full sm:max-w-lg"
                    >
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                {issue.status === 'open' ? (
                                    <ExclamationTriangleIcon
                                        className="h-6 w-6 text-red-600"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <InformationCircleIcon
                                        className="h-6 w-6 text-green-600"
                                        aria-hidden="true"
                                    />
                                )}
                            </div>
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                <Dialog.Title
                                    as="h3"
                                    className="text-base font-semibold leading-6 text-gray-900"
                                >
                                    {issue.status === 'open'
                                        ? 'Close'
                                        : 'Re-open'}{' '}
                                    Issue
                                </Dialog.Title>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        Are you sure you want to{' '}
                                        {issue.status === 'open'
                                            ? 'close'
                                            : 're-open'}{' '}
                                        this Issue?
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-5 sm:mt-4 gap-x-4 sm:flex sm:flex-row-reverse">
                            <LoaderButton
                                variant={
                                    issue.status === 'open'
                                        ? 'destructive'
                                        : 'light'
                                }
                                loading={closeOpenIssueApi.isLoading}
                                onClick={() => {
                                    if (
                                        formObj.getValues('comment').trim() !==
                                        ''
                                    ) {
                                        const payload = {
                                            ...formObj.getValues(),
                                            status:
                                                issue.status === 'open'
                                                    ? 'closed'
                                                    : 'open',
                                        }

                                        closeOpenIssueApi.mutate(payload)
                                    } else {
                                        // Handle the case when the 'comment' field is empty
                                        formObj.setError('comment', {
                                            type: 'manual',
                                            message:
                                                'Comment must not be empty',
                                        })
                                        setOpenClose(false)
                                    }
                                }}
                                id={issue.number.toString()}
                            >
                                {issue.status === 'open' ? 'Close' : 'Re-open'}{' '}
                                Issue
                            </LoaderButton>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setOpenClose(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </Modal>
                </Disclosure.Panel>
            </Transition>
        </Disclosure>
    )
}
