import { UseFormReturn, useFieldArray } from 'react-hook-form'
import { PlusCircleIcon } from '@heroicons/react/20/solid'
import { DatasetFormType, ResourceFormType } from '@/schema/dataset.schema'
import { v4 as uuidv4 } from 'uuid'
import { EditDataFile } from './EditDataFile'
import { MetadataAccordion } from '../metadata/MetadataAccordion'
import { RWDatasetForm } from '../metadata/RWDataset'
import { api } from '@/utils/api'
import ViewsList from '@/components/views/ViewsList'
import { AddLayer } from '@/components/dashboard/datasets/admin/datafiles/CreateLayersSection'
import { WriDataset } from '@/schema/ckan.schema'
import SortableList, { SortableItem } from 'react-easy-sort'

export function EditRwSection({
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

    const layers = fields.filter(
        (r) => r.type !== 'upload' &&
            r.type !== 'link' &&
            r.type !== 'empty-file')

    const notLayers = fields.filter(
        (r) => r.type === 'upload' ||
            r.type === 'link' ||
            r.type === 'empty-file')

    return (
        <>
            <RWDatasetForm formObj={formObj} editing={true} />
            {rwId && provider && !isDatasetViewsLoading && (
                <MetadataAccordion label="Dataset views" defaultOpen={false}>
                    <ViewsList
                        provider="rw"
                        rwDatasetId={rwId}
                        views={datasetViews ?? []}
                        dataset={dataset}
                    />
                </MetadataAccordion>
            )}
            <SortableList
                onSortEnd={(oldIdx, newIdx) => {
                    swap(oldIdx, newIdx)
                }}
                className="list"
                lockAxis="y"
                draggedItemClassName="dragged"
            >
                {layers.map((field, index) => {
                    index += notLayers.length
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
    )
}
