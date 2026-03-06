import { type UseFormReturn, useFieldArray } from 'react-hook-form';
import { PlusCircleIcon } from '@heroicons/react/20/solid';
import {
    type DatasetFormType,
} from '@/schema/dataset.schema';
import { v4 as uuidv4 } from 'uuid';
import { EditDataFile } from './EditDataFile';
import { AddLayer } from '@/components/dashboard/datasets/admin/datafiles/CreateLayersSection';
import { type WriDataset } from '@/schema/ckan.schema';
import SortableList, { SortableItem } from 'react-easy-sort';

export function EditRwSection({
    formObj,
    dataset,
}: {
    formObj: UseFormReturn<DatasetFormType>;
    dataset: WriDataset;
}) {
    const { control, watch } = formObj;
    const { fields, append, remove, swap } =
        useFieldArray({
            control, // control props comes from useForm (optional: if you are using FormContext)
            name: 'resources',
        });

    const layers = fields.filter(
        (r) =>
            r.type !== 'upload' &&
            r.type !== 'link' &&
            r.type !== 'empty-file' &&
            r.type !== 'tile-cache' &&
            r.type !== 'gee-asset'
    );

    const notLayers = fields.filter(
        (r) =>
            r.type === 'upload' ||
            r.type === 'link' ||
            r.type === 'empty-file' ||
            r.type === 'tile-cache' ||
            r.type === 'gee-asset'
    );

    return (
        <>
            <div className="mx-auto w-full max-w-[1380px] px-4 sm:px-6 xxl:px-0">
                <p className="text-sm text-gray-500">
                    This step is optional and for geospatial data only. If you would like 
                    to include a map visualization so your users can better “preview” your 
                    data, click “Add a Layer” and follow steps to build layers, or, to 
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
                    swap(oldIdx, newIdx);
                }}
                className="list"
                lockAxis="y"
                draggedItemClassName="dragged"
            >
                {layers.map((field, index) => {
                    index += notLayers.length;
                    return (
                        <SortableItem key={field.id}>
                            <div>
                                {field.new ? (
                                    <AddLayer
                                        index={index}
                                        field={field}
                                        remove={() => remove(index)}
                                        formObj={formObj}
                                    />
                                ) : (
                                    <EditDataFile
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
                        append({
                            resourceId: uuidv4(),
                            not_downloadable: false,
                            package_id: watch('id'),
                            title: '',
                            type: 'empty-layer',
                            format: '',
                            new: true,
                            schema: [],
                        })
                    }
                    className="ml-auto flex items-center justify-end gap-x-1"
                >
                    <PlusCircleIcon className="h-5 w-5 text-amber-400" />
                    <span className="font-['Acumin Pro SemiCondensed'] text-lg font-normal leading-tight text-black">
                        Add another layer
                    </span>
                </button>
            </div>
        </>
    );
}
