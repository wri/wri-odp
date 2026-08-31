import {
    ArrowsPointingInIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { Input } from '@/components/_shared/SimpleInput';
import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup';
import { Disclosure } from '@headlessui/react';
import SimpleSelect from '@/components/_shared/SimpleSelect';
import { TopicsSelect } from '../TopicsSelect';
import { MetadataAccordion } from './MetadataAccordion';
import { TextArea } from '@/components/_shared/SimpleTextArea';
import { type UseFormReturn } from 'react-hook-form';
import { type DatasetFormType } from '@/schema/dataset.schema';
import { DefaultTooltip } from '@/components/_shared/Tooltip';
import { api } from '@/utils/api';
import { P, match } from 'ts-pattern';
import Spinner from '@/components/_shared/Spinner';
import classNames from '@/utils/classnames';
import MulText from '../MulText';
import {
    datasetFormatInfoOptions,
    datasetTypeInfoOptions,
    languageOptions,
    updateFrequencyOptions,
    visibilityOptions,
} from '../formOptions';

export function OverviewForm({
    formObj,
    editing = false,
}: {
    formObj: UseFormReturn<DatasetFormType>;
    editing?: boolean;
}) {
    const {
        register,
        setValue,
        watch,
        getValues,
        formState: { errors, defaultValues },
    } = formObj;

    const possibleOwners = api.teams.getAllTeams.useQuery();
    const possibleTags = api.tags.getAllTags.useQuery();
    const possibleApplications = api.applications.getAllApplications.useQuery();
    const topicHierarchy = api.topics.getTopicsHierarchy.useQuery();
    const possibleLicenses = api.dataset.getLicenses.useQuery();

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
                        <Input
                            {...register('title')}
                            placeholder="My Dataset"
                            type="text"
                        />
                        <ErrorDisplay name="title" errors={errors} />
                    </InputGroup>
                                <InputGroup label="DOI">
                                    <Input
                                        {...register('doi')}
                                        placeholder="ex. 10.1038/s41586-020-2649-2"
                                        type="text"
                                    />
                                    <ErrorDisplay name="doi" errors={errors} />
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
                                    className=" shadow-wri-small block w-full rounded-md border-0 px-5 py-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-b-2 focus:border-blue-800 disabled:bg-gray-100 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6 min-w-0 overflow-x-auto"
                                ></input>
                            ) : (
                                <span className="absolute inset-y-0 left-5 flex items-center pr-3 sm:text-sm sm:leading-6">
                                    /datasets/
                                </span>
                            )}
                        </Input>
                        <ErrorDisplay name="name" errors={errors} />
                    </InputGroup>
                    <InputGroup label="Source">
                        <Input
                            {...register('url')}
                            placeholder="ex. https://source/to/original/data"
                            type="text"
                            icon={
                                <DefaultTooltip content="Optional reference link to the original data source. This will appear in the About section. To add direct links to Data Files (preferred), please go to the next page (Data Files tab)">
                                    <InformationCircleIcon className="z-10 h-4 w-4 text-gray-300" />
                                </DefaultTooltip>
                            }
                        />
                        <ErrorDisplay name="url" errors={errors} />
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
                    <InputGroup
                        label="Team"
                        required
                        info="Teams will only appear in the dropdown if you are an Admin or Editor of that Team. The padlock icon indicates the Team is private."
                    >
                        {match(possibleOwners)
                            .with({ isLoading: true }, () => (
                                <span className="flex items-center text-sm gap-x-2">
                                    <Spinner />{' '}
                                    <span className="mt-1">
                                        Loading Teams...
                                    </span>
                                </span>
                            ))
                            .with({ isError: true }, () => (
                                <span className="flex items-center text-sm text-red-600">
                                    Error loading Teams, please refresh the page
                                </span>
                            ))
                            .with(
                                { isSuccess: true, data: P.select() },
                                (data) => (
                                    <SimpleSelect
                                        formObj={formObj}
                                        name="team"
                                        id="team"
                                        options={[
                                            ...data.map((team) => ({
                                                label: team.title ?? team.name,
                                                value: team.name,
                                                id: team.id,
                                                visibility:
                                                    team.visibility ?? 'public',
                                            })),
                                        ]}
                                        placeholder="Select a Team"
                                    />
                                )
                            )
                            .otherwise(() => (
                                <span className="flex items-center text-sm text-red-600">
                                    Error loading parents, please refresh the
                                    page
                                </span>
                            ))}
                        <ErrorDisplay name="team" errors={errors} />
                    </InputGroup>
                    <InputGroup label="Project">
                        <Input
                            {...register('project')}
                            placeholder="ex. Climate Initiative"
                            type="text"
                        />
                    </InputGroup>
                    <InputGroup label="Dataset Type">
                        <SimpleSelect
                            id="dataset_type_info"
                            formObj={formObj}
                            name="dataset_type_info"
                            placeholder="Select dataset type"
                            options={datasetTypeInfoOptions}
                        />
                    </InputGroup>
                    <InputGroup label="Dataset Format">
                        <SimpleSelect
                            id="dataset_format_info"
                            formObj={formObj}
                            name="dataset_format_info"
                            placeholder="Select dataset format"
                            options={datasetFormatInfoOptions}
                        />
                    </InputGroup>
                    <InputGroup label="Applications">
                        {match(possibleApplications)
                            .with({ isLoading: true }, () => (
                                <span className="flex items-center text-sm gap-x-2">
                                    <Spinner />{' '}
                                    <span className="mt-1">
                                        Loading Applications...
                                    </span>
                                </span>
                            ))
                            .with({ isError: true }, () => (
                                <span className="flex items-center text-sm text-red-600">
                                    Error loading Applications, please refresh
                                    the page
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
                                        title="Applications"
                                        tooltip="Remove Application"
                                        aria-label="Remove Application"
                                    />
                                )
                            )
                            .otherwise(() => (
                                <span className="flex items-center text-sm text-red-600">
                                    Error loading Applications, please refresh
                                    the page
                                </span>
                            ))}
                    </InputGroup>
                    <InputGroup label="Topics">
                        {match(topicHierarchy)
                            .with({ isLoading: true }, () => (
                                <span className="flex items-center text-sm gap-x-2">
                                    <Spinner />{' '}
                                    <span className="mt-1">
                                        Loading Topics...
                                    </span>
                                </span>
                            ))
                            .with({ isError: true }, () => (
                                <span className="flex items-center text-sm text-red-600">
                                    Error loading Topics, please refresh the
                                    page
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
                                    Error loading Topics, please refresh the
                                    page
                                </span>
                            ))}
                    </InputGroup>
                    <InputGroup
                        label="Technical Notes"
                        required={
                            watch('visibility_type')?.value
                                ? watch('visibility_type').value === 'public'
                                : false
                        }
                    >
                        <Input
                            {...register('technical_notes')}
                            placeholder="https://source/to/original/data"
                            type="text"
                        />
                        <ErrorDisplay name="technical_notes" errors={errors} />
                    </InputGroup>
                </div>
                <div className="flex flex-col justify-start gap-y-4">
                    <InputGroup label="Keywords">
                        {match(possibleTags)
                            .with({ isLoading: true }, () => (
                                <span className="flex items-center text-sm gap-x-2">
                                    <Spinner />{' '}
                                    <span className="mt-1">
                                        Loading tags...
                                    </span>
                                </span>
                            ))
                            .with({ isError: true }, () => (
                                <span className="flex items-center text-sm text-red-600">
                                    Error loading tags, please refresh the page
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
                                        tooltip="Remove tag"
                                        aria-label="Remove tag"
                                        allowsCreationOfItems
                                    />
                                )
                            )
                            .otherwise(() => (
                                <span className="flex items-center text-sm text-red-600">
                                    Error loading parents, please refresh the
                                    page
                                </span>
                            ))}
                    </InputGroup>
                    <InputGroup label="Temporal Coverage">
                        <div className="flex flex-col items-center justify-between gap-5 lg:flex-row xxl:w-[28rem]">
                            <Input
                                {...register('temporal_coverage_start', {
                                    setValueAs: (v) =>
                                        v === '' ? undefined : Number(v),
                                })}
                                placeholder="Start year"
                                type="number"
                            />
                            <span className="hidden xxl:block">to</span>
                            <Input
                                {...register('temporal_coverage_end', {
                                    setValueAs: (v) =>
                                        v === '' ? undefined : Number(v),
                                })}
                                placeholder="End year"
                                type="number"
                            />
                        </div>
                        <ErrorDisplay
                            name="temporal_coverage_start"
                            errors={errors}
                        />
                        <ErrorDisplay
                            name="temporal_coverage_end"
                            errors={errors}
                        />
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
                    <InputGroup label="Update Frequency">
                        <SimpleSelect
                            formObj={formObj}
                            name="update_frequency"
                            id="update_frequency"
                            placeholder="Select update frequency"
                            options={updateFrequencyOptions}
                        />
                        <ErrorDisplay name="update_frequency" errors={errors} />
                    </InputGroup>
                    <InputGroup label="Citation" className="items-start">
                        <TextArea
                            aria-label="Citation"
                            placeholder=""
                            type="text"
                            {...register('citation')}
                            className="h-44"
                            icon={
                                <DefaultTooltip content="Provide a proper citation for this Dataset (e.g., author(s), year, title).">
                                    <InformationCircleIcon className="mb-auto mt-2 h-5 w-5 text-gray-300" />
                                </DefaultTooltip>
                            }
                        />
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
                                    Private Datasets are only visible to Team
                                    members.
                                </li>
                                <li>
                                    Internal Use Datasets are visible to any
                                    Data Explorer user with a login.
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
                    <InputGroup
                        label="License"
                        info={
                            <span>
                                License definitions and additional information
                                can be found at{' '}
                                <a
                                    href="http://opendefinition.org"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    opendefinition.org
                                </a>
                                . The data license you select also applies to
                                the contents of any Data Files that you add to
                                this Dataset.
                            </span>
                        }
                    >
                        {match(possibleLicenses)
                            .with({ isLoading: true }, () => (
                                <span className="flex items-center text-sm gap-x-2">
                                    <Spinner />{' '}
                                    <span className="mt-1">
                                        Loading licenses...
                                    </span>
                                </span>
                            ))
                            .with({ isError: true }, () => (
                                <span className="flex items-center text-sm text-red-600">
                                    Error loading licenses, please refresh the
                                    page
                                </span>
                            ))
                            .with(
                                { isSuccess: true, data: P.select() },
                                (data) => (
                                    <SimpleSelect
                                        name="license_id"
                                        id="license"
                                        formObj={formObj}
                                        options={data.map((license) => ({
                                            label: license.title,
                                            value: license.id,
                                        }))}
                                        placeholder="Select a license"
                                    />
                                )
                            )
                            .otherwise(() => (
                                <span className="flex items-center text-sm text-red-600">
                                    Error loading licenses, please refresh the
                                    page
                                </span>
                            ))}
                        <ErrorDisplay name="license" errors={errors} />
                    </InputGroup>

                    <div
                        className={classNames(
                            'items-end flex-col justify-end space-y-5',
                            watch('visibility_type') &&
                                watch('visibility_type')?.value === 'public'
                                ? 'flex'
                                : 'hidden'
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
                                    <DefaultTooltip content="Checking this box will send a feature request to an administrator. The Dataset will appear under ‘Dataset Highlights’ (on the homepage) only upon approval.">
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
