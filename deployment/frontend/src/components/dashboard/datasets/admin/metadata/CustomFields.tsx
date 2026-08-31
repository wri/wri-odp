import {
    FolderPlusIcon,
    InformationCircleIcon,
    MinusCircleIcon,
} from '@heroicons/react/24/outline';
import { Disclosure } from '@headlessui/react';
import { Input } from '@/components/_shared/SimpleInput';
import { InputGroup } from '@/components/_shared/InputGroup';
import { PlusCircleIcon } from '@heroicons/react/20/solid';
import { MetadataAccordion } from './MetadataAccordion';
import { type DatasetFormType } from '@/schema/dataset.schema';
import {
    type UseFieldArrayRemove,
    type UseFormRegister,
    type UseFormReturn,
    useFieldArray,
} from 'react-hook-form';
import { DefaultTooltip } from '@/components/_shared/Tooltip';

function CustomField({
    register,
    index,
    remove,
}: {
    register: UseFormRegister<DatasetFormType>;
    index: number;
    remove: UseFieldArrayRemove;
}) {
    return (
        <div className="flex items-center gap-x-2">
            <div className="grid grow grid-cols-1 items-start gap-x-24 md:grid-cols-2">
                <InputGroup label="Attribute">
                    <Input
                        placeholder=""
                        {...register(`extras.${index}.key`)}
                        type="text"
                    />
                </InputGroup>
                <InputGroup label="Value">
                    <Input
                        placeholder=""
                        {...register(`extras.${index}.value`)}
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
    );
}

export function CustomFieldsForm({
    formObj,
}: {
    formObj: UseFormReturn<DatasetFormType>;
}) {
    const { control, register } = formObj;
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'extras',
    });
    const canAddMore = fields.length < 3;
    return (
        <MetadataAccordion
            label={
                <>
                    <FolderPlusIcon className="h-7 w-7" />
                    Custom attributes
                    <DefaultTooltip content="Add up to three key details that help users quickly understand this dataset. Use these fields for important dataset-specific attributes that aren't already captured elsewhere, such as spatial resolution, temporal coverage or scale.">
                        <InformationCircleIcon
                            className="h-5 w-5 text-neutral-500"
                            aria-hidden="true"
                        />
                    </DefaultTooltip>
                </>
            }
        >
            <Disclosure.Panel className="py-5 flex flex-col gap-y-4">
                {fields.map((field, index) => (
                    <CustomField
                        key={field.id}
                        index={index}
                        remove={remove}
                        register={register}
                    />
                ))}
                {canAddMore && (
                    <div className="w-full flex justify-end">
                        <button
                            type="button"
                            onClick={() =>
                                append({
                                    key: '',
                                    value: '',
                                })
                            }
                            className="pt-5 flex items-center justify-end gap-x-1"
                        >
                            <PlusCircleIcon className="h-5 w-5 text-amber-400" />
                            <div className="font-['Acumin Pro SemiCondensed'] text-xl font-normal leading-tight text-black">
                                Add a custom attribute
                            </div>
                        </button>
                    </div>
                )}
            </Disclosure.Panel>
        </MetadataAccordion>
    );
}
