import { FolderPlusIcon, MinusCircleIcon } from '@heroicons/react/24/outline'
import { Disclosure } from '@headlessui/react'
import { Input } from '@/components/_shared/SimpleInput'
import { InputGroup } from '@/components/_shared/InputGroup'
import { PlusCircleIcon } from '@heroicons/react/20/solid'
import { MetadataAccordion } from './MetadataAccordion'
import { DatasetFormType } from '@/schema/dataset.schema'
import {
    UseFieldArrayRemove,
    UseFormRegister,
    UseFormReturn,
    useFieldArray,
} from 'react-hook-form'
import { DefaultTooltip } from '@/components/_shared/Tooltip'

function CustomField({
    register,
    index,
    remove,
}: {
    register: UseFormRegister<DatasetFormType>
    index: number
    remove: UseFieldArrayRemove
}) {
    return (
        <div className="flex items-center gap-x-2">
            <div className="grid grow grid-cols-1 items-start gap-x-24 md:grid-cols-2">
                <InputGroup label="Custom Field">
                    <Input
                        placeholder=""
                        {...register(`customFields.${index}.name`)}
                        type="text"
                    />
                </InputGroup>
                <InputGroup label="Value">
                    <Input
                        placeholder=""
                        {...register(`customFields.${index}.value`)}
                        type="text"
                    />
                </InputGroup>
            </div>
            <DefaultTooltip content="Remove custom field">
                <MinusCircleIcon
                    onClick={() => remove(index)}
                    className="h-5 w-5 text-red-600"
                />
            </DefaultTooltip>
        </div>
    )
}

export function CustomFieldsForm({
    formObj,
}: {
    formObj: UseFormReturn<DatasetFormType>
}) {
    const { control, register } = formObj
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'customFields',
    })
    return (
        <MetadataAccordion
            label={
                <>
                    <FolderPlusIcon className="h-7 w-7" />
                    Custom Fields
                </>
            }
        >
            <Disclosure.Panel className="py-5">
                {fields.map((field, index) => (
                    <CustomField
                        key={field.id}
                        index={index}
                        remove={remove}
                        register={register}
                    />
                ))}
                <div className="w-full flex justify-end">
                    <button
                        onClick={() =>
                            append({
                                name: '',
                                value: '',
                            })
                        }
                        className="pt-5 flex items-center justify-end gap-x-1"
                    >
                        <PlusCircleIcon className="h-5 w-5 text-amber-400" />
                        <div className="font-['Acumin Pro SemiCondensed'] text-xl font-normal leading-tight text-black">
                            Add a custom field
                        </div>
                    </button>
                </div>
            </Disclosure.Panel>
        </MetadataAccordion>
    )
}
