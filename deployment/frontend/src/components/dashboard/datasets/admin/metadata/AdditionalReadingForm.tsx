import { BookOpenIcon, MinusCircleIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { Disclosure } from '@headlessui/react';
import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup';
import { MetadataAccordion } from './MetadataAccordion';
import { type UseFormReturn, useFieldArray } from 'react-hook-form';
import { type DatasetFormType } from '@/schema/dataset.schema';
import { Input, Select } from '@/components/_shared/SimpleInput';
import { additionalReadingTagOptions } from '../formOptions';

export function AdditionalReadingForm({ formObj }: { formObj: UseFormReturn<DatasetFormType> }) {
    const {
        control,
        register,
        formState: { errors },
    } = formObj;

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'additional_reading',
    });

    return (
        <MetadataAccordion
            label={
                <>
                    <BookOpenIcon className="h-7 w-7" />
                    Additional reading
                </>
            }
        >
            <Disclosure.Panel className="py-5">
                <InputGroup
                    label="Articles & other links"
                    info="Add links to helpful supplemental documents such as blog posts and papers. These will appear below the description."
                >
                    <div className="flex flex-col gap-y-3 w-full">
                        {fields.map((field, index) => (
                            <div
                                key={field.id}
                                className="grid grid-cols-1 items-start gap-3 md:grid-cols-[1.2fr_1fr_1.2fr_auto]"
                            >
                                <div>
                                    <Input
                                        placeholder="Title"
                                        {...register(`additional_reading.${index}.title`)}
                                        type="text"
                                    />
                                    <ErrorDisplay
                                        name={`additional_reading.${index}.title`}
                                        errors={errors}
                                    />
                                </div>
                                <div>
                                    <Select
                                        {...register(`additional_reading.${index}.tag`)}
                                        aria-label="Link category"
                                    >
                                        {additionalReadingTagOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </Select>
                                    <ErrorDisplay
                                        name={`additional_reading.${index}.tag`}
                                        errors={errors}
                                    />
                                </div>
                                <div>
                                    <Input
                                        placeholder="https://example.com/link"
                                        {...register(`additional_reading.${index}.url`)}
                                        type="text"
                                    />
                                    <ErrorDisplay
                                        name={`additional_reading.${index}.url`}
                                        errors={errors}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="inline-flex items-center justify-center text-red-600 mt-3"
                                    aria-label="Remove additional reading item"
                                >
                                    <MinusCircleIcon className="h-5 w-5" />
                                </button>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={() =>
                                append({
                                    title: '',
                                    tag: 'publication',
                                    url: '',
                                })
                            }
                            className="inline-flex items-center gap-x-2 text-wri-green"
                        >
                            <PlusCircleIcon className="h-5 w-5" />
                            Add link
                        </button>
                    </div>
                </InputGroup>
            </Disclosure.Panel>
        </MetadataAccordion>
    );
}
