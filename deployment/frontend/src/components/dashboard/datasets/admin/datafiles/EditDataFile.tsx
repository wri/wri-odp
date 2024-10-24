import {
    LinkIcon,
    GlobeAsiaAustraliaIcon,
    PaperClipIcon,
    MinusCircleIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/outline'
import { UseFormReturn } from 'react-hook-form'
import { DataFileAccordion } from './DatafileAccordion'
import { match, P } from 'ts-pattern'
import { DatasetFormType, ResourceFormType } from '@/schema/dataset.schema'
import { convertBytes } from '@/utils/convertBytes'
import { Tab } from '@headlessui/react'
import { Fragment, useState } from 'react'
import classNames from '@/utils/classnames'
import { DataDictionaryTable } from './DataDictionaryTable'
import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup'
import { TextArea } from '@/components/_shared/SimpleTextArea'
import { Input } from '@/components/_shared/SimpleInput'
import FormatInput from './FormatInput'
import { Datapusher, DatapusherStatus } from './Datapusher'
import { LoaderButton } from '@/components/_shared/Button'
import { api } from '@/utils/api'
import notify from '@/utils/notify'
import { ErrorAlert } from '@/components/_shared/Alerts'
import { BuildALayer } from './sections/BuildALayer/BuildALayerSection'
import { BuildALayerRaw } from './sections/BuildALayer/BuildALayerRawSection'
import ViewsList from '@/components/views/ViewsList'
import { WriDataset } from '@/schema/ckan.schema'
import { DatafileLocation } from './DatafileLocation'
import { DefaultTooltip } from '@/components/_shared/Tooltip'
import { SimpleEditor } from '@/components/dashboard/datasets/admin/metadata/RTE/SimpleEditor'

export function EditDataFile({
    remove,
    field,
    index,
    formObj,
    dataset,
}: {
    remove: () => void
    index: number
    field: ResourceFormType
    formObj: UseFormReturn<DatasetFormType>
    dataset: WriDataset
}) {
    const {
        watch,
        register,
        formState: { errors },
    } = formObj
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const allDataFiles = watch('resources')
    const notLayers = allDataFiles.filter(
        (datafile) =>
            datafile.type === 'upload' ||
            datafile.type === 'link' ||
            datafile.type === 'empty-file'
    )
    const notLayersCount = notLayers.length ?? 0

    const datafile = watch(`resources.${index}`)

    const isLayer =
        datafile.type !== 'upload' &&
        datafile.type !== 'link' &&
        datafile.type !== 'empty-file'

    const heading = isLayer
        ? `Layer ${index + 1 - notLayersCount}`
        : `Data File ${index + 1}`

    return (
        <>
            <DataFileAccordion
                id={`datafile-accordion-${datafile.id}`}
                icon={<></>}
                title={`${heading}`}
                className="py-0"
                remove={remove}
                preview={
                    <div className="flex items-center justify-between bg-stone-50 px-8 py-3">
                        {match(datafile.type)
                            .with('upload', () => (
                                <>
                                    <div className="flex items-center gap-x-2">
                                        <PaperClipIcon className="h-6 w-6 text-blue-800" />
                                        <span className="font-['Acumin Pro SemiCondensed'] text-lg font-light text-black">
                                            {datafile.name}
                                        </span>
                                        <span className="font-['Acumin Pro SemiCondensed'] mt-0.5 text-right text-xs font-normal leading-tight text-neutral-600">
                                            {datafile.size
                                                ? convertBytes(datafile.size)
                                                : 'N/A'}
                                        </span>
                                    </div>
                                    <button
                                        aria-label="remove"
                                        type="button"
                                        onClick={() => remove()}
                                    >
                                        <MinusCircleIcon className="h-6 w-6 text-red-500" />
                                    </button>
                                </>
                            ))
                            .with('link', () => (
                                <>
                                    <div className="flex items-center gap-x-2">
                                        <LinkIcon className="h-6 w-6 text-blue-800" />
                                        <span className="font-['Acumin Pro SemiCondensed'] text-lg font-light text-black">
                                            {field.title}
                                        </span>
                                    </div>
                                    <button
                                        aria-label="remove"
                                        type="button"
                                        onClick={() => remove()}
                                    >
                                        <MinusCircleIcon className="h-6 w-6 text-red-500" />
                                    </button>
                                </>
                            ))
                            .with(P.union('layer', 'layer-raw'), () => (
                                <>
                                    <div className="flex items-center gap-x-2">
                                        <GlobeAsiaAustraliaIcon className="h-6 w-6 text-blue-800" />
                                        <span className="font-['Acumin Pro SemiCondensed'] text-lg font-light text-black">
                                            {field.title}
                                        </span>
                                    </div>
                                    <button
                                        aria-label="remove"
                                        type="button"
                                        onClick={() => remove()}
                                    >
                                        <MinusCircleIcon className="h-6 w-6 text-red-500" />
                                    </button>
                                </>
                            ))
                            .otherwise(() => (
                                <>
                                    <div className="flex items-center gap-x-2"></div>
                                    <button
                                        aria-label="remove"
                                        type="button"
                                        onClick={() => remove()}
                                    >
                                        <MinusCircleIcon className="h-6 w-6 text-red-500" />
                                    </button>
                                </>
                            ))}
                    </div>
                }
            >
                <div className="items-center bg-slate-100 sm:px-8 px-4 py-4 flex justify-between">
                    <div className="flex items-center gap-x-2">
                        {match(datafile.type)
                            .with('upload', () => (
                                <PaperClipIcon className="h-6 w-6 text-blue-800" />
                            ))
                            .with('link', () => (
                                <LinkIcon className="h-6 w-6 text-blue-800" />
                            ))
                            .with('layer', () => (
                                <GlobeAsiaAustraliaIcon className="h-6 w-6 text-blue-800" />
                            ))
                            .otherwise(() => (
                                <></>
                            ))}
                        <span className="text-lg font-light text-black">
                            {datafile.name ?? datafile.url ?? datafile.title}
                        </span>
                        <span className="text-right font-acumin text-xs font-normal leading-tight text-neutral-500">
                            {datafile.size ? convertBytes(datafile.size) : ''}
                        </span>
                    </div>
                    <button
                        aria-label="remove"
                        type="button"
                        id={`remove_${index}_datafile`}
                        onClick={() => remove()}
                    >
                        <MinusCircleIcon className="h-6 w-6 text-red-500" />
                    </button>
                </div>
                <div className="px-4 py-8">
                    {datafile.type === 'layer' ? (
                        <BuildALayer formObj={formObj} index={index} />
                    ) : datafile.type === 'layer-raw' ? (
                        <BuildALayerRaw formObj={formObj} index={index} />
                    ) : (
                        <Tab.Group>
                            <div>
                                <Tab.List
                                    className="max-w-[1380px] mx-auto px-4 sm:px-6 xxl:px-0"
                                    aria-label="Tabs"
                                >
                                    <div className="flex-col justify-start flex sm:flex-row gap-y-4 sm:gap-x-8 sm:border-b-2 border-gray-300 w-full">
                                        <Tab as={Fragment}>
                                            {({ selected }) => (
                                                <div
                                                    className={classNames(
                                                        'sm:px-8 border-b-2 sm:border-none text-black text-[17px] font-normal font-acumin whitespace-nowrap cursor-pointer',
                                                        selected
                                                            ? 'border-blue-800 sm:border-solid text-blue-800 sm:border-b-2 -mb-px'
                                                            : 'text-black'
                                                    )}
                                                    aria-current={
                                                        selected
                                                            ? 'page'
                                                            : undefined
                                                    }
                                                >
                                                    Metadata
                                                </div>
                                            )}
                                        </Tab>
                                        <Tab as={Fragment}>
                                            {({ selected }) => (
                                                <div
                                                    className={classNames(
                                                        'sm:px-8 border-b-2 sm:border-none text-black text-[17px] font-normal font-acumin whitespace-nowrap cursor-pointer views-tab',
                                                        selected
                                                            ? 'border-blue-800 sm:border-solid text-blue-800 sm:border-b-2 -mb-px'
                                                            : 'text-black'
                                                    )}
                                                    aria-current={
                                                        selected
                                                            ? 'page'
                                                            : undefined
                                                    }
                                                >
                                                    Add and View Charts
                                                </div>
                                            )}
                                        </Tab>
                                        {datafile.schema &&
                                            datafile.schema.length > 0 && (
                                                <Tab as={Fragment}>
                                                    {({ selected }) => (
                                                        <div
                                                            className={classNames(
                                                                'sm:px-8 border-b-2 sm:border-none text-black text-[17px] font-normal font-acumin whitespace-nowrap cursor-pointer',
                                                                selected
                                                                    ? 'border-blue-800 sm:border-solid text-blue-800 sm:border-b-2 -mb-px'
                                                                    : 'text-black'
                                                            )}
                                                            aria-current={
                                                                selected
                                                                    ? 'page'
                                                                    : undefined
                                                            }
                                                        >
                                                            Data Dictionary
                                                        </div>
                                                    )}
                                                </Tab>
                                            )}
                                        {[
                                            'xls',
                                            'xlsx',
                                            'ods',
                                            'xlsm',
                                            'xlsb',
                                            'csv',
                                            'tsv',
                                            'tab',
                                        ].includes(
                                            datafile.format?.toLowerCase() ??
                                                'none'
                                        ) &&
                                            datafile.url_type === 'upload' && (
                                                <Tab as={Fragment}>
                                                    {({ selected }) => (
                                                        <div
                                                            className={classNames(
                                                                'sm:px-8 border-b-2 sm:border-none text-black text-[17px] font-normal font-acumin whitespace-nowrap cursor-pointer',
                                                                selected
                                                                    ? 'border-blue-800 sm:border-solid text-blue-800 sm:border-b-2 -mb-px'
                                                                    : 'text-black'
                                                            )}
                                                            aria-current={
                                                                selected
                                                                    ? 'page'
                                                                    : undefined
                                                            }
                                                        >
                                                            Datapusher{' '}
                                                            <DatapusherStatus
                                                                datafile={
                                                                    datafile
                                                                }
                                                            />
                                                        </div>
                                                    )}
                                                </Tab>
                                            )}
                                    </div>
                                </Tab.List>
                                <Tab.Panels className="px-4 sm:px-6 xxl:px-0 py-4">
                                    <Tab.Panel>
                                        <div className="flex flex-col gap-y-4 font-acumin">
                                            <InputGroup
                                                label="Title"
                                                required
                                                className="whitespace-nowrap flex-wrap sm:flex-nowrap"
                                            >
                                                <Input
                                                    placeholder="Some name"
                                                    {...register(
                                                        `resources.${index}.title`
                                                    )}
                                                    type="text"
                                                    maxWidth="max-w-[55rem]"
                                                />
                                                <ErrorDisplay
                                                    name={`resources.${index}.title`}
                                                    errors={errors}
                                                />
                                            </InputGroup>
                                            <InputGroup
                                                label="Description"
                                                className="whitespace-nowrap flex-wrap sm:flex-nowrap"
                                            >
                                                <TextArea
                                                    placeholder="Add description"
                                                    {...register(
                                                        `resources.${index}.description`
                                                    )}
                                                    type="text"
                                                    maxWidth="max-w-[55rem]"
                                                />
                                            </InputGroup>
                                            <InputGroup
                                                label="Format"
                                                className="whitespace-nowrap flex-wrap sm:flex-nowrap"
                                            >
                                                <div className="max-w-[55rem] w-full">
                                                    <FormatInput
                                                        formObj={formObj}
                                                        name={`resources.${index}.format`}
                                                    />
                                                </div>
                                            </InputGroup>
                                            <InputGroup
                                                label={
                                                    <span className="flex items-center gap-x-1">
                                                        Advanced API Usage
                                                        <DefaultTooltip content="This field will end up in the Datafile API section, you can use it to provide code samples that are useful for this particular data, note: using the string {% DATAFILE_URL %} will get replaced to the actual url in the public section">
                                                            <InformationCircleIcon className="h-5 w-5" />
                                                        </DefaultTooltip>
                                                    </span>
                                                }
                                                className="mb-2 flex min-h-[320px] flex-col items-start whitespace-nowrap sm:flex-col"
                                            >
                                                <SimpleEditor
                                                    formObj={formObj}
                                                    name={`resources.${index}.advanced_api_usage`}
                                                    className="min-h-[320px]"
                                                    defaultValue=""
                                                />
                                            </InputGroup>
                                            <DatafileLocation
                                                formObj={formObj}
                                                index={index}
                                            />
                                        </div>
                                    </Tab.Panel>
                                    <Tab.Panel>
                                        <ViewsList
                                            provider="datastore"
                                            datafile={datafile as any}
                                            dataset={dataset}
                                        />
                                    </Tab.Panel>
                                    {datafile.schema &&
                                        datafile.schema.length > 0 && (
                                            <Tab.Panel>
                                                <DataDictionaryTable
                                                    formObj={formObj}
                                                    resourceIndex={index}
                                                />
                                            </Tab.Panel>
                                        )}
                                    {[
                                        'xls',
                                        'xlsx',
                                        'ods',
                                        'xlsm',
                                        'xlsb',
                                        'csv',
                                        'tsv',
                                        'tab',
                                    ].includes(
                                        datafile.format?.toLowerCase() ?? 'none'
                                    ) &&
                                        datafile.url_type === 'upload' && (
                                            <Tab.Panel>
                                                <Datapusher
                                                    datafile={datafile}
                                                />
                                            </Tab.Panel>
                                        )}
                                </Tab.Panels>
                            </div>
                        </Tab.Group>
                    )}
                    <div
                        className={classNames(
                            'w-full mx-auto sm:px-6 xxl:px-0 max-w-[1380px]'
                        )}
                    >
                        {errorMessage && (
                            <div className="py-4">
                                <ErrorAlert text={errorMessage} />
                            </div>
                        )}
                    </div>
                </div>
            </DataFileAccordion>
        </>
    )
}
