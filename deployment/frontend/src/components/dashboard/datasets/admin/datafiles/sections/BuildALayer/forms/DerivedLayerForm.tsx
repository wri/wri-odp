import { UseFormReturn, useFormContext } from 'react-hook-form'
import { Button } from '@/components/_shared/Button'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup'
import { Input } from '@/components/_shared/SimpleInput'
import { LayerFormType } from '../layer.schema'
import { DatasetFormType } from '@/schema/dataset.schema'

export default function DerivedLayerForm({
    formObj,
    index,
}: {
    formObj: UseFormReturn<DatasetFormType>
    index: number
}) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = formObj

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                    <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                        <h3 className="text-sm font-medium text-blue-800">
                            Referenced Layer (Read-Only)
                        </h3>
                        <p className="mt-1 text-sm text-blue-700">
                            This layer references an existing RW layer by ID. It
                            is read-only and cannot be edited through this
                            Application.
                        </p>
                    </div>
                </div>
            </div>

            <InputGroup label="Layer Title">
                <Input
                    {...register(`resources.${index}.title`)}
                    placeholder="Enter a descriptive title for this layer"
                />
                <ErrorDisplay name="name" errors={errors} />
            </InputGroup>

            <InputGroup label="RW Layer ID">
                <Input
                    {...register(`resources.${index}.rw_id`)}
                    placeholder="Enter the existing RW layer ID (e.g., 12345678-1234-1234-1234-123456789abc)"
                />
                <ErrorDisplay name="id" errors={errors} />
                <p className="mt-1 text-sm text-gray-500">
                    The UUID of the existing layer in the RW API that you want
                    to reference.
                </p>
            </InputGroup>
            <InputGroup label="RW Layer URL">
                <Input
                    {...register(`resources.${index}.url`)}
                    placeholder="Enter the existing RW URL ID (e.g., 'https://api.resourcewatch.org/v1/dataset/9085715d-8a32-40b1-ba7b-cd9830333284/layer/ada08d85-6d12-4c2f-9c3c-479de6b9214f')"
                />
                <ErrorDisplay name="id" errors={errors} />
                <p className="mt-1 text-sm text-gray-500">
                    The URL of the existing layer in the RW API that you want to
                    reference.
                </p>
            </InputGroup>

            <InputGroup label="Description">
                <Input
                    {...register(`resources.${index}.description`)}
                    placeholder="Optional description of this referenced layer"
                />
                <ErrorDisplay name="description" errors={errors} />
            </InputGroup>
        </div>
    )
}
