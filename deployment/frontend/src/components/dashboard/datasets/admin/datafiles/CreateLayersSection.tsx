import { Tab } from '@headlessui/react';
import {
    FolderPlusIcon,
    Square3Stack3DIcon,
    GlobeAsiaAustraliaIcon,
    MinusCircleIcon,
} from '@heroicons/react/24/outline';
import classNames from '@/utils/classnames';
import { type UseFormReturn, useFieldArray } from 'react-hook-form';
import { PlusCircleIcon } from '@heroicons/react/20/solid';
import { DataFileAccordion } from './DatafileAccordion';
import { P, match } from 'ts-pattern';
import { BuildALayer } from './sections/BuildALayer/BuildALayerSection';
import {
    type DatasetFormType,
    type ResourceFormType,
} from '@/schema/dataset.schema';
import { v4 as uuidv4 } from 'uuid';
import { BuildALayerRaw } from './sections/BuildALayer/BuildALayerRawSection';
import { DefaultTooltip } from '@/components/_shared/Tooltip';
import SortableList, { SortableItem } from 'react-easy-sort';
import DerivedLayerForm from './sections/BuildALayer/forms/DerivedLayerForm';
import {
    getResourceOrdinal,
    isLayerResource,
    reorderResourceSubset,
} from '@/utils/datasetResources';

export function CreateLayersSection({
    formObj,
}: {
    formObj: UseFormReturn<DatasetFormType>;
}) {
    const { control, getValues } = formObj;
    const { fields, append, remove, replace } =
        useFieldArray({
            control, // control props comes from useForm (optional: if you are using FormContext)
            name: 'resources',
        });

    const layers = fields
        .map((field, absoluteIndex) => ({ field, absoluteIndex }))
        .filter(({ field }) => isLayerResource(field));

    return (
        <>
            <div className="mx-auto w-full max-w-[1380px] px-4 sm:px-6 xxl:px-0">
                <p className="text-sm text-gray-500">
                    This step is optional and for geospatial data only. If you would like 
                    to include a map visualization so your users can better "preview" your 
                    data, click "Add a Layer" and follow steps to build layers, or, to 
                    reference an existing layer in the Resource Watch API. You can add multiple layers. 
                    This preview will appear as a half-page flyout on the Dataset Detail 
                    page and includes basic map settings and limited interactivity (such as a legend).
                    <br />
                    <br />
                    <span className="font-bold">
                        Note: This step is optional and for geospatial data only.
                    </span>
                </p>
            </div>
            <SortableList
                onSortEnd={(oldIdx, newIdx) => {
                    replace(
                        reorderResourceSubset(
                            getValues('resources'),
                            isLayerResource,
                            oldIdx,
                            newIdx
                        )
                    );
                }}
                className="list"
                lockAxis="y"
                draggedItemClassName="dragged"
            >
                {layers.map(({ field, absoluteIndex }) => (
                    <SortableItem key={field.id}>
                        <div>
                            <AddLayer
                                index={absoluteIndex}
                                field={field}
                                remove={() => remove(absoluteIndex)}
                                formObj={formObj}
                            />
                        </div>
                    </SortableItem>
                ))}
            </SortableList>
            <div className="mx-auto w-full max-w-[1380px] px-4 sm:px-6 xxl:px-0">
                <button
                    onClick={() =>
                        append({
                            resourceId: uuidv4(),
                            not_downloadable: false,
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
    );
}

export function AddLayer({
    remove,
    field,
    index,
    formObj,
}: {
    remove: () => void;
    index: number;
    field: ResourceFormType;
    formObj: UseFormReturn<DatasetFormType>;
}) {
    const { setValue, watch } = formObj;
    const datafile = watch(`resources.${index}`);
    const layerNumber = getResourceOrdinal(
        watch('resources') ?? [],
        index,
        isLayerResource
    );

    return (
        <>
            <DataFileAccordion
                icon={<FolderPlusIcon className="h-7 w-7" />}
                title={`Layer ${layerNumber}`}
                remove={remove}
                preview={
                    <div className="flex items-center justify-between bg-stone-50 px-8 py-3">
                        {match(datafile.type)
                            .with(
                                P.union(
                                    'layer',
                                    'layer-raw',
                                    'reference-layer'
                                ),
                                () => (
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
                                )
                            )
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
                            .with('reference-layer', () => 3)
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
                                onClick={() =>
                                    setValue(`resources.${index}.type`, 'layer')
                                }
                            >
                                {({ selected }) => (
                                    <DefaultTooltip content="Select this option to build a layer using some of the most common map specs. This option is more limited but easier to use.">
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
                                            </div>
                                        </span>
                                    </DefaultTooltip>
                                )}
                            </Tab>
                            <Tab
                                id="tabLayerRaw"
                                onClick={() =>
                                    setValue(
                                        `resources.${index}.type`,
                                        'layer-raw'
                                    )
                                }
                            >
                                {({ selected }) => (
                                    <DefaultTooltip content="Select this option if you have a baseline understanding of the layer config being used by Data Explorer and want to use less common providers, such as GFW or ArcGIS. ">
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
                                            </div>
                                        </span>
                                    </DefaultTooltip>
                                )}
                            </Tab>
                            <Tab
                                id="tabDerived"
                                onClick={() =>
                                    setValue(
                                        `resources.${index}.type`,
                                        'reference-layer'
                                    )
                                }
                            >
                                {({ selected }) => (
                                    <DefaultTooltip content="This option allows you to import a layer that already exists in the Resource Watch API">
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
                                                Reference an existing RW layer
                                                (read-only)
                                            </div>
                                        </span>
                                    </DefaultTooltip>
                                )}
                            </Tab>
                        </Tab.List>
                        <Tab.Panels as="div" className="mt-2">
                            <Tab.Panel className="hidden"></Tab.Panel>
                            <Tab.Panel>
                                {formObj.getValues(`resources.${index}.type`) ==
                                    'layer' && (
                                    <BuildALayer
                                        formObj={formObj}
                                        index={index}
                                    />
                                )}
                            </Tab.Panel>
                            <Tab.Panel>
                                {formObj.getValues(`resources.${index}.type`) ==
                                    'layer-raw' && (
                                    <BuildALayerRaw
                                        formObj={formObj}
                                        index={index}
                                    />
                                )}
                            </Tab.Panel>
                            <Tab.Panel>
                                <DerivedLayerForm
                                    formObj={formObj}
                                    index={index}
                                />
                            </Tab.Panel>
                        </Tab.Panels>
                    </Tab.Group>
                </div>
            </DataFileAccordion>
        </>
    );
}
