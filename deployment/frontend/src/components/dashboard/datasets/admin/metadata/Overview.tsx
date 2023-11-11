import {
    ArrowsPointingInIcon,
    ExclamationCircleIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/outline'
import { Input } from '@/components/_shared/SimpleInput'
import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup'
import { Disclosure } from '@headlessui/react'
import SimpleSelect from '@/components/_shared/SimpleSelect'
import TagsSelect from '../TagsSelect'
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

export function OverviewForm({
    formObj,
}: {
    formObj: UseFormReturn<DatasetFormType>
}) {
    const {
        register,
        setValue,
        watch,
        formState: { errors },
    } = formObj

    const possibleOwners = api.teams.getAllTeams.useQuery()
    const possibleTags = api.tags.getAllTags.useQuery()
    const topicHierarchy = api.topics.getTopicsHierarchy.useQuery()

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
                            {...register('source')}
                            placeholder="ex. https://source/to/original/data"
                            type="text"
                            icon={
                                <DefaultTooltip content="Placeholder">
                                    <InformationCircleIcon className="z-10 h-4 w-4 text-gray-300" />
                                </DefaultTooltip>
                            }
                        />
                        <ErrorDisplay name="source" errors={errors} />
                    </InputGroup>
                    <InputGroup label="Language">
                        <SimpleSelect
                            formObj={formObj}
                            name="language"
                            placeholder="Language"
                            initialValue={watch('language') ?? null}
                            options={[
                                { value: 'eng', label: 'English' },
                                { value: 'fr', label: 'French' },
                                { value: 'pt', label: 'Portuguese' },
                            ]}
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
                                        initialValue={watch('team') ?? null}
                                        options={data.map((team) => ({
                                            label: team.title ?? team.name,
                                            value: team.name,
                                        }))}
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
                        <ErrorDisplay name="parent" errors={errors} />
                    </InputGroup>
                    <InputGroup label="Projects">
                        <Input
                            {...register('projects')}
                            placeholder="ex. Ecosystem Service Mapping"
                            type="text"
                        />
                    </InputGroup>
                    <InputGroup label="Application">
                        <Input
                            {...register('applications')}
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
                                        topicHierarchy={data}
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
                    <InputGroup label="Technical Notes" required>
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
                                    <TagsSelect formObj={formObj} tags={data} />
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
                                {...register('temporalCoverageStart', {
                                    valueAsNumber: true,
                                })}
                                placeholder="Start year"
                                type="number"
                            />
                            <span className="hidden xxl:block">to</span>
                            <Input
                                {...register('temporalCoverageEnd', {
                                    valueAsNumber: true,
                                })}
                                placeholder="End year"
                                type="number"
                            />
                        </div>
                        <ErrorDisplay
                            name="temporalCoverageStart"
                            errors={errors}
                        />
                        <ErrorDisplay
                            name="temporalCoverageEnd"
                            errors={errors}
                        />
                    </InputGroup>
                    <InputGroup label="Update Frequency">
                        <SimpleSelect
                            formObj={formObj}
                            name="update_frequency"
                            placeholder="Select update frequency"
                            options={[
                                {
                                    value: 'biannually',
                                    label: 'Biannually',
                                },
                                {
                                    value: 'quarterly',
                                    label: 'Quarterly',
                                },
                                {
                                    value: 'daily',
                                    label: 'Daily',
                                },
                                {
                                    value: 'hourly',
                                    label: 'Hourly',
                                },
                                {
                                    value: 'as_need',
                                    label: 'As needed',
                                },
                                {
                                    value: 'monthly',
                                    label: 'Monthly',
                                },
                                { value: 'weekly', label: 'Weekly' },
                                { value: 'annually', label: 'Annually' },
                            ]}
                        />
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
                    <InputGroup label="Visbility" required>
                        <SimpleSelect
                            placeholder="Select visiblity"
                            name="visibility_type"
                            formObj={formObj}
                            options={[
                                { value: 'public', label: 'Public' },
                                { value: 'draft', label: 'Draft' },
                                {
                                    value: 'private',
                                    label: 'Private',
                                },
                            ]}
                        />
                    </InputGroup>
                    <InputGroup label="License">
                        <SimpleSelect
                            placeholder="Select license"
                            name="license"
                            formObj={formObj}
                            options={[
                                {
                                    value: 'creative_commons',
                                    label: 'Creative Commons',
                                },
                                { value: 'gnu', label: 'GNU' },
                                { value: 'openbsd', label: 'OpenBSD' },
                            ]}
                        />
                    </InputGroup>
                    <div className="flex items-end flex-col justify-end space-y-5">
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
                                    Featured dataset
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
                                clearImage={() => setValue('featuredImage', '')}
                                defaultImage={watch('signedUrl') ?? null}
                                onPresignedUrlSuccess={(url: string) => {
                                    setValue('signedUrl', url)
                                }}
                                onUploadSuccess={(response: UploadResult) => {
                                    const url =
                                        response.successful[0]?.name ?? null
                                    setValue('featuredImage', url)
                                }}
                            />
                        </div>
                    </div>
                </div>
            </Disclosure.Panel>
        </MetadataAccordion>
    )
}
