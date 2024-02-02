import { Button } from '@/components/_shared/Button'
import Modal from '@/components/_shared/Modal'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/_shared/Popover'
import Spinner from '@/components/_shared/Spinner'
import { Resource } from '@/interfaces/dataset.interface'
import { api } from '@/utils/api'
import { convertBytes } from '@/utils/convertBytes'
import {
    ArrowDownTrayIcon,
    PaperAirplaneIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useState } from 'react'

export function DownloadButton({ datafile }: { datafile: Resource }) {
    console.log(datafile)
    const [convertTo, setConvertTo] = useState<string>()
    const [open, setOpen] = useState(false)
    const { data: signedUrl, isLoading } = api.uploads.getPresignedUrl.useQuery(
        {
            key: datafile.key as string,
        },
        { enabled: !!datafile.key }
    )

    // Resource doesn't have a file or it is layer
    // TODO: if it's a layer show other conversion options
    if (datafile.format == 'Layer' || (!datafile.key && !datafile.url)) {
        return null
    }

    const size = datafile.size
    const mode = datafile.key ? 'SIGNED_URL' : 'RES_URL'
    let originalResourceDownloadUrl: string

    if (mode == 'RES_URL' && datafile.url) {
        originalResourceDownloadUrl = datafile.url
    } else if (mode == 'SIGNED_URL' && signedUrl && !isLoading) {
        originalResourceDownloadUrl = signedUrl
    }

    const Component =
        isLoading && mode == 'SIGNED_URL' ? `span` : PopoverTrigger

    const conversibleFormats = ['CSV', 'XLSX', 'JSON', 'TSV']

    const format = datafile.format ?? ''
    const isConversible =
        datafile.datastore_active &&
        conversibleFormats.includes(format.toUpperCase())

    const conversionOptions = conversibleFormats.filter(
        (f) => f != format.toUpperCase()
    )

    const download = (url: string) => window.open(url, '_target')

    return (
        <>
            <Popover>
                <Component className="w-full flex aspect-square flex-col items-center justify-center md:gap-y-2 rounded-sm border-2 border-wri-green bg-white shadow transition hover:bg-amber-400">
                    <ArrowDownTrayIcon className="h-5 w-5 sm:h-9 sm:w-9" />
                    <div className="font-acumin text-xs sm:text-sm font-normal text-black">
                        {isLoading && mode == 'SIGNED_URL'
                            ? 'Loading'
                            : 'Download'}
                    </div>
                    {size && (
                        <div className="font-acumin text-xs sm:text-xs font-normal text-black">
                            {convertBytes(size)}
                        </div>
                    )}
                </Component>
                <PopoverContent>
                    <Button
                        className="w-full"
                        variant="ghost"
                        onClick={() => download(originalResourceDownloadUrl)}
                    >
                        Original Format{' '}
                        {mode == 'SIGNED_URL' && datafile.format
                            ? `(${datafile.format})`
                            : ''}
                    </Button>
                    {isConversible &&
                        conversionOptions.map((f) => (
                            <Button
                                variant="ghost"
                                className="w-full"
                                onClick={() => {
                                    // TODO: check if converted file is in cache
                                    const cachedUrl = ''
                                    const isCached = !!cachedUrl

                                    if (isCached) {
                                        return download(cachedUrl)
                                    }

                                    setConvertTo(f)
                                    setOpen(true)
                                }}
                            >
                                {f}
                            </Button>
                        ))}
                </PopoverContent>
            </Popover>
            <DownloadModal
                convertTo={convertTo ?? ''}
                open={open}
                setOpen={setOpen}
            />
        </>
    )
}

function DownloadModal({
    open,
    setOpen,
    convertTo,
}: {
    open: boolean
    setOpen: (open: boolean) => void
    convertTo: string
}) {
    return (
        <Modal open={open} setOpen={setOpen} className="max-w-[48rem]">
            <div className="p-6">
                <div className="border-b border-zinc-100 pb-5">
                    <div className="font-acumin text-3xl font-normal text-black">
                        This {convertTo} file is being prepared for download
                    </div>
                    <div className="font-acumin text-base font-light text-neutral-600">
                        Please enter your email address so that you receive the
                        download link via email when it's ready.
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
