import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import dynamic from 'next/dynamic'
const Modal = dynamic(() => import('@/components/_shared/Modal'), {
    ssr: false,
})
import { Dialog } from '@headlessui/react'
import { Dispatch, SetStateAction } from 'react'
import { Button, LoaderButton } from '@/components/_shared/Button'
import { api } from '@/utils/api'
import { toast } from 'react-toastify'
import { WriDataset } from '@/schema/ckan.schema'

export default function DeleteViewDialog({
    isOpen,
    setIsOpen,
    id,
    onDelete,
    provider,
    dataset,
}: {
    isOpen: boolean
    setIsOpen: Dispatch<SetStateAction<boolean>>
    id: string
    onDelete: () => void
    provider: 'rw' | 'datastore'
    dataset: WriDataset
}) {
    const datastoreDeleteMutation = api.dataset.deleteResourceView.useMutation()
    const rwDeleteMutation = api.rw.deleteDatasetView.useMutation()

    const handleDelete = () => {
        if (provider == 'datastore') {
            datastoreDeleteMutation.mutate(
                { id: id ?? '', ckanDatasetId: dataset.id },
                {
                    onSuccess: () => {
                        toast('View was successfully deleted', {
                            type: 'success',
                        })
                        onDelete()
                    },
                    onError: (e) => {
                        console.error(e)
                        toast('Failed to delete view', {
                            type: 'error',
                        })
                    },
                }
            )
        } else if (provider == 'rw') {
            rwDeleteMutation.mutate(
                {
                    rwDatasetId: dataset.rw_id ?? '',
                    id: id ?? '',
                    ckanDatasetId: dataset.id,
                },
                {
                    onSuccess: () => {
                        toast('View was successfully deleted', {
                            type: 'success',
                        })
                        onDelete()
                    },
                    onError: (e) => {
                        toast('Failed to delete view', {
                            type: 'error',
                        })
                    },
                }
            )
        }
    }

    return (
        <Modal
            open={isOpen}
            setOpen={setIsOpen}
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
                        Delete view
                    </Dialog.Title>
                    <div className="mt-2">
                        <p className="text-sm text-gray-500">
                            Are you sure you want to delete this view?
                        </p>
                    </div>
                </div>
            </div>
            <div className="mt-5 sm:mt-4 gap-x-4 sm:flex sm:flex-row-reverse">
                <LoaderButton
                    variant="destructive"
                    loading={false}
                    onClick={() => handleDelete()}
                >
                    Delete View
                </LoaderButton>
                <Button
                    variant="outline"
                    type="button"
                    onClick={() => setIsOpen(false)}
                >
                    Cancel
                </Button>
            </div>
        </Modal>
    )
}
