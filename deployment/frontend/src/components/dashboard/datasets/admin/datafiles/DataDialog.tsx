import { Button, LoaderButton } from '@/components/_shared/Button'
import Modal from '@/components/_shared/Modal'
import { CodeEditor } from '@/components/dashboard/_shared/CodeEditor'
import { Dialog } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Dispatch, SetStateAction } from 'react'

export default function DataDialog({
    isOpen,
    setIsOpen,
    sql,
}: {
    isOpen: boolean
    setIsOpen: Dispatch<SetStateAction<boolean>>
    sql: string
}) {
    return (
        <Modal
            open={isOpen}
            setOpen={setIsOpen}
            className="sm:w-full sm:max-w-3xl"
        >
            <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-gray-900"
                    >
                        Data
                    </Dialog.Title>
                    <div className="mt-2">
                        <p>{sql}</p>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
