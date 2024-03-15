import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup'
import { Input } from '@/components/_shared/SimpleInput'
import SimpleSelect from '@/components/_shared/SimpleSelect'
import { TextArea } from '@/components/_shared/SimpleTextArea'
import { DatasetFormType } from '@/schema/dataset.schema'
import { UseFormReturn } from 'react-hook-form'
import FormatInput from '../FormatInput'
import { DatafileLocation } from '../DatafileLocation'
import DefaultTooltip from '@/components/_shared/Tooltip'
import { InformationCircleIcon } from '@heroicons/react/24/outline'

export function LinkExternalForm({
    formObj,
    index,
}: {
    formObj: UseFormReturn<DatasetFormType>
    index: number
}) {
    const {
        register,
        formState: { errors },
    } = formObj
    return (
        <div className="flex flex-col gap-y-4">
            <InputGroup label="Link" required className="whitespace-nowrap">
                <Input
                    placeholder="https://source/to/original/data"
                    {...register(`resources.${index}.url`)}
                    type="text"
                    maxWidth="max-w-[70rem]"
                />
                <ErrorDisplay name={`resources.${index}.url`} errors={errors} />
            </InputGroup>
            <InputGroup label="Title" required className="whitespace-nowrap">
                <Input
                    placeholder="Some name"
                    {...register(`resources.${index}.title`)}
                    type="text"
                    maxWidth="max-w-[70rem]"
                />
                <ErrorDisplay
                    name={`resources.${index}.title`}
                    errors={errors}
                />
            </InputGroup>
            <InputGroup label="Description" className="whitespace-nowrap">
                <TextArea
                    placeholder="Add description"
                    {...register(`resources.${index}.description`)}
                    type="text"
                    maxWidth="max-w-[70rem]"
                />
            </InputGroup>
            <InputGroup label="Format" className="whitespace-nowrap">
                <FormatInput
                    formObj={formObj}
                    name={`resources.${index}.format`}
                />
            </InputGroup>
<div className="mt-10">
                <h2 className="font-semibold text-lg flex items-center gap-x-2">
                    Location Coverage
                    <DefaultTooltip content="This field defines whether a data file will show up on the results or not when doing a search by location">
                        <InformationCircleIcon
                            className="h-5 w-5 text-neutral-500"
                            aria-hidden="true"
                        />
                    </DefaultTooltip>
                </h2>
                <DatafileLocation formObj={formObj} index={index} />
            </div>
        </div>
    )
}
