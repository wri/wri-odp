import { GlobeAmericasIcon } from '@heroicons/react/24/outline'
import { Input } from '@/components/_shared/SimpleInput'
import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup'
import { Disclosure, Transition } from '@headlessui/react'
import { MetadataAccordion } from './MetadataAccordion'
import { UseFormReturn } from 'react-hook-form'
import { DatasetFormType } from '@/schema/dataset.schema'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { DefaultTooltip } from '@/components/_shared/Tooltip'

export function RWDatasetForm({
    formObj,
    editing = false,
}: {
    formObj: UseFormReturn<DatasetFormType>
    editing?: boolean
}) {
    const {
        register,
        watch,
        formState: { errors, defaultValues },
    } = formObj
    const rwDatasetToggled = watch('rw_dataset')
    return (
        <MetadataAccordion
            defaultOpen
            label={
                <>
                    <GlobeAmericasIcon className="h-7 w-7" />
                    Dataset Layer Connection Information
                </>
            }
        >
            <Disclosure.Panel className="grid grid-cols-1 items-start gap-x-24 py-5 md:grid-cols-2">
                <p className="col-span-full">
                    Enter the connector information from where your dataset is
                    currently stored. If you’re unsure where to find this
                    information, please see the{' '}
                    <a
                        target="_blank"
                        className="text-blue-800 underline"
                        href="https://resource-watch.github.io/doc-api/reference.html#dataset"
                    >
                        {' '}
                        RW API Docs
                    </a>
                </p>
                <div className="relative flex justify-start pb-8">
                    <div className="flex h-6 items-center">
                        <input
                            id="rw_dataset"
                            aria-describedby="comments-description"
                            {...register('rw_dataset')}
                            type="checkbox"
                            className="h-5 w-5 rounded border-gray-300 text-blue-800 shadow focus:ring-blue-800"
                        />
                    </div>
                    <div className="ml-3 text-sm leading-6">
                        <label
                            htmlFor="rw_dataset"
                            className="flex items-center gap-x-2 font-acumin text-lg font-light text-zinc-800"
                        >
                            Visualize my data on a map
                            <DefaultTooltip content="Checking this box will create an equivalent dataset in the Resource Watch API, allowing you to display Mapbox Layers">
                                <InformationCircleIcon className="mb-auto mt-0.5 h-5 w-5 text-zinc-800" />
                            </DefaultTooltip>
                        </label>
                    </div>
                </div>
                <div className="flex justify-end">
                    <ErrorDisplay name="rw_dataset" errors={errors} />
                </div>
                <div className="flex flex-col justify-start gap-y-4">
                    <InputGroup label="Connector URL">
                        <Input
                            {...register('connectorUrl')}
                            placeholder="https://wri-01.carto.com/tables/wdpa_protected_areas/table"
                            type="text"
                            disabled={
                                !rwDatasetToggled ||
                                (editing &&
                                    !!defaultValues?.connectorUrl &&
                                    defaultValues?.connectorUrl !== '')
                            }
                            icon={
                                <DefaultTooltip
                                    content={
                                        <span>
                                            Go to the{' '}
                                            <a
                                                target="_blank"
                                                className="text-blue-800 underline"
                                                href="https://resource-watch.github.io/doc-api/reference.html#carto-datasets"
                                            >
                                                {' '}
                                                RW API Docs
                                            </a>{' '}
                                            for more information
                                        </span>
                                    }
                                >
                                    <InformationCircleIcon className="z-10 h-4 w-4 text-gray-300" />
                                </DefaultTooltip>
                            }
                        />
                        <ErrorDisplay name="connectorUrl" errors={errors} />
                    </InputGroup>
                    <InputGroup label="Connector Type">
                        <Input
                            {...register('connectorType')}
                            placeholder="rest"
                            type="text"
                            disabled={
                                !rwDatasetToggled ||
                                (editing &&
                                    !!defaultValues?.connectorType &&
                                    defaultValues?.connectorType !== '')
                            }
                            icon={
                                <DefaultTooltip
                                    content={
                                        <span>
                                            Go to the{' '}
                                            <a
                                                target="_blank"
                                                className="text-blue-800 underline"
                                                href="https://resource-watch.github.io/doc-api/reference.html#carto-datasets"
                                            >
                                                {' '}
                                                RW API Docs
                                            </a>{' '}
                                            for more information
                                        </span>
                                    }
                                >
                                    <InformationCircleIcon className="z-10 h-4 w-4 text-gray-300" />
                                </DefaultTooltip>
                            }
                        />
                        <ErrorDisplay name="connectorType" errors={errors} />
                    </InputGroup>
                </div>
                <div className="flex flex-col justify-start gap-y-4">
                    <InputGroup label="Provider">
                        <Input
                            {...register('provider')}
                            placeholder="cartodb"
                            disabled={
                                !rwDatasetToggled ||
                                (editing &&
                                    !!defaultValues?.provider &&
                                    defaultValues?.provider !== '')
                            }
                            icon={
                                <DefaultTooltip
                                    content={
                                        <span>
                                            Go to the{' '}
                                            <a
                                                target="_blank"
                                                className="text-blue-800 underline"
                                                href="https://resource-watch.github.io/doc-api/reference.html#carto-datasets"
                                            >
                                                {' '}
                                                RW API Docs
                                            </a>{' '}
                                            for more information
                                        </span>
                                    }
                                >
                                    <InformationCircleIcon className="z-10 h-4 w-4 text-gray-300" />
                                </DefaultTooltip>
                            }
                            type="text"
                        />
                        <ErrorDisplay name="provider" errors={errors} />
                    </InputGroup>
                    <InputGroup label="Table Name">
                        <Input
                            {...register('tableName')}
                            placeholder="users/resourcewatch_wri/dataset_name"
                            type="text"
                            disabled={
                                !rwDatasetToggled ||
                                (editing &&
                                    !!defaultValues?.tableName &&
                                    defaultValues?.tableName !== '')
                            }
                            icon={
                                <DefaultTooltip
                                    content={
                                        <span>
                                            Go to the{' '}
                                            <a
                                                target="_blank"
                                                className="text-blue-800 underline"
                                                href="https://resource-watch.github.io/doc-api/reference.html#google-earth-engine"
                                            >
                                                {' '}
                                                RW API Docs
                                            </a>{' '}
                                            for more information
                                        </span>
                                    }
                                >
                                    <InformationCircleIcon className="z-10 h-4 w-4 text-gray-300" />
                                </DefaultTooltip>
                            }
                        />
                        <ErrorDisplay name="tableName" errors={errors} />
                    </InputGroup>
                </div>
            </Disclosure.Panel>
        </MetadataAccordion>
    )
}
