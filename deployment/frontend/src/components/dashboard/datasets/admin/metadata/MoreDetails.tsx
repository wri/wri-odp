import {
    InformationCircleIcon,
    MinusCircleIcon,
    PlusCircleIcon,
    SquaresPlusIcon,
} from '@heroicons/react/24/outline';
import { Disclosure } from '@headlessui/react';
import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup';
import { MetadataAccordion } from './MetadataAccordion';
import { type UseFormReturn, useFieldArray } from 'react-hook-form';
import { type DatasetFormType } from '@/schema/dataset.schema';
import { DefaultTooltip } from '@/components/_shared/Tooltip';
import { Input } from '@/components/_shared/SimpleInput';
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
                        label="Articles & other links"
                        className="mb-2 flex flex-col items-start whitespace-nowrap sm:flex-col"
                    >
                        <div className="flex flex-col gap-y-3 w-full">
                            {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="grid grid-cols-1 gap-3 md:grid-cols-[1.2fr_0.8fr_1.2fr_auto]"
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
                                        <select
                                            {...register(`additional_reading.${index}.tag`)}
                                            className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                                        >
                                            {additionalReadingTagOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        <ErrorDisplay
                                            name={`additional_reading.${index}.tag`}
                                            errors={errors}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            placeholder="https://example.com/article"
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
                                        className="inline-flex items-center justify-center text-red-600"
                                        aria-label="Remove additional reading item"
                                    >
                                        <MinusCircleIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}

                            <DefaultTooltip content="Add external references related to this dataset, such as articles, publications, reports, documentation, or blog posts.">
                                <button
                                    type="button"
                                    onClick={() =>
                                        append({
                                            title: '',
                                            tag: 'article',
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
                        className="mb-2 flex min-h-[320px] flex-col items-start whitespace-nowrap sm:flex-col"
                        info="Describe any quality issues or limitations that data users should know about"
                    >
                        <SimpleEditor
                            formObj={formObj}
                            name="cautions"
                            className="min-h-[320px]"
                            defaultValue=""
                        />
                    </InputGroup>
                    <InputGroup
                        label="Methodology"
                        className="mb-2 flex min-h-[320px] flex-col items-start whitespace-nowrap sm:flex-col"
                    >
                        <SimpleEditor
                            formObj={formObj}
                            name="methodology"
                            className="min-h-[320px]"
                            defaultValue=""
                        />
                    </InputGroup>
                    <InputGroup
                        label={
                            <span className="relative flex items-center gap-x-1">
                                Advanced API Usage
                                <DefaultTooltip
                                    contentClassName="max-w-sm whitespace-normal lg:max-w-xl"
                                    side="right"
                                    content="This field will end up next to the API tab in the Dataset page, you can use it to provide code samples that are useful for this particular data, the string {% DATASET_URL %} will get replaced with the actual url for this particular Dataset"
                                >
                                    <InformationCircleIcon className="h-5 w-5" />
                                </DefaultTooltip>
                            </span>
                        }
                        className="mb-2 flex min-h-[320px] flex-col items-start whitespace-nowrap sm:flex-col"
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
