import { Button, LoaderButton } from '@/components/_shared/Button'
import { ErrorDisplay } from '@/components/_shared/InputGroup'
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
import { useDataset } from '@/utils/storeHooks'
import {
    ArrowDownTrayIcon,
    PaperAirplaneIcon,
} from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

export function DownloadButton({ datafile }: { datafile: Resource }) {
    const { dataset } = useDataset()
    const [convertTo, setConvertTo] = useState<'CSV' | 'XLSX' | 'TSV' | 'XML'>()
    const [open, setOpen] = useState(false)
    const { data: signedUrl, isLoading } = api.uploads.getPresignedUrl.useQuery(
        {
            key: datafile.key as string,
        },
        { enabled: !!datafile.key }
    )

    const layerObj = datafile.layerObj
    const layerCfg = layerObj?.layerConfig
    const layerSrc = layerCfg?.source
    const layerProvider = layerSrc?.provider
    const sql = layerProvider?.layers?.at(0)?.options?.sql
    if (
        (datafile.format == 'Layer' &&
            // @ts-ignore
            datafile?.layerObj?.provider !=
            // @ts-ignore
            'cartodb' &&
            sql) ||
        (!datafile.key && !datafile.url)
    ) {
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

    const download = (url: string) => window.open(url, '_target')

    return (
        <>
            <Popover>
                <Component className="download-datafile w-full flex aspect-square flex-col items-center justify-center md:gap-y-2 rounded-sm border-2 border-wri-green bg-white shadow transition hover:bg-amber-400">
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
                    {datafile.format != 'Layer' ? (
                        <>
                            <Button
                                className="w-full"
                                variant="ghost"
                                onClick={() =>
                                    download(originalResourceDownloadUrl)
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
                <DownloadModal
                    format={convertTo}
                    open={open}
                    setOpen={setOpen}
                    datafile={datafile}
                />
            )}
        </>
    )
}

function DownloadModal({
    open,
    setOpen,
    format,
    datafile,
}: {
    open: boolean
    setOpen: (open: boolean) => void
    format: 'XLSX' | 'CSV' | 'TSV' | 'XML'
    datafile: Resource
}) {
    const formSchema = z.object({
        email: z.string().email(),
    })

    type FormSchema = z.infer<typeof formSchema>

    const requestDatafileConversionMutation =
        api.dataset.requestDatafileConversion.useMutation()

    const formObj = useForm<FormSchema>({ resolver: zodResolver(formSchema) })
    const {
        handleSubmit,
        formState: { errors },
        register,
    } = formObj

    let isLoading = false
    let sql = `SELECT * FROM "${datafile.id}"`
    let cartoAccount: string | undefined = "";
    if (datafile.format == 'Layer') {
        const layerObj = datafile.layerObj
        const layerCfg = layerObj?.layerConfig
        const layerSrc = layerCfg?.source
        const layerProvider = layerSrc?.provider
        sql = layerProvider?.layers?.at(0)?.options?.sql
        cartoAccount = layerProvider?.account;
    }

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
                                requestDatafileConversionMutation.mutate(
                                    {
                                        email: data.email,
                                        format: format,
                                        // @ts-ignore
                                        rw_id:
                                            datafile?.layerObj?.dataset ?? '',
                                        provider: datafile.rw_id
                                            ? 'rw'
                                            : 'datastore',
                                        sql: sql,
                                        resource_id: datafile.id,
                                        carto_account: cartoAccount ?? ""
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
                            loading={
                                requestDatafileConversionMutation.isLoading
                            }
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
