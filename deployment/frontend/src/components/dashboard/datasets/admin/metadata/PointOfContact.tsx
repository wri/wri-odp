import {
    ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { Input } from '@/components/_shared/SimpleInput';
import { InputGroup } from '@/components/_shared/InputGroup';
import { Disclosure } from '@headlessui/react';
import { MetadataAccordion } from './MetadataAccordion';
import { type UseFormReturn, useFieldArray } from 'react-hook-form';
import { type DatasetFormType } from '@/schema/dataset.schema';
import {
    MinusCircleIcon,
    PlusCircleIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { DefaultTooltip } from '@/components/_shared/Tooltip';

export function PointOfContactForm({
    formObj,
}: {
    formObj: UseFormReturn<DatasetFormType>;
}) {
    const {
        control,
        register,
        formState: { errors },
    } = formObj;
    const {
        fields: maintainerFields,
        append: appendMaintainer,
        remove: removeMaintainer,
    } = useFieldArray({
        control,
        name: 'maintainers',
    });

    const handleNewMaintainer = () => {
        appendMaintainer({ name: '', email: '' });
    };

    return (
        <MetadataAccordion
            defaultOpen
            label={
                <>
                    <ChatBubbleLeftRightIcon className="h-7 w-7" />
                    Contact details
                </>
            }
        >
            <Disclosure.Panel className="py-5 flex flex-col gap-y-6">
                {/* Maintainers */}
                <InputGroup
                    label={
                        <div className="flex items-center gap-x-1 pb-10">
                            <span className="text-lg font-semibold">
                                Data maintainers{' '}
                                <span className="text-red-500">*</span>
                            </span>
                            <DefaultTooltip content="Maintainers are the people who are responsible for the day-to-day maintenance of the Dataset.">
                                <InformationCircleIcon
                                    className="h-5 w-5 text-neutral-500"
                                    aria-hidden="true"
                                />
                            </DefaultTooltip>
                        </div>
                    }
                    className="mb-2 flex flex-col items-start sm:flex-col"
                >
                    <div className="border-b border-gray-300 pb-4 mb-4">
                        {maintainerFields.length === 0 && (
                            <div>
                                <span
                                    className={
                                        errors?.maintainers
                                            ? 'text-red-600'
                                            : 'text-gray-600'
                                    }
                                >
                                    <i>
                                        {errors?.maintainers?.message ||
                                            'At least one (1) Maintainer Name and Maintainer Email is required.'}
                                    </i>
                                </span>
                            </div>
                        )}
                        {maintainerFields.map((field, index) => (
                            <div
                                key={field.id}
                                className="flex items-center gap-x-4 border-b border-gray-150 pb-4 mb-4"
                            >
                                <div className="flex flex-col gap-y-2 flex-grow flex-wrap">
                                    <InputGroup
                                        label={<span>Data maintainer name</span>}
                                    >
                                        <Input
                                            {...register(
                                                `maintainers.${index}.name`
                                            )}
                                            placeholder="Data maintainer name"
                                            type="text"
                                        />
                                        {Array.isArray(errors?.maintainers) &&
                                            errors?.maintainers[index]?.name
                                                ?.message && (
                                                <div>
                                                    <span className="text-red-500">
                                                        <i>
                                                            {
                                                                errors
                                                                    .maintainers[
                                                                    index
                                                                ].name.message
                                                            }
                                                        </i>
                                                    </span>
                                                </div>
                                            )}
                                    </InputGroup>
                                    <InputGroup
                                        label={<span>Data maintainer email</span>}
                                    >
                                        <Input
                                            {...register(
                                                `maintainers.${index}.email`
                                            )}
                                            placeholder="email@example.com"
                                            type="email"
                                        />
                                        {Array.isArray(errors?.maintainers) &&
                                            errors?.maintainers[index]?.email
                                                ?.message && (
                                                <div>
                                                    <span className="text-red-500">
                                                        <i>
                                                            {
                                                                errors
                                                                    .maintainers[
                                                                    index
                                                                ].email.message
                                                            }
                                                        </i>
                                                    </span>
                                                </div>
                                            )}
                                    </InputGroup>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeMaintainer(index)}
                                    className="flex items-center gap-x-1 flex-shrink-0 whitespace-nowrap"
                                >
                                    <MinusCircleIcon className="h-5 w-5 text-red-600" />
                                    Remove data maintainer
                                </button>
                            </div>
                        ))}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleNewMaintainer}
                                className="pt-5 flex items-center justify-end gap-x-1"
                            >
                                <PlusCircleIcon className="h-5 w-5 text-amber-400" />
                                Add data maintainer
                            </button>
                        </div>
                    </div>
                </InputGroup>
            </Disclosure.Panel>
        </MetadataAccordion>
    );
}
