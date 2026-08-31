import {
    ArrowsPointingInIcon,
    InformationCircleIcon,
    MinusCircleIcon,
    PlusCircleIcon,
} from '@heroicons/react/24/outline';
import { Disclosure } from '@headlessui/react';
import { type UseFormReturn, useFieldArray } from 'react-hook-form';
import classNames from '@/utils/classnames';
import { type DatasetFormType } from '@/schema/dataset.schema';
import { DefaultTooltip } from '@/components/_shared/Tooltip';
import { Input } from '@/components/_shared/SimpleInput';
import { TextArea } from '@/components/_shared/SimpleTextArea';
import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup';
import SimpleSelect from '@/components/_shared/SimpleSelect';
import { MetadataAccordion } from './MetadataAccordion';
import { visibilityOptions } from '../formOptions';

export function OverviewForm({
    formObj,
    editing = false,
}: {
    formObj: UseFormReturn<DatasetFormType>;
    editing?: boolean;
}) {
    const {
        control,
        register,
        watch,
        getValues,
        formState: { errors },
    } = formObj;

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'open_in',
    });

    return (
        <MetadataAccordion
            defaultOpen={true}
            label={
                <>
                    <ArrowsPointingInIcon className="h-7 w-7" />
                    Overview
                </>
            }
        >
            <Disclosure.Panel className="grid grid-cols-1 items-start gap-x-12 gap-y-4 py-5 lg:grid-cols-2 xxl:gap-x-24">
                <div className="flex flex-col justify-start gap-y-4">
                    <InputGroup label="Title" required>
                        <Input {...register('title')} placeholder="My Dataset" type="text" />
                        <ErrorDisplay name="title" errors={errors} />
                    </InputGroup>

                    <InputGroup label="URL" required>
                        <Input
                            {...register('name')}
                            disabled={editing}
                            placeholder="name-of-dataset"
                            type="text"
                            icon={
                                <DefaultTooltip content="Please choose a URL that is not already in use for another Dataset.">
                                    <InformationCircleIcon className="z-10 h-4 w-4 text-gray-300" />
                                </DefaultTooltip>
                            }
                            className={`pl-[5.9rem] sm:pl-[5.6rem] md:pl-[5.2rem] lg:pl-[5.4rem] ${editing ? 'hidden' : ''} `}
                        >
                            {editing ? (
                                <input
                                    disabled
                                    value={`/datasets/${getValues('name') || ''}`}
                                    className="shadow-wri-small block w-full rounded-md border-0 px-5 py-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-b-2 focus:border-blue-800 disabled:bg-gray-100 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6 min-w-0 overflow-x-auto"
                                />
                            ) : (
                                <span className="absolute inset-y-0 left-5 flex items-center pr-3 sm:text-sm sm:leading-6">
                                    /datasets/
                                </span>
                            )}
                        </Input>
                        <ErrorDisplay name="name" errors={errors} />
                    </InputGroup>

                    <InputGroup
                        required
                        label={
                            <div className="flex items-center gap-x-1">
                                <span>
                                    Caption <span className="text-red-500">*</span>
                                </span>
                                <DefaultTooltip content="This caption will appear in search results and Dataset thumbnails. Maximum: 200 characters.">
                                    <InformationCircleIcon
                                        className="h-5 w-5 text-neutral-500"
                                        aria-hidden="true"
                                    />
                                </DefaultTooltip>
                            </div>
                        }
                        className="mb-2 flex flex-col items-start whitespace-nowrap sm:flex-col"
                    >
                        <TextArea
                            aria-label="Caption"
                            placeholder=""
                            type="text"
                            maxLength={200}
                            {...register('short_description')}
                            className="h-44 col-span-full"
                        />
                        <ErrorDisplay name="short_description" errors={errors} />
                    </InputGroup>

                    <InputGroup label="DOI">
                        <Input
                            {...register('doi')}
                            placeholder="ex. 10.1038/s41586-020-2649-2"
                            type="text"
                        />
                        <ErrorDisplay name="doi" errors={errors} />
                    </InputGroup>
                </div>

                <div className="flex flex-col justify-start gap-y-4">
                    <InputGroup label="Application links">
                        <div className="flex w-full flex-col gap-y-3">
                            {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]"
                                >
                                    <div>
                                        <Input
                                            placeholder="Title"
                                            {...register(`open_in.${index}.title`)}
                                            type="text"
                                        />
                                        <ErrorDisplay
                                            name={`open_in.${index}.title`}
                                            errors={errors}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            placeholder="https://example.com"
                                            {...register(`open_in.${index}.url`)}
                                            type="text"
                                        />
                                        <ErrorDisplay
                                            name={`open_in.${index}.url`}
                                            errors={errors}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="inline-flex items-center justify-center text-red-600"
                                        aria-label="Remove application link"
                                    >
                                        <MinusCircleIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={() => append({ title: '', url: '' })}
                                className="inline-flex items-center gap-x-2 text-wri-green"
                            >
                                <PlusCircleIcon className="h-5 w-5" />
                                Add application link
                            </button>
                        </div>
                    </InputGroup>

                    <InputGroup
                        label="Visibility"
                        required
                        info={
                            <ul>
                                <li>
                                    Public Datasets are visible to any user,
                                    including public and anonymous.
                                </li>
                                <li>
                                    Private Datasets are only visible to Team members.
                                </li>
                                <li>
                                    Internal Use Datasets are visible to any Data Explorer user with a login.
                                </li>
                            </ul>
                        }
                    >
                        <SimpleSelect
                            placeholder="Select visibility"
                            name="visibility_type"
                            id="visibility_type"
                            formObj={formObj}
                            options={visibilityOptions}
                        />
                        <ErrorDisplay name="visibility_type" errors={errors} />
                    </InputGroup>

                    <div className="relative flex justify-end">
                        <div className="flex h-6 items-center">
                            <input
                                id="wri_data"
                                aria-describedby="comments-description"
                                {...register('wri_data')}
                                type="checkbox"
                                className="h-5 w-5 rounded border-gray-300 text-blue-800 shadow focus:ring-blue-800"
                            />
                        </div>
                        <div className="ml-3 text-sm leading-6">
                            <label
                                htmlFor="wri_data"
                                className="flex items-center gap-x-2 font-acumin text-lg font-light text-zinc-800"
                            >
                                This Dataset was developed by WRI
                                <DefaultTooltip content="Checking this box flags this Dataset as having been produced and curated by WRI">
                                    <InformationCircleIcon className="mb-auto mt-0.5 h-5 w-5 text-zinc-800" />
                                </DefaultTooltip>
                            </label>
                        </div>
                    </div>

                    <div
                        className={classNames(
                            'items-end flex-col justify-end space-y-5',
                            watch('visibility_type')?.value === 'public' ? 'flex' : 'hidden'
                        )}
                    >
                        <div className="relative flex justify-end">
                            <div className="flex h-6 items-center">
                                <input
                                    id="featured_dataset"
                                    aria-describedby="comments-description"
                                    {...register('featured_dataset')}
                                    type="checkbox"
                                    className="h-5 w-5 rounded border-gray-300 text-blue-800 shadow focus:ring-blue-800"
                                />
                            </div>
                            <div className="ml-3 text-sm leading-6">
                                <label
                                    htmlFor="featured_dataset"
                                    className="flex items-center gap-x-2 font-acumin text-lg font-light text-zinc-800"
                                >
                                    Request to be featured in Dataset Highlights
                                    <DefaultTooltip content="Checking this box will send a feature request to an administrator. The Dataset will appear under 'Dataset Highlights' (on the homepage) only upon approval.">
                                        <InformationCircleIcon className="mb-auto mt-0.5 h-5 w-5 text-zinc-800" />
                                    </DefaultTooltip>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </Disclosure.Panel>
        </MetadataAccordion>
    );
}
