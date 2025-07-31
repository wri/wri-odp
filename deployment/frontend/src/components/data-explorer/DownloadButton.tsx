import { Button, LoaderButton } from '@/components/_shared/Button'
import { ErrorDisplay } from '@/components/_shared/InputGroup'
import dynamic from 'next/dynamic'
const Modal = dynamic(() => import('@/components/_shared/Modal'), {
    ssr: false,
})
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/_shared/Popover'
import Spinner from '@/components/_shared/Spinner'
import { api } from '@/utils/api'
import {
    ArrowDownTrayIcon,
    PaperAirplaneIcon,
} from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { TabularResource } from '../datasets/visualizations/Visualizations'
import { ArrowDownCircleIcon } from '@heroicons/react/20/solid'
import { DefaultTooltip } from '../_shared/Tooltip'
import { DownloadPopup } from '../_shared/DownloadPopup'
import { useDataset } from '@/utils/storeHooks'

export function DownloadButton({
    sql,
    tabularResource,
    numOfRows,
}: {
    tabularResource: TabularResource
    sql: string
    numOfRows: number
}) {
    const { dataset } = useDataset()
    const conversibleFormats = ['CSV', 'XLSX', 'JSON', 'TSV', 'XML']
    const [convertTo, setConvertTo] = useState<'CSV' | 'XLSX' | 'TSV' | 'XML'>(
        'CSV'
    )
    const [open, setOpen] = useState(false)
    const downloadSubset = api.dataset.downloadSubsetOfData.useMutation()
    const createDownloadEvent = api.downloadEvents.createEvents.useMutation({
        onError: (err) => {
            toast('Failed to send your information', {
                type: 'error',
            }),
                setOpen(false)
        },
    })
    const handleFormSubmit = (data: any) => {
        downloadSubset.mutate(
            {
                email: data.email,
                format: convertTo,
                provider: tabularResource.provider,
                dataset_id: tabularResource.datasetId,
                sql: sql,
                numOfRows: numOfRows,
                connectorUrl: tabularResource.connectorUrl,
                id: tabularResource.id,
            },
            {
                onSuccess: () => {
                    toast("You'll receive an email when the file is ready", {
                        type: 'success',
                    })
                    const _data = {
                        ...data,
                        resources: [tabularResource.id],
                        package_id: tabularResource.datasetId ?? '',
                        typeOfForm: 'email-download',
                        package_name: tabularResource.datasetName,
                    }
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
    return (
        <>
            <Popover>
                <PopoverTrigger>
                    <div className="hidden group sm:flex items-center justify-center h-8 rounded-md gap-x-1 bg-blue-100 hover:bg-blue-800 hover:text-white text-blue-800 text-xs px-3">
                        Download Data
                        <ArrowDownCircleIcon className="group-hover:text-white h-4 w-4 text-blue-800 mb-1" />
                    </div>
                    <div className="sm:hidden">
                        <DefaultTooltip content="Download data">
                            <button>
                                <ArrowDownCircleIcon className="hover:text-blue-600 sm:hidden group-hover:text-white h-6 w-6 text-blue-800 sm:mb-1 mt-2 sm:mt-0" />
                            </button>
                        </DefaultTooltip>
                    </div>
                </PopoverTrigger>
                <PopoverContent className="flex justify-start flex-col w-fit">
                    {conversibleFormats.map((f) => (
                        <Button
                            variant="ghost"
                            className="w-full"
                            id={`download-subset-${f.toLowerCase()}`}
                            onClick={() => {
                                // @ts-ignore
                                setConvertTo(f)
                                setOpen(true)
                            }}
                        >
                            {f}
                        </Button>
                    ))}
                </PopoverContent>
            </Popover>
            <DownloadPopup
                title={`This ${convertTo} file is being prepared for download`}
                subtitle="Please enter your email address so that you receive the download link via email when it's ready."
                isOpen={open}
                onClose={() => setOpen(false)}
                dataset={dataset}
                onSubmit={handleFormSubmit}
                downloadButton={
                    <LoaderButton
                        className="whitespace-nowrap"
                        type="submit"
                        loading={downloadSubset.isLoading}
                    >
                        <PaperAirplaneIcon className="mr-2 h-5 w-5" />
                        Submit
                    </LoaderButton>
                }
            />
        </>
    )
}
