import { Button } from '@/components/_shared/Button'
import Modal from '@/components/_shared/Modal'
import Spinner from '@/components/_shared/Spinner'
import { Resource } from '@/interfaces/dataset.interface'
import { api } from '@/utils/api'
import { convertBytes } from '@/utils/convertBytes'
import {
    ArrowDownTrayIcon,
    PaperAirplaneIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'

export function DownloadButton({ datafile }: { datafile: Resource }) {
    console.log(datafile)
    const [open, setOpen] = useState(false)
    const { data: signedUrl, isLoading } = api.uploads.getPresignedUrl.useQuery(
        {
            key: datafile.key as string,
        },
        { enabled: !!datafile.key }
    )
    if (datafile.key && isLoading) {
        return (
            <span
                className="w-full flex aspect-square flex-col items-center justify-center md:gap-y-2 rounded-sm border-2 border-wri-green bg-white shadow transition hover:bg-amber-400"
            >
                <Spinner className="h-5 w-5 sm:h-9 sm:w-9" />
                <div className="font-acumin text-xs sm:text-sm font-normal text-black">
                    Loading Link
                </div>
                {datafile.size && (
                    <div className="font-acumin text-xs sm:text-xs font-normal text-black">
                        {convertBytes(datafile.size)}
                    </div>
                )}
            </span>
        )
    }
    if (signedUrl && !isLoading) {
        return (
            <a
                href={signedUrl}
                className="w-full flex aspect-square flex-col items-center justify-center md:gap-y-2 rounded-sm border-2 border-wri-green bg-white shadow transition hover:bg-amber-400"
            >
                <ArrowDownTrayIcon className="h-5 w-5 sm:h-9 sm:w-9" />
                <div className="font-acumin text-xs sm:text-sm font-normal text-black">
                    Download
                </div>
                {datafile.size && (
                    <div className="font-acumin text-xs sm:text-xs font-normal text-black">
                        {convertBytes(datafile.size)}
                    </div>
                )}
            </a>
        )
    }
    if (!datafile.key && datafile.url) {
        return (
            <a
                href={datafile.url}
                className="w-full flex aspect-square flex-col items-center justify-center md:gap-y-2 rounded-sm border-2 border-wri-green bg-white shadow transition hover:bg-amber-400"
            >
                <ArrowDownTrayIcon className="h-5 w-5 sm:h-9 sm:w-9" />
                <div className="font-acumin text-xs sm:text-sm font-normal text-black">
                    Download
                </div>
                {datafile.size && (
                    <div className="font-acumin text-xs sm:text-xs font-normal text-black">
                        {convertBytes(datafile.size)}
                    </div>
                )}
            </a>
        )
    }
    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="w-full flex aspect-square flex-col items-center justify-center md:gap-y-2 rounded-sm border-2 border-wri-green bg-white shadow transition hover:bg-amber-400"
            >
                <ArrowDownTrayIcon className="h-5 w-5 sm:h-9 sm:w-9" />
                <div className="font-acumin text-xs sm:text-sm font-normal text-black">
                    Download
                </div>
                {datafile.size && (
                    <div className="font-acumin text-xs sm:text-xs font-normal text-black">
                        {convertBytes(datafile.size)}
                    </div>
                )}
            </button>
            <DownloadModal open={open} setOpen={setOpen} />
        </>
    )
}

function DownloadModal({
    open,
    setOpen,
}: {
    open: boolean
    setOpen: (open: boolean) => void
}) {
    return (
        <Modal open={open} setOpen={setOpen} className="max-w-[48rem]">
            <div className="p-6">
                <div className="border-b border-zinc-100 pb-5">
                    <div className="font-acumin text-3xl font-normal text-black">
                        The file you are about to download is 1.8 GB.
                    </div>
                    <div className="font-acumin text-base font-light text-neutral-600">
                        Please enter your email address so that you receive it
                        via email.
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-5 pt-6">
                    <input
                        type="email"
                        name="email"
                        id="email"
                        className="block w-full rounded-md border-b border-wri-green py-1.5 pl-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-wri-green sm:text-sm sm:leading-6"
                        placeholder="you@example.com"
                    />
                    <Button className="whitespace-nowrap">
                        <PaperAirplaneIcon className="mr-2 h-5 w-5" />
                        Get via email
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
