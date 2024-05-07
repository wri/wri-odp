import React, { Fragment, useState } from 'react'
import TableHeader from '../_shared/TableHeader'
import {
    TrashIcon,
    EllipsisVerticalIcon,
    EnvelopeOpenIcon,
    EnvelopeIcon,
} from '@heroicons/react/24/outline'
import { Menu, Transition } from '@headlessui/react'
import { NotificationType } from '@/schema/notification.schema'
import { LoaderButton, Button } from '@/components/_shared/Button'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Dialog } from '@headlessui/react'
import notify from '@/utils/notify'
import Spinner from '@/components/_shared/Spinner'
import { api } from '@/utils/api'

import dynamic from 'next/dynamic'

const DefaultTooltip = dynamic(() => import('@/components/_shared/Tooltip'), {
    ssr: false,
})

const Modal = dynamic(() => import('@/components/_shared/Modal'), {
    ssr: false,
})

const ErrorAlert = dynamic<{ text: string; title?: string }>(
    () =>
        import('@/components/_shared/Alerts').then(
            (module) => module.ErrorAlert
        ),
    {
        ssr: false,
    }
)

function LeftNode({
    selected,
    setSelected,
    data,
}: {
    selected: string[]
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
    data: NotificationType[]
}) {
    const [openDelete, setOpenDelete] = useState(false)
    const [openMarkAsRead, setOpenMarkAsRead] = useState(false)
    const [openMarkAsUnread, setOpenMarkAsUnread] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const utils = api.useUtils()
    const UpdateNotfication = api.notification.updateNotification.useMutation({
        onSuccess: async (data) => {
            await utils.notification.getAllNotifications.invalidate()
            setSelected([])

            if (openDelete) {
                setOpenDelete(false)
                notify(`Successfully deleted the notification`, 'error')
            }
            if (openMarkAsRead) {
                setOpenMarkAsRead(false)
                notify(`Successfully marked notification as read`, 'success')
            }

            if (openMarkAsUnread) {
                setOpenMarkAsUnread(false)
                notify(`Successfully marked notification as unread`, 'success')
            }
        },
        onError: (error) => {
            setErrorMessage(error.message)
        },
    })
    return (
        <div className="relative flex flex-row items-center gap-x-3 w-full pl-10 sm:pl-12">
            <div className="flex h-6 items-center">
                <DefaultTooltip content="Select all">
                    <input
                        aria-label="select all notifications"
                        id="select_all_notifications"
                        aria-describedby="notifications-checkbox"
                        name="notifications"
                        type="checkbox"
                        className="h-4 w-4 rounded bg-white"
                        onChange={(e) => {
                            if (e.target.checked) {
                                setSelected(data.map((item) => item.id))
                            } else {
                                setSelected([])
                            }
                        }}
                    />
                </DefaultTooltip>
            </div>
            <div>
                <DefaultTooltip content="delete">
                    <button
                        aria-label="delete notification"
                        className="p-0 m-0 mt-2"
                        id="deletenotification"
                        onClick={() => setOpenDelete(true)}
                    >
                        <TrashIcon className="w-4 h-4 text-red-500" />
                    </button>
                </DefaultTooltip>
            </div>
            <div>
                <DefaultTooltip content="mark as read">
                    <button
                        aria-label="mark as read"
                        className="p-0 m-0 mt-2"
                        id="markasread_hidden"
                        onClick={() => setOpenMarkAsRead(true)}
                    >
                        <EnvelopeOpenIcon className="w-4 h-4 " />
                    </button>
                </DefaultTooltip>
            </div>
            <div>
                <DefaultTooltip content="mark as unread">
                    <button
                        aria-label="mark as read"
                        className="p-0 m-0 mt-2.5"
                        id="markasunread"
                        onClick={() => setOpenMarkAsUnread(true)}
                    >
                        <EnvelopeIcon className="w-4 h-4 " />
                    </button>
                </DefaultTooltip>
            </div>
            {/* <button
                className=""
                id="markasread_hidden"
                onClick={() => setOpenMarkAsRead(true)}
            >
                Mark as read
            </button> */}
            {errorMessage && (
                <div className="py-4">
                    <ErrorAlert text={errorMessage} />
                </div>
            )}
            {selected.length > 0 && (
                <Modal
                    open={openDelete}
                    setOpen={setOpenDelete}
                    className="sm:w-full sm:max-w-lg"
                    key="delete"
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
                                Delete Notification
                            </Dialog.Title>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    Are you sure you want to delete this
                                    Notification?
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 sm:mt-4 gap-x-4 sm:flex sm:flex-row-reverse">
                        <LoaderButton
                            variant="destructive"
                            loading={UpdateNotfication.isLoading}
                            onClick={() => {
                                let filteredData = data.filter((item) =>
                                    selected.includes(item.id)
                                )

                                filteredData = filteredData.map((n) => {
                                    delete n.object_data
                                    return n
                                })

                                UpdateNotfication.mutate({
                                    notifications: filteredData,
                                    state: 'deleted',
                                })
                            }}
                            id="deletemodalnotification"
                        >
                            Delete Notification
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
            )}
            {selected.length > 0 && (
                <Modal
                    open={openMarkAsRead}
                    setOpen={setOpenMarkAsRead}
                    className="sm:w-full sm:max-w-lg"
                    key="read"
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
                                Update Notification
                            </Dialog.Title>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    Are you sure you want to mark this
                                    Notification as read?
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 sm:mt-4 gap-x-4 sm:flex sm:flex-row-reverse">
                        <LoaderButton
                            variant="destructive"
                            loading={UpdateNotfication.isLoading}
                            onClick={() =>
                                UpdateNotfication.mutate({
                                    notifications: data.filter((item) =>
                                        selected.includes(item.id)
                                    ),
                                    is_unread: false,
                                })
                            }
                            id="readNotification"
                        >
                            Update Notification
                        </LoaderButton>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => setOpenMarkAsRead(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </Modal>
            )}
            {selected.length > 0 && (
                <Modal
                    open={openMarkAsUnread}
                    setOpen={setOpenMarkAsUnread}
                    className="sm:w-full sm:max-w-lg"
                    key="unread"
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
                                Update Notification
                            </Dialog.Title>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    Are you sure you want to mark this
                                    Notification as unread?
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 sm:mt-4 gap-x-4 sm:flex sm:flex-row-reverse">
                        <LoaderButton
                            variant="destructive"
                            loading={UpdateNotfication.isLoading}
                            onClick={() =>
                                UpdateNotfication.mutate({
                                    notifications: data.filter((item) =>
                                        selected.includes(item.id)
                                    ),
                                    is_unread: true,
                                })
                            }
                            id="unreadnotification"
                        >
                            Update Notification
                        </LoaderButton>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => setOpenMarkAsUnread(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </Modal>
            )}
        </div>
    )
}

export default function NotificationHeader({
    selected,
    setSelected,
    data,
    Pagination,
}: {
    selected: string[]
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
    data: NotificationType[]
    Pagination: React.ReactNode
}) {
    return (
        <TableHeader
            leftNode={
                <LeftNode
                    selected={selected}
                    setSelected={setSelected}
                    data={data}
                />
            }
            leftstyle="order-last sm:order-first"
            Pagination={Pagination}
        />
    )
}
