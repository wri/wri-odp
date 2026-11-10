import { MinusCircleIcon, PlusCircleIcon, SquaresPlusIcon } from '@heroicons/react/24/outline';
import { Disclosure } from '@headlessui/react';
import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup';
import { MetadataAccordion } from './MetadataAccordion';
import { type UseFormReturn, useFieldArray } from 'react-hook-form';
import { type DatasetFormType } from '@/schema/dataset.schema';
import { DefaultTooltip } from '@/components/_shared/Tooltip';
import { Input, Select } from '@/components/_shared/SimpleInput';
import { SimpleEditor } from './RTE/SimpleEditor';
import { additionalReadingTagOptions } from '../formOptions';

export function MoreDetailsForm({ formObj }: { formObj: UseFormReturn<DatasetFormType> }) {
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
                    <SquaresPlusIcon className="h-7 w-7" />
                    More Details
                </>
            }
        >
            <Disclosure.Panel className="grid grid-cols-1 items-start gap-x-24 py-5">
                <div className="flex flex-col justify-start gap-y-4">
                    <InputGroup
                        label="Additional reading"
                        info="Add external references related to this dataset. Choose a category for each link: Publication (research or report where the dataset is used), Documentation (guides or manuals on how to use the data), Source code (GitHub repositories or reproducibility packages), or Announcement (launch, update, or sunsetting notices)."
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

                            <DefaultTooltip content="Add external references related to this dataset, such as publications, documentation, source code, or announcements.">
                                <button
                                    type="button"
                                    onClick={() =>
                                        append({
                                            title: '',
                                            tag: 'publication',
                                            url: '',
                                        })
                                    }
                                    className="flex items-center gap-x-2 text-wri-green"
                                >
                                    <PlusCircleIcon className="h-5 w-5" />
                                    Add link
                                </button>
                            </DefaultTooltip>
                        </div>
                    </InputGroup>
                    <InputGroup
                        label="Cautions"
                        info="Describe any quality issues or limitations that data users should know about"
                        className="min-h-[320px]"
                    >
                        <SimpleEditor
                            formObj={formObj}
                            name="cautions"
                            className="min-h-[320px]"
                            defaultValue=""
                        />
                    </InputGroup>
                    <InputGroup label="Methodology" className="min-h-[320px]">
                        <SimpleEditor
                            formObj={formObj}
                            name="methodology"
                            className="min-h-[320px]"
                            defaultValue=""
                        />
                    </InputGroup>
                    <InputGroup
                        label="Dataset API"
                        info="This field will end up next to the API tab in the Dataset page, you can use it to provide code samples that are useful for this particular data, the string {% DATASET_URL %} will get replaced with the actual url for this particular Dataset"
                        contentClassName="max-w-sm whitespace-normal lg:max-w-xl"
                        className="min-h-[320px]"
                    >
                        <SimpleEditor
                            formObj={formObj}
                            name="usecases"
                            className="min-h-[320px]"
                            defaultValue=""
                        />
                    </InputGroup>
                </div>
            </Disclosure.Panel>
        </MetadataAccordion>
    );
}
