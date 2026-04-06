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

export function DataFilesSection({
    formObj,
    dataset,
}: {
    formObj: UseFormReturn<DatasetFormType>;
    dataset?: WriDataset;
}) {
    const { control, watch } = formObj;
    const { fields, remove, swap, insert } =
        useFieldArray({
            control,
            name: 'resources',
        });

    const datafiles = fields.filter(
        (r) =>
            r.type !== 'layer' &&
            r.type !== 'layer-raw' &&
            r.type !== 'empty-layer'
    );

    const isEditMode = !!dataset;

    return (
        <>
            <SortableList
                onSortEnd={(oldIdx, newIdx) => {
                    swap(oldIdx, newIdx);
                }}
                className="list"
                lockAxis="y"
                draggedItemClassName="dragged"
            >
                {datafiles.map((field, index) => {
                    const isNew = !isEditMode || field.new;
                    return (
                        <SortableItem key={field.id}>
                            <div>
                                {isNew ? (
                                    <AddDataFile
                                        key={index}
                                        index={index}
                                        field={field}
                                        remove={() => remove(index)}
                                        formObj={formObj}
                                    />
                                ) : (
                                    <EditDataFile
                                        key={index}
                                        index={index}
                                        field={field}
                                        remove={() => remove(index)}
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
                    onClick={() =>
                        insert(datafiles.length, {
                            resourceId: uuidv4(),
                            ...(isEditMode
                                ? { package_id: watch('id'), new: true }
                                : { layerObj: null }),
                            title: '',
                            type: 'empty-file',
                            format: '',
                            not_downloadable: false,
                            schema: [],
                        })
                    }
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

