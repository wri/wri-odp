import { Accordion } from '../Accordion'
import { Tab } from '@headlessui/react'
import {
    ArrowUpTrayIcon,
    FolderPlusIcon,
    LinkIcon,
    Square3Stack3DIcon,
    GlobeAsiaAustraliaIcon,
    PaperClipIcon,
    MinusCircleIcon,
} from '@heroicons/react/24/outline'
import classNames from '@/utils/classnames'
import { LinkExternalForm } from './sections/LinkExternalForm'
import { UploadForm } from './sections/UploadForm'
import { Fragment, useMemo, useRef, useState } from 'react'
import { UseFormReturn, useFieldArray } from 'react-hook-form'
import { PlusCircleIcon } from '@heroicons/react/20/solid'
import { DataFileAccordion } from './DatafileAccordion'
import { P, match } from 'ts-pattern'
import { BuildALayer } from './sections/BuildALayer/BuildALayerSection'
import { DatasetFormType, ResourceFormType } from '@/schema/dataset.schema'
import Uppy, { UppyFile } from '@uppy/core'
import AwsS3 from '@uppy/aws-s3'
import { getUploadParameters } from '@/utils/uppyFunctions'
import { v4 as uuidv4 } from 'uuid'
import { convertBytes } from '@/utils/convertBytes'
import { useDataDictionary } from '@/utils/getDataDictionary'
import { Field } from 'tableschema'
import { BuildALayerRaw } from './sections/BuildALayer/BuildALayerRawSection'
import SortableList, { SortableItem } from 'react-easy-sort'

export function CreateDataFilesSection({
    formObj,
}: {
    formObj: UseFormReturn<DatasetFormType>
}) {
    const { control, watch } = formObj
    const { fields, append, prepend, remove, swap, move, insert } =
        useFieldArray({
            control, // control props comes from useForm (optional: if you are using FormContext)
            name: 'resources',
        })

    const datafiles = fields.filter(
        (r) =>
            r.type !== 'layer' &&
            r.type !== 'layer-raw' &&
            r.type !== 'empty-layer'
    )

    return (
        <>
            <SortableList
                onSortEnd={(oldIdx, newIdx) => {
                    swap(oldIdx, newIdx)
                }}
                className="list"
                lockAxis="y"
                draggedItemClassName="dragged"
            >
                {datafiles.map((field, index) => {
                    return (
                        <SortableItem key={field.id}>
                            <div>
                                <AddDataFile
                                    index={index}
                                    field={field}
                                    remove={() => remove(index)}
                                    formObj={formObj}
                                />
                            </div>
                        </SortableItem>
                    )
                })}
            </SortableList>
            <div className="mx-auto w-full max-w-[1380px] px-4 sm:px-6 xxl:px-0">
                <button
                    onClick={() =>
                        insert(datafiles.length, {
                            resourceId: uuidv4(),
                            title: '',
                            type: 'empty-file',
                            format: '',
                            schema: [],
                            layerObj: null,
                        })
                    }
                    className="ml-auto flex items-center justify-end gap-x-1"
                >
                    <PlusCircleIcon className="h-5 w-5 text-amber-400" />
                    <span className="font-['Acumin Pro SemiCondensed'] text-lg font-normal leading-tight text-black">
                        Add another data file
                    </span>
                </button>
            </div>
        </>
    )
}

