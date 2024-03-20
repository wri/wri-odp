import { UseFormReturn, useFieldArray } from 'react-hook-form'
import { PlusCircleIcon } from '@heroicons/react/20/solid'
import { DatasetFormType, ResourceFormType } from '@/schema/dataset.schema'
import { v4 as uuidv4 } from 'uuid'
import { AddDataFile } from './AddDataFile'
import { EditDataFile } from './EditDataFile'
import { api } from '@/utils/api'
import { WriDataset } from '@/schema/ckan.schema'
import SortableList, { SortableItem } from 'react-easy-sort'

export function EditDataFilesSection({
    formObj,
    dataset,
}: {
    formObj: UseFormReturn<DatasetFormType>
    dataset: WriDataset
}) {
    const { control, watch } = formObj
    const { fields, append, prepend, remove, swap, move, insert } =
        useFieldArray({
            control, // control props comes from useForm (optional: if you are using FormContext)
            name: 'resources',
        })

    const rwId = watch('rw_id')
    const provider = watch('provider')
    const {
        data: datasetViews,
        isLoading: isDatasetViewsLoading,
        error: datasetViewsError,
    } = api.rw.getDatasetViews.useQuery(
        { rwDatasetId: rwId ?? '' },
        { enabled: !!rwId }
    )

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

                                {field.new ? (
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
                    )
                })}
            </SortableList>
            <div className="mx-auto w-full max-w-[1380px] px-4 sm:px-6 xxl:px-0">
                <button
                    onClick={() =>
                        append({
                            resourceId: uuidv4(),
                            package_id: watch('id'),
                            title: '',
                            type: 'empty-file',
                            format: '',
                            new: true,
                            schema: [],
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
