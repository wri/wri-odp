import {
    ClockIcon,
    InformationCircleIcon,
    MinusCircleIcon,
    PlusCircleIcon,
} from '@heroicons/react/24/outline';
import { Disclosure } from '@headlessui/react';
import { MetadataAccordion } from './MetadataAccordion';
import { type DatasetFormType } from '@/schema/dataset.schema';
import { type UseFormReturn, useFieldArray } from 'react-hook-form';
import { DefaultTooltip } from '@/components/_shared/Tooltip';
import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup';
import { TextArea } from '@/components/_shared/SimpleTextArea';
import { Input } from '@/components/_shared/SimpleInput';

export function VersioningForm({
    formObj,
}: {
    formObj: UseFormReturn<DatasetFormType>;
}) {
    const {
        control,
        register,
        formState: { errors },
    } = formObj;
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'release_notes_items',
    });

    return (
        <MetadataAccordion
            defaultOpen
            label={
                <>
                    <ClockIcon className="h-7 w-7" />
                    Release notes
                </>
            }
        >
            <Disclosure.Panel className="py-5 flex flex-col gap-y-4">
                <div className="mb-2 flex flex-col gap-y-4">
                    <div className="flex items-center gap-x-1">
                        <span className="text-lg font-light text-zinc-800">Release notes</span>
                        <DefaultTooltip content="Release notes describe to users what has changed since the last version.">
                            <InformationCircleIcon
                                className="h-5 w-5 text-neutral-500"
                                aria-hidden="true"
                            />
                        </DefaultTooltip>
                    </div>

                    {fields.map((field, index) => (
                        <div key={field.id} className="rounded-md border border-neutral-200 p-4">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-[220px_1fr_auto] md:items-start">
                                <InputGroup label="Date" className="mb-0">
                                    <Input
                                        type="date"
                                        {...register(`release_notes_items.${index}.date`)}
                                    />
                                    <ErrorDisplay
                                        name={`release_notes_items.${index}.date`}
                                        errors={errors}
                                    />
                                </InputGroup>

                                <InputGroup label="Release note" className="mb-0">
                                    <TextArea
                                        type="text"
                                        placeholder="Describe what changed in this release"
                                        className="min-h-[120px]"
                                        {...register(`release_notes_items.${index}.note`)}
                                    />
                                    <ErrorDisplay
                                        name={`release_notes_items.${index}.note`}
                                        errors={errors}
                                    />
                                </InputGroup>

                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="inline-flex items-center justify-center text-red-600 md:mt-8"
                                    aria-label="Remove release note"
                                >
                                    <MinusCircleIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={() => append({ date: '', note: '' })}
                        className="inline-flex items-center gap-x-2 text-wri-green"
                    >
                        <PlusCircleIcon className="h-5 w-5" />
                        Add another release note
                    </button>

                    <ErrorDisplay name="release_notes_items" errors={errors} />
                </div>
            </Disclosure.Panel>
        </MetadataAccordion>
    );
}
