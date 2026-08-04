import { type UseFormReturn, useFieldArray } from 'react-hook-form';
import { PlusCircleIcon } from '@heroicons/react/20/solid';
import {
    type DatasetFormType,
} from '@/schema/dataset.schema';
import { v4 as uuidv4 } from 'uuid';
import { AddDataFile } from './AddDataFile';
import { EditDataFile } from './EditDataFile';
import { type WriDataset } from '@/schema/ckan.schema';
import SortableList, { SortableItem } from 'react-easy-sort';
import {
    getResourceIndices,
    isDataFileResource,
    reorderResourceSubset,
} from '@/utils/datasetResources';

export function DataFilesSection({
    formObj,
    dataset,
}: {
    formObj: UseFormReturn<DatasetFormType>;
    dataset?: WriDataset;
}) {
    const { control, watch, getValues } = formObj;
    const { fields, remove, replace, insert } =
        useFieldArray({
            control,
            name: 'resources',
        });

    const datafiles = fields
        .map((field, absoluteIndex) => ({ field, absoluteIndex }))
        .filter(({ field }) => isDataFileResource(field));

    const isEditMode = !!dataset;

    return (
        <>
            <SortableList
                onSortEnd={(oldIdx, newIdx) => {
                    replace(
                        reorderResourceSubset(
                            getValues('resources'),
                            isDataFileResource,
                            oldIdx,
                            newIdx
                        )
                    );
                }}
                className="list"
                lockAxis="y"
                draggedItemClassName="dragged"
            >
                {datafiles.map(({ field, absoluteIndex }) => {
                    const isNew = !isEditMode || field.new;
                    return (
                        <SortableItem key={field.id}>
                            <div>
                                {isNew ? (
                                    <AddDataFile
                                        key={absoluteIndex}
                                        index={absoluteIndex}
                                        field={field}
                                        remove={() => remove(absoluteIndex)}
                                        formObj={formObj}
                                    />
                                ) : (
                                    <EditDataFile
                                        key={absoluteIndex}
                                        index={absoluteIndex}
                                        field={field}
                                        remove={() => remove(absoluteIndex)}
                                        formObj={formObj}
                                        dataset={dataset}
                                    />
                                )}
                            </div>
                        </SortableItem>
                    );
                })}
            </SortableList>
            <div className="mx-auto w-full max-w-[1380px] px-4 sm:px-6 xxl:px-0">
                <button
                    onClick={() => {
                        const datafileIndices = getResourceIndices(
                            fields,
                            isDataFileResource
                        );
                        const insertAt = datafileIndices.length
                            ? datafileIndices[datafileIndices.length - 1]! + 1
                            : 0;
                        insert(insertAt, {
                            resourceId: uuidv4(),
                            ...(isEditMode
                                ? { package_id: watch('id'), new: true }
                                : { layerObj: null }),
                            title: '',
                            type: 'empty-file',
                            format: '',
                            not_downloadable: false,
                            schema: [],
                        });
                    }}
                    className="ml-auto flex items-center justify-end gap-x-1"
                >
                    <PlusCircleIcon className="h-5 w-5 text-amber-400" />
                    <span className="font-['Acumin Pro SemiCondensed'] text-lg font-normal leading-tight text-black">
                        Add another Data File
                    </span>
                </button>
            </div>
        </>
    );
}
