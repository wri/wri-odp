import { Button, LoaderButton } from '@/components/_shared/Button'
import dynamic from 'next/dynamic'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/_shared/Popover'
import { Resource } from '@/interfaces/dataset.interface'
import { api } from '@/utils/api'
import { convertBytes } from '@/utils/convertBytes'
import {
    ArrowDownTrayIcon,
    ArrowTopRightOnSquareIcon,
    LinkIcon,
    PaperAirplaneIcon,
} from '@heroicons/react/24/outline'
import { env } from '@/env.mjs'
import { useState } from 'react'
import { toast } from 'react-toastify'
import {
    DirectDownloadPopup,
    DownloadEventForm,
    DownloadPopup,
} from '@/components/_shared/DownloadPopup'
import { WriDataset } from '@/schema/ckan.schema'

export function DownloadButton({
    datafile,
    dataset,
}: {
    datafile: Resource
    dataset: WriDataset
}) {
    const [convertTo, setConvertTo] = useState<'CSV' | 'XLSX' | 'TSV' | 'XML'>()
    const [open, setOpen] = useState(false)
    const { data: signedUrl, isLoading } = api.uploads.getPresignedUrl.useQuery(
        {
            key: datafile.key as string,
        },
        { enabled: !!datafile.key }
    )
    const createDownloadEvent = api.downloadEvents.createEvents.useMutation({
        onSuccess: () => {
            window.open(pendingDownloadUrl, '_target')
            setShowDownloadForm(false)
        },
        onError: (err) => {
            toast('Failed to send your information', {
                type: 'error',
            }),
                window.open(pendingDownloadUrl, '_target')
            setShowDownloadForm(false)
        },
    })

    const size = datafile.size
    const mode = datafile.key ? 'SIGNED_URL' : 'RES_URL'
    let originalResourceDownloadUrl: string

    if (mode == 'RES_URL' && datafile.url) {
        originalResourceDownloadUrl = datafile.url
        if (originalResourceDownloadUrl.includes('data-api')) {
            originalResourceDownloadUrl += `&x-api-key=${env.NEXT_PUBLIC_GFW_API_KEY}`
        }
    } else if (mode == 'SIGNED_URL' && signedUrl && !isLoading) {
        originalResourceDownloadUrl = signedUrl
    }

    const Component =
        isLoading && mode == 'SIGNED_URL' ? `span` : PopoverTrigger

    const conversibleTabularFormats = ['CSV', 'XLSX', 'JSON', 'TSV', 'XML']
    const conversibleSpatialFormats = ['GeoJSON', 'KML', 'SHP']

    const format = datafile.format ?? ''
    const isConversibleTabular =
        datafile.datastore_active &&
        conversibleTabularFormats.includes(format.toUpperCase())
    const isConversibleVector = datafile.format == 'Layer'

    const tabularConversionOptions = conversibleTabularFormats.filter(
        (f) => f != format.toUpperCase()
    )
    const requestDatafileConversionMutation =
        api.dataset.requestDatafileConversion.useMutation()

    const [showDownloadForm, setShowDownloadForm] = useState(false)
    const [pendingDownloadUrl, setPendingDownloadUrl] = useState<string>('')

    const download = (url: string, isOriginalFormat = false) => {
        if (isOriginalFormat) {
            setPendingDownloadUrl(url)
            setShowDownloadForm(true)
        } else {
            window.open(url, '_target')
        }
    }

    const handleFormSubmit = (data: DownloadEventForm) => {
        const _data = {
            ...data,
            resources: [datafile.id],
            package_id: datafile.package_id ?? '',
            acceptTerms: true,
            typeOfForm: 'direct-download' as any,
            package_name: `${dataset.name}: ${datafile.title ?? datafile.name}`,
        }
        createDownloadEvent.mutate(_data)
    }

    let sql = `SELECT * FROM "${datafile.id}"`
    const handleFormSubmitConvertion = (data: any) => {
        const _data = {
            ...data,
            resources: [datafile.id],
            package_id: datafile.package_id ?? '',
            package_name: datafile.title ?? datafile.name!,
            typeOfForm: 'email-download' as any,
        }
        requestDatafileConversionMutation.mutate(
            {
                email: data.email,
                format: convertTo ?? 'CSV',
                // @ts-ignore
                rw_id: datafile?.layerObj?.dataset ?? '',
                provider: datafile.rw_id ? 'rw' : 'datastore',
                sql: sql,
                resource_id: datafile.id,
                carto_account: '',
            },
            {
                onSuccess: () => {
                    toast("You'll receive an email when the file is ready", {
                        type: 'success',
                    })
                    createDownloadEvent.mutate(_data)

                    setOpen(false)
                },
                onError: (err) => {
                    console.error(err)

                    toast('Failed to request file', {
                        type: 'error',
                    })
                },
            }
        )
    }

    const handleSkip = () => {
        window.open(pendingDownloadUrl, '_target')
        setShowDownloadForm(false)
    }

    if (!datafile.datastore_active)
        return (
            <>
                <DirectDownloadPopup
                    title={
                        datafile.not_downloadable
                            ? 'Tell us about yourself'
                            : 'Download Data'
                    }
                    isOpen={showDownloadForm}
                    subtitle={
                        datafile.not_downloadable
                            ? 'The data you’re looking for is located outside the Data Explorer. Before directing you to the Dataset’s location, we’d love to learn more about you.'
                            : ''
                    }
                    onClose={() => setShowDownloadForm(false)}
                    dataset={dataset}
                    onSubmit={handleFormSubmit}
                    downloadButton={
                        <LoaderButton
                            loading={createDownloadEvent.isLoading}
                            className="whitespace-nowrap"
                            type="submit"
                        >
                            Submit
                        </LoaderButton>
                    }
                    skipButton={
                        <button
                            type="button"
                            onClick={handleSkip}
                            className="whitespace-nowrap underline"
                        >
                            {datafile.not_downloadable
                                ? 'No thanks, proceed to data'
                                : 'No thanks, proceed to download'}
                        </button>
                    }
                />
                <button
                    onClick={() => download(originalResourceDownloadUrl, true)}
                    id="download"
                    data-resource={datafile.title ?? datafile.name!}
                    className="cursor-pointer download-datafile w-full flex aspect-square flex-col items-center justify-center md:gap-y-2 rounded-sm border-2 border-wri-green bg-white shadow transition hover:bg-amber-400"
                >
                    {datafile.not_downloadable ? (
                        <ArrowTopRightOnSquareIcon className="h-5 w-5 sm:h-9 sm:w-9" />
                    ) : (
                        <ArrowDownTrayIcon className="h-5 w-5 sm:h-9 sm:w-9" />
                    )}
                    <div className="font-acumin text-xs sm:text-sm font-normal text-black">
                        {isLoading && mode == 'SIGNED_URL'
                            ? 'Loading'
                            : datafile.not_downloadable
                              ? 'Access the Data'
                              : 'Download'}
                    </div>
                    {size && (
                        <div className="font-acumin text-xs sm:text-xs font-normal text-black">
                            {convertBytes(size)}
                        </div>
                    )}
                </button>
            </>
        )

    return (
        <>
            <DirectDownloadPopup
                title={
                    datafile.not_downloadable
                        ? 'Tell us about yourself'
                        : 'Download Data'
                }
                isOpen={showDownloadForm}
                subtitle={
                    datafile.not_downloadable
                        ? 'The data you’re looking for is located outside the Data Explorer. Before directing you to the Dataset’s location, we’d love to learn more about you.'
                        : ''
                }
                onClose={() => setShowDownloadForm(false)}
                onSubmit={handleFormSubmit}
                dataset={dataset}
                downloadButton={
                    <LoaderButton
                        loading={createDownloadEvent.isLoading}
                        className="whitespace-nowrap"
                        type="submit"
                    >
                        Submit
                    </LoaderButton>
                }
                skipButton={
                    <button
                        onClick={handleSkip}
                        type="button"
                        className="whitespace-nowrap underline"
                    >
                        {datafile.not_downloadable
                            ? 'Not thanks, proceed to data'
                            : 'No thanks, proceed to download'}
                    </button>
                }
            />
            <Popover>
                <Component className="download-datafile w-full flex aspect-square flex-col items-center justify-center md:gap-y-2 rounded-sm border-2 border-wri-green bg-white shadow transition hover:bg-amber-400">
                    {datafile.not_downloadable ? (
                        <ArrowTopRightOnSquareIcon className="h-5 w-5 sm:h-9 sm:w-9" />
                    ) : (
                        <ArrowDownTrayIcon className="h-5 w-5 sm:h-9 sm:w-9" />
                    )}
                    <div className="font-acumin text-xs sm:text-sm font-normal text-black">
                        {isLoading && mode == 'SIGNED_URL'
                            ? 'Loading'
                            : datafile.not_downloadable
                              ? 'Access the Data'
                              : 'Download'}
                    </div>
                    {size && (
                        <div className="font-acumin text-xs sm:text-xs font-normal text-black">
                            {convertBytes(size)}
                        </div>
                    )}
                </Component>
                <PopoverContent>
                    {datafile.format != 'Layer' ? (
                        <>
                            <Button
                                className="w-full"
                                variant="ghost"
                                id="download"
                                data-resource={datafile.title ?? datafile.name!}
                                onClick={() =>
                                    download(originalResourceDownloadUrl, true)
                                }
                            >
                                Original Format{' '}
                                {mode == 'SIGNED_URL' && datafile.format
                                    ? `(${datafile.format})`
                                    : ''}
                            </Button>
                            {isConversibleTabular &&
                                tabularConversionOptions.map((f) => (
                                    <Button
                                        variant="ghost"
                                        className="w-full"
                                        onClick={() => {
                                            // @ts-ignore
                                            setConvertTo(f)
                                            setOpen(true)
                                        }}
                                    >
                                        {f}
                                    </Button>
                                ))}
                        </>
                    ) : (
                        <>
                            {conversibleTabularFormats.map((f) => (
                                <Button
                                    variant="ghost"
                                    className="w-full"
                                    onClick={() => {
                                        // @ts-ignore
                                        setConvertTo(f)
                                        setOpen(true)
                                    }}
                                >
                                    {f}
                                </Button>
                            ))}
                            {isConversibleVector &&
                                conversibleSpatialFormats.map((f) => (
                                    <Button
                                        variant="ghost"
                                        className="w-full"
                                        onClick={() => {
                                            // @ts-ignore
                                            setConvertTo(f)
                                            setOpen(true)
                                        }}
                                    >
                                        {f}
                                    </Button>
                                ))}
                        </>
                    )}
                </PopoverContent>
            </Popover>
            {convertTo && (
                <DownloadPopup
                    title="The selected Data Files are being prepared for download"
                    subtitle="Please enter your information so that you receive the download link via email"
                    isOpen={open}
                    onClose={() => setOpen(false)}
                    dataset={dataset}
                    onSubmit={handleFormSubmitConvertion}
                    downloadButton={
                        <LoaderButton
                            className="whitespace-nowrap"
                            type="submit"
                            loading={
                                requestDatafileConversionMutation.isLoading
                            }
                        >
                            <PaperAirplaneIcon className="mr-2 h-5 w-5" />
                            Submit
                        </LoaderButton>
                    }
                />
            )}
        </>
    )
}
