import { ArrowUpRightIcon, MinusCircleIcon } from '@heroicons/react/24/outline'
import { Disclosure } from '@headlessui/react'
import { Input } from '@/components/_shared/SimpleInput'
import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup'
import { PlusCircleIcon } from '@heroicons/react/20/solid'
import { MetadataAccordion } from './MetadataAccordion'
import { DatasetFormType } from '@/schema/dataset.schema'
import {
    FieldErrors,
    UseFieldArrayRemove,
    UseFormRegister,
    UseFormReturn,
    useFieldArray,
} from 'react-hook-form'
import { DefaultTooltip } from '@/components/_shared/Tooltip'

function OpenIn({
    register,
    index,
    remove,
    errors,
}: {
    register: UseFormRegister<DatasetFormType>
    errors: FieldErrors<DatasetFormType>
    index: number
    remove: UseFieldArrayRemove
}) {
    return (
        <div className="flex items-center gap-x-2">
            <div className="grid grow grid-cols-1 items-start gap-x-24 md:grid-cols-2">
                <InputGroup label="Title">
                    <Input
                        placeholder=""
                        {...register(`open_in.${index}.title`)}
                        type="text"
                    />
                    <ErrorDisplay
                        name={`open_in.${index}.title`}
                        errors={errors}
                    />
                </InputGroup>
                <InputGroup label="Url">
                    <Input
                        placeholder=""
                        {...register(`open_in.${index}.url`)}
                        type="text"
                    />
                    <ErrorDisplay
                        name={`open_in.${index}.url`}
                        errors={errors}
                    />
                </InputGroup>
            </div>
            <DefaultTooltip content="Remove open in item">
                <MinusCircleIcon
                    onClick={() => remove(index)}
                    className="h-5 w-5 text-red-600"
                />
            </DefaultTooltip>
        </div>
    )
}

export function OpenInForm({
    formObj,
}: {
    formObj: UseFormReturn<DatasetFormType>
}) {
    const {
        control,
        register,
        formState: { errors },
    } = formObj
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'open_in',
    })
    return (
        <MetadataAccordion
            label={
                <>
                    <ArrowUpRightIcon className="h-7 w-7" />
                    Open In
                </>
            }
        >
            <Disclosure.Panel className="py-5 flex flex-col gap-y-4">
                {fields.map((field, index) => (
                    <OpenIn
                        key={field.id}
                        errors={errors}
                        index={index}
                        remove={remove}
                        register={register}
                    />
                ))}
                <div className="w-full flex justify-end">
                    <DefaultTooltip content="This allows you to link your dataset to an external application, you could for example add a link to the same dataset in the Global Forest Wath website">
                        <button
                            type="button"
                            onClick={() =>
                                append({
                                    title: '',
                                    url: '',
                                })
                            }
                            className="pt-5 flex items-center justify-end gap-x-1"
                        >
                            <PlusCircleIcon className="h-5 w-5 text-amber-400" />
                            <div className="font-['Acumin Pro SemiCondensed'] text-xl font-normal leading-tight text-black">
                                Add a open-in field
                            </div>
                        </button>
                    </DefaultTooltip>
                </div>
            </Disclosure.Panel>
        </MetadataAccordion>
    )
}
