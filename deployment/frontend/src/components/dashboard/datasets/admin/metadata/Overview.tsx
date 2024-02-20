import {
    ArrowsPointingInIcon,
    ExclamationCircleIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/outline'
import { Input } from '@/components/_shared/SimpleInput'
import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup'
import { Disclosure } from '@headlessui/react'
import SimpleSelect from '@/components/_shared/SimpleSelect'
import { TopicsSelect } from '../TopicsSelect'
import { MetadataAccordion } from './MetadataAccordion'
import { TextArea } from '@/components/_shared/SimpleTextArea'
import { UseFormReturn, useForm } from 'react-hook-form'
import { DatasetFormType } from '@/schema/dataset.schema'
import { ImageUploader } from '@/components/dashboard/_shared/ImageUploader'
import { UploadResult } from '@uppy/core'
import { DefaultTooltip } from '@/components/_shared/Tooltip'
import { api } from '@/utils/api'
import { P, match } from 'ts-pattern'
import Spinner from '@/components/_shared/Spinner'
import classNames from '@/utils/classnames'
import { env } from '@/env.mjs'
import MulText from '../MulText'
import {
    languageOptions,
    updateFrequencyOptions,
    visibilityOptions,
} from '../formOptions'

export function OverviewForm({
    formObj,
    editing = false,
}: {
    formObj: UseFormReturn<DatasetFormType>
    editing?: boolean
}) {
    const {
        register,
        setValue,
        watch,
        formState: { errors, defaultValues },
    } = formObj

    const possibleOwners = api.teams.getAllTeams.useQuery()
    const possibleTags = api.tags.getAllTags.useQuery()
    const topicHierarchy = api.topics.getTopicsHierarchy.useQuery()
    const possibleLicenses = api.dataset.getLicenses.useQuery()

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
                            placeholder="My dataset"
                            type="text"
                        />
                        <ErrorDisplay name="title" errors={errors} />
                    </InputGroup>
                    <InputGroup label="Url" required>
                        <Input
                            {...register('name')}
                            disabled={editing}
                            placeholder="name-of-dataset"
                            type="text"
                            className="pl-[5.2rem] sm:pl-[5rem] md:pl-[4.9rem] lg:pl-[4.8rem]"
                        >
                            <span className="absolute inset-y-0 left-5 flex items-center pr-3 sm:text-sm sm:leading-6">
                                /dataset/
                            </span>
                        </Input>
                        <ErrorDisplay name="name" errors={errors} />
                    </InputGroup>
                    <InputGroup label="Source">
                        <Input
                            {...register('url')}
                            placeholder="ex. https://source/to/original/data"
                            type="text"
                            icon={
                                <DefaultTooltip content="Placeholder">
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
                    <InputGroup label="Team">
                        {match(possibleOwners)
                            .with({ isLoading: true }, () => (
                                <span className="flex items-center text-sm gap-x-2">
                                    <Spinner />{' '}
                                    <span className="mt-1">
                                        Loading teams...
                                    </span>
                                </span>
                            ))
                            .with({ isError: true }, () => (
                                <span className="flex items-center text-sm text-red-600">
                                    Error loading teams, please refresh the page
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
                                            {
                                                label: 'No team',
                                                value: '',
                                                id: '',
                                            },
                                            ...data.map((team) => ({
                                                label: team.title ?? team.name,
                                                value: team.name,
                                                id: team.id,
                                            })),
                                        ]}
                                        placeholder="Select a team"
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
                    <InputGroup label="Application">
                        <Input
                            {...register('application')}
                            placeholder="ex. Global Forest Watch"
                            type="text"
                        />
                    </InputGroup>
                    <InputGroup label="Topics">
                        {match(topicHierarchy)
                            .with({ isLoading: true }, () => (
                                <span className="flex items-center text-sm gap-x-2">
                                    <Spinner />{' '}
                                    <span className="mt-1">
                                        Loading topics...
                                    </span>
                                </span>
                            ))
                            .with({ isError: true }, () => (
                                <span className="flex items-center text-sm text-red-600">
                                    Error loading topics, please refresh the
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
                                    Error loading topics, please refresh the
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
                    <InputGroup label="Tags">
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
                                        title="Tags"
                                        tooltip="Remove tag"
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
                                    valueAsNumber: true,
                                })}
                                placeholder="Start year"
                                type="number"
                            />
                            <span className="hidden xxl:block">to</span>
                            <Input
                                {...register('temporal_coverage_end', {
                                    valueAsNumber: true,
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
                                This dataset was developed by WRI
                                <DefaultTooltip content="This flags this dataset as having been produced and curated by WRI">
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
                            placeholder=""
                            type="text"
                            {...register('citation')}
                            className="h-44"
                            icon={
                                <DefaultTooltip content="Placeholder">
                                    <InformationCircleIcon className="mb-auto mt-2 h-5 w-5 text-gray-300" />
                                </DefaultTooltip>
                            }
                        />
                    </InputGroup>
                    <InputGroup label="Visibility" required>
                        <SimpleSelect
                            placeholder="Select visiblity"
                            name="visibility_type"
                            id="visibility_type"
                            formObj={formObj}
                            options={visibilityOptions}
                        />
                    </InputGroup>
                    <InputGroup label="License">
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
                            watch('visibility_type') && watch('visibility_type')?.value === 'public' ? 'flex' : 'hidden'
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
                                    Request administrator feature this dataset
                                    <DefaultTooltip content="Setting this to true will show the dataset in the feature list both on the homepage and in the search page">
                                        <InformationCircleIcon className="mb-auto mt-0.5 h-5 w-5 text-zinc-800" />
                                    </DefaultTooltip>
                                </label>
                            </div>
                        </div>
                        <div
                            className={classNames(
                                'max-w-[16rem] w-full',
                                watch('featured_dataset') ? 'block' : 'hidden'
                            )}
                        >
                            <ImageUploader
                                clearImage={() => {
                                    setValue('featured_image', '')
                                    setValue('signedUrl', undefined)
                                }}
                                defaultImage={
                                    watch('signedUrl') ??
                                    watch('featured_image') ??
                                    null
                                }
                                onPresignedUrlSuccess={(url: string) => {
                                    setValue('signedUrl', url)
                                }}
                                onUploadSuccess={(response: UploadResult) => {
                                    const url =
                                        response.successful[0]?.uploadURL ??
                                        null
                                    const name = url ? url.split('/').pop() : ''
                                    setValue('featured_image', name)
                                }}
                            />
                            <ErrorDisplay
                                name="featured_image"
                                errors={errors}
                            />
                        </div>
                    </div>
                </div>
            </Disclosure.Panel>
        </MetadataAccordion>
    )
}
