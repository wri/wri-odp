import { Tab } from '@headlessui/react'
import {
    FolderPlusIcon,
    Square3Stack3DIcon,
    GlobeAsiaAustraliaIcon,
    MinusCircleIcon,
} from '@heroicons/react/24/outline'
import classNames from '@/utils/classnames'
import { UseFormReturn, useFieldArray } from 'react-hook-form'
import { PlusCircleIcon } from '@heroicons/react/20/solid'
import { DataFileAccordion } from './DatafileAccordion'
import { P, match } from 'ts-pattern'
import { BuildALayer } from './sections/BuildALayer/BuildALayerSection'
import { DatasetFormType, ResourceFormType } from '@/schema/dataset.schema'
import { v4 as uuidv4 } from 'uuid'
import { BuildALayerRaw } from './sections/BuildALayer/BuildALayerRawSection'
import { RWDatasetForm } from '../metadata/RWDataset'
import { DefaultTooltip } from '@/components/_shared/Tooltip'

export function CreateLayersSection({
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
            <RWDatasetForm formObj={formObj} />
            {fields.map((field, index) => {
                if (
                    field.type === 'upload' ||
                    field.type === 'link' ||
                    field.type === 'empty-file'
                )
                    return <></>
                return (
                    <AddLayer
                        key={field.id}
                        index={index}
                        field={field}
                        remove={() => remove(index)}
                        formObj={formObj}
                    />
                )
            })}
            <div className="mx-auto w-full max-w-[1380px] px-4 sm:px-6 xxl:px-0">
                <button
                    onClick={() =>
                        append({
                            resourceId: uuidv4(),
                            title: '',
                            type: 'empty-layer',
                            format: '',
                            schema: [],
                            layerObj: null,
                        })
                    }
                    className="ml-auto flex items-center justify-end gap-x-1"
                >
                    <PlusCircleIcon className="h-5 w-5 text-amber-400" />
                    <span className="font-['Acumin Pro SemiCondensed'] text-lg font-normal leading-tight text-black">
                        Add a layer
                    </span>
                </button>
            </div>
        </>
    )
}

export function AddLayer({
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
    return (
        <>
            <DataFileAccordion
                icon={<FolderPlusIcon className="h-7 w-7" />}
                title={`Layer ${index + 1}`}
                remove={remove}
                preview={
                    <div className="flex items-center justify-between bg-stone-50 px-8 py-3">
                        {match(datafile.type)
                            .with(P.union('layer', 'layer-raw'), () => (
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
                                <></>
                            ))}
                    </div>
                }
            >
                <div className="px-4 py-8">
                    <Tab.Group
                        selectedIndex={match(datafile.type)
                            .with('empty-layer', () => 0)
                            .with('layer', () => 1)
                            .with('layer-raw', () => 2)
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
                                id="tabLayer"
                                disabled={watch('rw_dataset') === false}
                                onClick={() =>
                                    setValue(`resources.${index}.type`, 'layer')
                                }
                            >
                                {({ selected }) => (
                                    <DefaultTooltip content="This option will try to guide you torward building some of the most common map specs, its more limited but easier overrall">
                                        <span
                                            className={classNames(
                                                'group flex aspect-square w-full flex-col items-center justify-center rounded-sm border-b-2 border-amber-400 bg-neutral-100 shadow transition hover:bg-amber-400 md:gap-y-2',
                                                selected ? 'bg-amber-400' : '',
                                                datafile.type === 'upload'
                                                    ? 'hidden'
                                                    : ''
                                            )}
                                        >
                                            <Square3Stack3DIcon className="h-5 w-5 text-blue-800 sm:h-9 sm:w-9" />
                                            <div
                                                className={classNames(
                                                    'font-acumin text-xs font-normal text-black group-hover:font-bold sm:text-sm flex flex-col px-4',
                                                    selected ? 'font-bold' : ''
                                                )}
                                            >
                                                Build a layer (simple, no code)
                                                {watch('rw_dataset') ===
                                                    false && (
                                                    <span>
                                                        Toggle RW Data to enable
                                                    </span>
                                                )}
                                            </div>
                                        </span>
                                    </DefaultTooltip>
                                )}
                            </Tab>
                            <Tab
                                id="tabLayerRaw"
                                disabled={watch('rw_dataset') === false}
                                onClick={() =>
                                    setValue(
                                        `resources.${index}.type`,
                                        'layer-raw'
                                    )
                                }
                            >
                                {({ selected }) => (
                                    <DefaultTooltip content="This require you to understand the layer config that our maps expect, useful if you want to use less common providers, such as GFW, Document, ArcGIS etc">
                                        <span
                                            className={classNames(
                                                'group flex aspect-square w-full flex-col items-center justify-center rounded-sm border-b-2 border-amber-400 bg-neutral-100 shadow transition hover:bg-amber-400 md:gap-y-2',
                                                selected ? 'bg-amber-400' : '',
                                                datafile.type === 'upload'
                                                    ? 'hidden'
                                                    : ''
                                            )}
                                        >
                                            <Square3Stack3DIcon className="h-5 w-5 text-blue-800 sm:h-9 sm:w-9" />
                                            <div
                                                className={classNames(
                                                    'font-acumin text-xs font-normal text-black group-hover:font-bold sm:text-sm flex flex-col px-4',
                                                    selected ? 'font-bold' : ''
                                                )}
                                            >
                                                Build a layer (JSON Code)
                                                {watch('rw_dataset') ===
                                                    false && (
                                                    <span>
                                                        Toggle RW Data to enable
                                                    </span>
                                                )}
                                            </div>
                                        </span>
                                    </DefaultTooltip>
                                )}
                            </Tab>
                        </Tab.List>
                        <Tab.Panels as="div" className="mt-2">
                            <Tab.Panel className="hidden"></Tab.Panel>
                            <Tab.Panel>
                                <BuildALayer formObj={formObj} index={index} />
                            </Tab.Panel>
                            <Tab.Panel>
                                <BuildALayerRaw
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
