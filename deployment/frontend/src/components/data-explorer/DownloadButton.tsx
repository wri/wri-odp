import { Button, LoaderButton } from '@/components/_shared/Button'
import { ErrorDisplay } from '@/components/_shared/InputGroup'
import Modal from '@/components/_shared/Modal'
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

export function DownloadButton({
    sql,
    tabularResource,
}: {
    tabularResource: TabularResource
    sql: string
}) {
    const conversibleFormats = ['CSV', 'XLSX', 'JSON', 'TSV', 'XML']
    const [convertTo, setConvertTo] = useState<'CSV' | 'XLSX' | 'TSV' | 'XML'>(
        'CSV'
    )
    const [open, setOpen] = useState(false)
    return (
        <>
            <Popover>
                <PopoverTrigger>
                    <Button className="hidden group sm:flex items-center justify-center h-8 rounded-md gap-x-1 bg-blue-100 hover:bg-blue-800 hover:text-white text-blue-800 text-xs px-3">
                        Download Data
                        <ArrowDownCircleIcon className="group-hover:text-white h-4 w-4 text-blue-800 mb-1" />
                    </Button>
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
            <DownloadModal
                format={convertTo}
                open={open}
                setOpen={setOpen}
                sql={sql}
                tabularResource={tabularResource}
            />
        </>
    )
}

function DownloadModal({
    open,
    setOpen,
    format,
    sql,
    tabularResource,
}: {
    open: boolean
    setOpen: (open: boolean) => void
    format: 'XLSX' | 'CSV' | 'TSV' | 'XML'
    tabularResource: TabularResource
    sql: string
}) {
    const formSchema = z.object({
        email: z.string().email(),
    })

    type FormSchema = z.infer<typeof formSchema>

    const downloadSubset = api.dataset.downloadSubsetOfData.useMutation()

    const formObj = useForm<FormSchema>({ resolver: zodResolver(formSchema) })
    const {
        handleSubmit,
        formState: { errors },
        register,
    } = formObj

    let isLoading = false
    return (
        <Modal open={open} setOpen={setOpen} className="max-w-[48rem]">
            <div className="p-6">
                <div className="border-b border-zinc-100 pb-5">
                    <div className="font-acumin text-3xl font-normal text-black">
                        This {format} file is being prepared for download
                    </div>
                    <div className="font-acumin text-base font-light text-neutral-600">
                        Please enter your email address so that you receive the
                        download link via email when it's ready.
                    </div>
                </div>
                {isLoading && (
                    <div className="w-full flex items-center my-10 justify-center">
                        <Spinner />
                    </div>
                )}
                {!isLoading && (
                    <form
                        onSubmit={handleSubmit(
                            async (data) => {
                                downloadSubset.mutate(
                                    {
                                        email: data.email,
                                        format: format,
                                        provider: tabularResource.provider,
                                        dataset_id: tabularResource.datasetId,
                                        sql: sql,
                                        connectorUrl:
                                            tabularResource.connectorUrl,
                                        id: tabularResource.id,
                                    },
                                    {
                                        onSuccess: () => {
                                            toast(
                                                "You'll receive an email when the file is ready",
                                                { type: 'success' }
                                            )

                                            setOpen(false)
                                        },
                                        onError: (err) => {
                                            console.log(err)

                                            toast('Failed to request file', {
                                                type: 'error',
                                            })
                                        },
                                    }
                                )
                            },
                            (err) => {
                                console.log(err)
                                toast('Failed to request file', {
                                    type: 'error',
                                })
                            }
                        )}
                        className="flex flex-col sm:flex-row gap-5 pt-6"
                    >
                        <input
                            type="email"
                            id="email"
                            className="block w-full rounded-md border-b border-wri-green py-1.5 pl-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-wri-green sm:text-sm sm:leading-6"
                            placeholder="you@example.com"
                            {...register('email')}
                        />
                        <LoaderButton
                            className="whitespace-nowrap"
                            type="submit"
                            loading={downloadSubset.isLoading}
                        >
                            <PaperAirplaneIcon className="mr-2 h-5 w-5" />
                            Get via email
                        </LoaderButton>
                    </form>
                )}
                <ErrorDisplay errors={errors} name="email" />
            </div>
        </Modal>
    )
}
