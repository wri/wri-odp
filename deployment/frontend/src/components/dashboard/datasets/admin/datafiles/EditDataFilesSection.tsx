import { UseFormReturn, useFieldArray } from 'react-hook-form'
import { PlusCircleIcon } from '@heroicons/react/20/solid'
import { DatasetFormType, ResourceFormType } from '@/schema/dataset.schema'
import { v4 as uuidv4 } from 'uuid'
import { AddDataFile } from './AddDataFile'
import { EditDataFile } from './EditDataFile'

export function EditDataFilesSection({
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
            {fields.map((field, index) =>
                field.new ? (
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
                    />
                )
            )}
            <div className="mx-auto w-full max-w-[1380px] px-4 sm:px-6 xxl:px-0">
                <button
                    onClick={() =>
                        append({
                            resourceId: uuidv4(),
                            package_id: watch('id'),
                            title: '',
                            type: 'empty',
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
