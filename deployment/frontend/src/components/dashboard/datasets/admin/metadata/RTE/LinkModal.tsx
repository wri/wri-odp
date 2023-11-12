import React from 'react'
import ReactModal from 'react-modal'
import * as Icons from './Icons'
import Modal from '@/components/_shared/Modal'
import { Button } from '@/components/_shared/Button'

interface IProps extends ReactModal.Props {
    url: string
    closeModal: () => void
    isOpen: boolean
    onChangeUrl: (e: React.ChangeEvent<HTMLInputElement>) => void
    onSaveLink: (e: React.MouseEvent<HTMLButtonElement>) => void
    onRemoveLink: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export function LinkModal(props: IProps) {
    const {
        url,
        isOpen,
        closeModal,
        onChangeUrl,
        onSaveLink,
        onRemoveLink,
        ...rest
    } = props
    return (
        <Modal open={isOpen} setOpen={closeModal}>
            <div className="p-6">
                <div className="border-b border-zinc-100 pb-5">
                    <div className="font-acumin text-3xl font-normal text-black">
                        Add link
                    </div>
                    <div className="font-acumin text-base font-light text-neutral-600">
                        Please enter the link you want to use
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-5 pt-6">
                    <input
                        className="block w-full rounded-md border-b border-wri-green py-1.5 pl-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-wri-green sm:text-sm sm:leading-6"
                        autoFocus
                        value={url}
                        onChange={onChangeUrl}
                        placeholder="https://google.com"
                    />
                    <Button onClick={onSaveLink} className="whitespace-nowrap">
                        Save
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
