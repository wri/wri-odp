import {
    Bars3BottomLeftIcon,
    MinusCircleIcon,
    PlusCircleIcon,
} from '@heroicons/react/24/outline';
import { Disclosure } from '@headlessui/react';
import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup';
import { MetadataAccordion } from './MetadataAccordion';
import { type DatasetFormType } from '@/schema/dataset.schema';
import { type UseFormReturn, useFieldArray } from 'react-hook-form';
import { api } from '@/utils/api';
import { P, match } from 'ts-pattern';
import Spinner from '@/components/_shared/Spinner';
import MulText from '../MulText';
import { TopicsSelect } from '../TopicsSelect';
import SimpleSelect from '@/components/_shared/SimpleSelect';
import { Input } from '@/components/_shared/SimpleInput';
import { languageOptions, updateFrequencyOptions } from '../formOptions';

export function AdditionalMetadataForm({
    formObj,
}: {
    formObj: UseFormReturn<DatasetFormType>;
}) {
    const {
        control,
        register,
        formState: { errors },
    } = formObj;

    const possibleTags = api.tags.getAllTags.useQuery();
    const possibleApplications = api.applications.getAllApplications.useQuery();
    const topicHierarchy = api.topics.getTopicsHierarchy.useQuery();

    const {
        fields: authorFields,
        append: appendAuthor,
        remove: removeAuthor,
    } = useFieldArray({
        control,
        name: 'authors',
    });

    return (
        <MetadataAccordion
            label={
                <>
                    <Bars3BottomLeftIcon className="h-7 w-7" />
                    Additional metadata
                </>
            }
        >
            <Disclosure.Panel className="grid grid-cols-1 items-start gap-x-12 gap-y-4 py-5 lg:grid-cols-2 xxl:gap-x-24">
                <div className="flex flex-col justify-start gap-y-4">
                    <InputGroup label="Topic(s)">
                        {match(topicHierarchy)
                            .with({ isLoading: true }, () => (
                                <span className="flex items-center text-sm gap-x-2">
                                    <Spinner />
                                    <span className="mt-1">Loading Topics...</span>
                                </span>
                            ))
                            .with({ isError: true }, () => (
                                <span className="flex items-center text-sm text-red-600">
                                    Error loading Topics, please refresh the page
                                </span>
                            ))
                            .with(
                                { isSuccess: true, data: P.select() },
                                (data) => (
                                    <TopicsSelect
                                        userTopics={data.userTopics}
                                        topicHierarchy={data.hierarchy}
                                        formObj={formObj}
                                    />
                                )
                            )
                            .otherwise(() => (
                                <span className="flex items-center text-sm text-red-600">
                                    Error loading Topics, please refresh the page
                                </span>
                            ))}
                    </InputGroup>

                    <InputGroup label="Application">
                        {match(possibleApplications)
                            .with({ isLoading: true }, () => (
                                <span className="flex items-center text-sm gap-x-2">
                                    <Spinner />
                                    <span className="mt-1">Loading Applications...</span>
                                </span>
                            ))
                            .with({ isError: true }, () => (
                                <span className="flex items-center text-sm text-red-600">
                                    Error loading Applications, please refresh the page
                                </span>
                            ))
                            .with(
                                { isSuccess: true, data: P.select() },
                                (data) => (
                                    <MulText
                                        name="applications"
                                        formObj={formObj}
                                        options={data.map((app) => ({
                                            label: app.title,
                                            value: app.name,
                                        }))}
                                        title="Application"
                                        tooltip="Remove application"
                                        removeItemAriaLabel="Remove application"
                                    />
                                )
                            )
                            .otherwise(() => (
                                <span className="flex items-center text-sm text-red-600">
                                    Error loading Applications, please refresh the page
                                </span>
                            ))}
                    </InputGroup>

                    <InputGroup label="Keywords">
                        {match(possibleTags)
                            .with({ isLoading: true }, () => (
                                <span className="flex items-center text-sm gap-x-2">
                                    <Spinner />
                                    <span className="mt-1">Loading keywords...</span>
                                </span>
                            ))
                            .with({ isError: true }, () => (
                                <span className="flex items-center text-sm text-red-600">
                                    Error loading keywords, please refresh the page
                                </span>
                            ))
                            .with(
                                { isSuccess: true, data: P.select() },
                                (data) => (
                                    <MulText
                                        name="tags"
                                        formObj={formObj}
                                        options={data}
                                        title="Keywords"
                                        tooltip="Remove keyword"
                                        removeItemAriaLabel="Remove keyword"
                                        allowsCreationOfItems
                                    />
                                )
                            )
                            .otherwise(() => (
                                <span className="flex items-center text-sm text-red-600">
                                    Error loading keywords, please refresh the page
                                </span>
                            ))}
                    </InputGroup>
                </div>

                <div className="flex flex-col justify-start gap-y-4">
                    <InputGroup label="Authors">
                        <div className="flex flex-col gap-y-3 w-full">
                            {authorFields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]"
                                >
                                    <div>
                                        <Input
                                            placeholder="Author name"
                                            {...register(`authors.${index}.name`)}
                                            type="text"
                                        />
                                        <ErrorDisplay
                                            name={`authors.${index}.name`}
                                            errors={errors}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            placeholder="author@example.com"
                                            {...register(`authors.${index}.email`)}
                                            type="text"
                                        />
                                        <ErrorDisplay
                                            name={`authors.${index}.email`}
                                            errors={errors}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeAuthor(index)}
                                        className="inline-flex items-center justify-center text-red-600"
                                        aria-label="Remove author"
                                    >
                                        <MinusCircleIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={() => appendAuthor({ name: '', email: '' })}
                                className="inline-flex items-center gap-x-2 text-wri-green"
                            >
                                <PlusCircleIcon className="h-5 w-5" />
                                Add author
                            </button>
                        </div>
                    </InputGroup>

                    <InputGroup label="Update frequency">
                        <SimpleSelect
                            formObj={formObj}
                            name="update_frequency"
                            id="update_frequency"
                            placeholder="Select update frequency"
                            options={updateFrequencyOptions}
                        />
                        <ErrorDisplay name="update_frequency" errors={errors} />
                    </InputGroup>

                    <InputGroup label="Project">
                        <Input
                            {...register('project')}
                            placeholder="ex. Climate Initiative"
                            type="text"
                        />
                    </InputGroup>

                    <InputGroup label="Language">
                        <SimpleSelect
                            id="language"
                            formObj={formObj}
                            name="language"
                            placeholder="Language"
                            options={languageOptions}
                        />
                    </InputGroup>
                </div>
            </Disclosure.Panel>
        </MetadataAccordion>
    );
}
