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
import { useState } from 'react'
import { UseFormReturn, useFieldArray, useForm } from 'react-hook-form'
import { PlusCircleIcon } from '@heroicons/react/20/solid'
import { DataFileAccordion } from './DatafileAccordion'
import { match } from 'ts-pattern'
import { BuildALayer } from './sections/BuildALayer/BuildALayerSection'
import { DatasetFormType, ResourceFormType } from '@/schema/dataset.schema'

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
    return (
        <>
            {fields.map((field, index) => (
                <AddDataFile
                    key={index}
                    index={index}
                    field={field}
                    remove={() => remove(index)}
                    formObj={formObj}
                />
            ))}
            <div className="mx-auto w-full max-w-[1380px] px-4 sm:px-6 xxl:px-0">
                <button
                    onClick={() =>
                        append({
                            title: '',
                            type: 'empty',
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
    return (
        <DataFileAccordion
            icon={<FolderPlusIcon className="h-7 w-7" />}
            title={`Data File ${index + 1}`}
            preview={
                <div className="flex items-center justify-between bg-stone-50 px-8 py-3">
                    {match(datafile.type)
                        .with('upload', () => (
                            <>
                                <div className="flex items-center gap-x-2">
                                    <PaperClipIcon className="h-6 w-6 text-blue-800" />
                                    <span className="font-['Acumin Pro SemiCondensed'] text-lg font-light text-black">
                                        {field.title}
                                    </span>
                                    <span className="font-['Acumin Pro SemiCondensed'] mt-0.5 text-right text-xs font-normal leading-tight text-neutral-500">
                                        (3.2 MB)
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
                        .with('layer', () => (
                            <>
                                <div className="flex items-center gap-x-2">
                                    <GlobeAsiaAustraliaIcon className="h-6 w-6 text-blue-800" />
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
            <Tab.Group
                selectedIndex={match(datafile.type)
                    .with('empty', () => 0)
                    .with('upload', () => 1)
                    .with('link', () => 2)
                    .with('layer', () => 3)
                    .otherwise(() => 0)}
            >
                <Tab.List
                    as="div"
                    className="grid max-w-[35rem] grid-cols-2 sm:grid-cols-3 gap-3 py-4 "
                >
                    <Tab className="hidden"></Tab>
                    <Tab
                        onClick={() =>
                            setValue(`resources.${index}.type`, 'upload')
                        }
                        className={classNames(
                            'group flex aspect-square w-full flex-col items-center justify-center rounded-sm border-b-2 border-amber-400 bg-neutral-100 shadow transition hover:bg-amber-400 md:gap-y-2',
                            datafile.type === 'upload' ? 'hidden' : ''
                        )}
                    >
                        <ArrowUpTrayIcon className="h-5 w-5 text-blue-800 sm:h-9 sm:w-9" />
                        <div
                            className={classNames(
                                'font-acumin text-xs font-normal text-black group-hover:font-bold sm:text-sm'
                            )}
                        >
                            Upload a file
                        </div>
                    </Tab>
                    <Tab
                        onClick={() =>
                            setValue(`resources.${index}.type`, 'link')
                        }
                    >
                        {({ selected }) => (
                            <span
                                className={classNames(
                                    'group flex aspect-square w-full flex-col items-center justify-center rounded-sm border-b-2 border-amber-400 bg-neutral-100 shadow transition hover:bg-amber-400 md:gap-y-2',
                                    selected ? 'bg-amber-400' : '',
                                    datafile.type === 'upload' ? 'hidden' : ''
                                )}
                            >
                                <LinkIcon className="h-5 w-5 text-blue-800 sm:h-9 sm:w-9" />
                                <div
                                    className={classNames(
                                        'font-acumin text-xs font-normal text-black group-hover:font-bold sm:text-sm',
                                        selected ? 'font-bold' : ''
                                    )}
                                >
                                    Link External File
                                </div>
                            </span>
                        )}
                    </Tab>
                    <Tab
                        onClick={() =>
                            setValue(`resources.${index}.type`, 'layer')
                        }
                    >
                        {({ selected }) => (
                            <span
                                className={classNames(
                                    'group flex aspect-square w-full flex-col items-center justify-center rounded-sm border-b-2 border-amber-400 bg-neutral-100 shadow transition hover:bg-amber-400 md:gap-y-2',
                                    selected ? 'bg-amber-400' : '',
                                    datafile.type === 'upload' ? 'hidden' : ''
                                )}
                            >
                                <Square3Stack3DIcon className="h-5 w-5 text-blue-800 sm:h-9 sm:w-9" />
                                <div
                                    className={classNames(
                                        'font-acumin text-xs font-normal text-black group-hover:font-bold sm:text-sm',
                                        selected ? 'font-bold' : ''
                                    )}
                                >
                                    Build a layer
                                </div>
                            </span>
                        )}
                    </Tab>
                </Tab.List>
                <Tab.Panels as="div" className="mt-2">
                    <Tab.Panel className="hidden"></Tab.Panel>
                    <Tab.Panel>
                        <UploadForm
                            removeFile={() =>
                                setValue(`resources.${index}.type`, 'empty')
                            }
                        />
                    </Tab.Panel>
                    <Tab.Panel>
                        <LinkExternalForm formObj={formObj} index={index} />
                    </Tab.Panel>
                    <Tab.Panel>
                        <BuildALayer />
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </DataFileAccordion>
    )
}