function AddDataFile({
    remove,
    field,
    index,
    formObj,
}: {
    remove: () => void
    index: number
    field: ResourceFormType
    formObj: UseFormReturn<DatasetFormType>
}) {
    const { setValue, watch } = formObj
    const datafile = watch(`resources.${index}`)
    console.log(datafile)
    const uploadInputRef = useRef<HTMLInputElement>(null)
    const { isLoading: dataDictionaryLoading } = useDataDictionary(
        watch(`resources.${index}.fileBlob`),
        (data) => {
            if (data) {
                const types = {
                    string: 'text',
                    number: 'numeric',
                    integer: 'numeric',
                    float: 'numeric',
                    date: 'timestamp',
                    time: 'timestamp',
                    datetime: 'timestamp',
                    year: 'numeric',
                    yearmonth: 'timestamp',
                    duration: 'numeric',
                } as const
                const dataDictionary = data.map(
                    (item: Field, index: number) => ({
                        _id: index,
                        id: item.name,
                        info: {
                            label: item.name,
                            type_override:
                                types[item.type as keyof typeof types],
                            default: '',
                        },
                    })
                )
                setValue(`resources.${index}.schema`, dataDictionary)
            }
        },
        watch(`resources.${index}.fileBlob`)?.type === 'text/csv'
    )

    const uppy = useMemo(() => {
        const uppy = new Uppy({
            autoProceed: true,
            restrictions: {
                maxNumberOfFiles: 1,
            },
        }).use(AwsS3, {
            id: 'AwsS3',
            getUploadParameters: (file: UppyFile) =>
                getUploadParameters(
                    file,
                    watch('team') && watch('team')?.value !== ''
                        ? `${watch('team')?.id}/ckan/resources/${datafile.resourceId
                        }`
                        : `ckan/resources/${datafile.resourceId}`
                ),
        })
        return uppy
    }, [])

    function upload() {
        uppy.upload().then((result) => {
            if (result && result.successful[0]) {
                let paths = new URL(result.successful[0].uploadURL).pathname
                    .substring(1)
                    .split('/')
                const url = result.successful[0]?.uploadURL ?? null
                const name = url ? url.split('/').pop() : ''
                const format = result.successful[0].extension
                const size = result.successful[0].size
                const key = paths.slice(0, paths.length).join('/')
                uppy.setState({ ...uppy.getState(), files: [] })
                setValue(`resources.${index}.key`, key)
                setValue(`resources.${index}.name`, name)
                setValue(`resources.${index}.size`, size)
                setValue(`resources.${index}.format`, format)
                if (uploadInputRef && uploadInputRef.current)
                    uploadInputRef.current.value = ''
            }

            if (result.failed.length > 0) {
                result.failed.forEach((file) => {
                    console.error(file.error)
                })
            }
        })
    }

    uppy.on('progress', (progress) => {
        if (typeof window !== 'undefined') {
            const progressBar = document.getElementById(
                `${datafile.resourceId}_upload_progress`
            )
            if (progressBar) {
                progressBar.textContent = progress + '%'
            }
        }
    })

    uppy.on('upload', (_result) => {
        setValue(`resources.${index}.type`, 'upload')
    })

    function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files
        if (!files || !files[0]) return
        const slice = files[0].slice(0, 1000000)
        const slicedFile = new File([slice], files[0].name, {
            type: files[0].type,
        })
        setValue(`resources.${index}.fileBlob`, slicedFile)
        uppy.addFile({
            name: files[0].name,
            type: files[0].type,
            data: files[0],
        })
        upload()
    }

    return (
        <>
            <input
                ref={uploadInputRef}
                onChange={(e) => onInputChange(e)}
                type="file"
                className="hidden"
            />
            <DataFileAccordion
                icon={<FolderPlusIcon className="h-7 w-7" />}
                title={`Data File ${index + 1}`}
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
                                        <span className="font-['Acumin Pro SemiCondensed'] mt-0.5 text-right text-xs font-normal leading-tight text-neutral-500">
                                            {datafile.size
                                                ? convertBytes(datafile.size)
                                                : 'N/A'}
                                        </span>
                                    </div>
                                    <button onClick={() => remove()}>
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
                                    <button onClick={() => remove()}>
                                        <MinusCircleIcon className="h-6 w-6 text-red-500" />
                                    </button>
                                </>
                            ))
                            .otherwise(() => (
                                <>
                                    <div className="flex items-center gap-x-2"></div>
                                    <button onClick={() => remove()}>
                                        <MinusCircleIcon className="h-6 w-6 text-red-500" />
                                    </button>
                                </>
                            ))}
                    </div>
                }
            >
                <div className="px-4 py-8">
                    <Tab.Group
                        selectedIndex={match(datafile.type)
                            .with('empty-file', () => 0)
                            .with('upload', () => 1)
                            .with('link', () => 2)
                            .otherwise(() => 0)}
                    >
                        <Tab.List
                            as="div"
                            className={classNames(
                                'grid max-w-[50rem] grid-cols-2 lg:grid-cols-4 gap-3 py-4',
                                datafile.type === 'upload' ? 'hidden' : ''
                            )}
                        >
                            <Tab className="hidden" id="tabEmpty"></Tab>
                            <Tab
                                onClick={() => uploadInputRef.current?.click()}
                                id="tabUpload"
                                className={classNames(
                                    'group flex aspect-square w-full flex-col items-center justify-center rounded-sm border-b-2 border-amber-400 bg-neutral-100 shadow transition hover:bg-amber-400 md:gap-y-2',
                                    datafile.type === 'upload' ? 'hidden' : ''
                                )}
                            >
                                <ArrowUpTrayIcon className="h-5 w-5 text-blue-800 sm:h-9 sm:w-9" />
                                <div
                                    className={classNames(
                                        'font-acumin text-xs font-normal text-black group-hover:font-bold sm:text-sm px-4'
                                    )}
                                >
                                    Upload file from my computer
                                </div>
                            </Tab>
                            <Tab
                                id="tabLink"
                                onClick={() =>
                                    setValue(`resources.${index}.type`, 'link')
                                }
                            >
                                {({ selected }) => (
                                    <span
                                        className={classNames(
                                            'group flex aspect-square w-full flex-col items-center justify-center rounded-sm border-b-2 border-amber-400 bg-neutral-100 shadow transition hover:bg-amber-400 md:gap-y-2',
                                            selected ? 'bg-amber-400' : '',
                                            datafile.type === 'upload'
                                                ? 'hidden'
                                                : ''
                                        )}
                                    >
                                        <LinkIcon className="h-5 w-5 text-blue-800 sm:h-9 sm:w-9" />
                                        <div
                                            className={classNames(
                                                'font-acumin text-xs font-normal text-black group-hover:font-bold sm:text-sm px-4',
                                                selected ? 'font-bold' : ''
                                            )}
                                        >
                                            Link to file in cloud storage
                                        </div>
                                    </span>
                                )}
                            </Tab>
                        </Tab.List>
                        <Tab.Panels as="div" className="mt-2">
                            <Tab.Panel className="hidden"></Tab.Panel>
                            <Tab.Panel>
                                <UploadForm
                                    formObj={formObj}
                                    index={index}
                                    dataDictionaryLoading={
                                        dataDictionaryLoading
                                    }
                                    removeFile={() =>
                                        setValue(`resources.${index}`, {
                                            resourceId: uuidv4(),
                                            title: '',
                                            type: 'empty-file',
                                            schema: [],
                                            layerObj: null,
                                        })
                                    }
                                />
                            </Tab.Panel>
                            <Tab.Panel>
                                <LinkExternalForm
                                    formObj={formObj}
                                    index={index}
                                />
                            </Tab.Panel>
                        </Tab.Panels>
                    </Tab.Group>
                </div>
            </DataFileAccordion>
        </>
    )
}
