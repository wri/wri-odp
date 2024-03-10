import { useFieldArray, useForm, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button, LoaderButton } from '@/components/_shared/Button'
import {
    ArrowPathIcon,
    ExclamationCircleIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/outline'
import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup'
import { Input } from '@/components/_shared/SimpleInput'
import { DefaultTooltip } from '@/components/_shared/Tooltip'
import SimpleSelect from '@/components/_shared/SimpleSelect'
import { layerTypeOptions, providerOptions } from '../../../../formOptions'
import { TextArea } from '@/components/_shared/SimpleTextArea'
import { LayerFormType } from '../layer.schema'
import { useState } from 'react'
import { useColumns } from '../useColumns'
import classNames from '@/utils/classnames'
import { ChooseTemplates } from './ChooseTemplates'
import { ScrollArea } from '@/components/_shared/ScrollArea'
import { LocationForm } from '../../../../metadata/LocationForm'
import { DatafileLocation } from '../../../Location'

export default function SourceForm({
    onNext,
    convertToRaw,
    formObj: _formObj,
    index: _index
}: {
    onNext: () => void
    convertToRaw: () => void
    formObj: any,
    index: number
}) {
    const formObj = useFormContext<LayerFormType>()
    const [columnsFetchEnabled, setColumnsFetchEnabled] = useState(false)
    const [templateModalOpen, setTemplateModalOpen] = useState(false)
    const {
        register,
        watch,
        handleSubmit,
        control,
        formState: { errors },
    } = formObj
    const onSubmit = () => {
        onNext()
    }
    const { append } = useFieldArray({
        control,
        name: 'interactionConfig.output',
    })
    const columns = useColumns(
        watch('layerConfig.source.provider.type.value'),
        watch('connectorUrl') as string,
        columnsFetchEnabled,
        (data) => {
            if (data && watch('interactionConfig.output').length === 0) {
                data.forEach((col) => {
                    append({
                        column: col,
                        format: '',
                        prefix: '',
                        property: col,
                        suffix: '',
                        enabled: false,
                        type: 'string',
                    })
                })
            }
        }
    )

    return (
        <>
            <form
                id="layerForm"
                className="flex flex-col px-4 min-h-[416px] justify-between"
                onSubmit={handleSubmit(onSubmit)}
            >
                <ChooseTemplates
                    open={templateModalOpen}
                    setOpen={() => setTemplateModalOpen(!open)}
                />
                <div className="mt-10 flex gap-x-2 w-full justify-end">
                    <DefaultTooltip content="This will convert this guided form to a raw JSON object that can be edited directly, this is useful for advanced users that want to use features that are not yet supported by the guided form">
                        <Button onClick={() => convertToRaw()} type="button">
                            Convert to raw object
                        </Button>
                    </DefaultTooltip>
                    <Button
                        onClick={() => setTemplateModalOpen(true)}
                        type="button"
                    >
                        Use Template
                    </Button>
                </div>
                <ScrollArea className="h-[375px]">
                    <div className="grid gap-x-6 gap-y-4">
                        <InputGroup
                            label="Name of Layer"
                            className="sm:grid-cols-1 gap-x-2"
                            labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                        >
                            <Input {...register('name')} type="text" />
                        </InputGroup>
                        <InputGroup
                            label="Slug of layer"
                            className="sm:grid-cols-1 gap-x-2"
                            labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                        >
                            <Input {...register('slug')} type="text" />
                        </InputGroup>
                        <InputGroup
                            label="Description of Layer"
                            className="sm:grid-cols-1 gap-x-2"
                            labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                        >
                            <Input {...register('description')} type="text" />
                        </InputGroup>
                        <div className="relative flex justify-start">
                            <div className="flex h-6 items-center">
                                <input
                                    id="featured_dataset"
                                    aria-describedby="comments-description"
                                    {...register(`default`)}
                                    type="checkbox"
                                    className="h-5 w-5 rounded border-gray-300 text-blue-800 shadow focus:ring-blue-800"
                                />
                            </div>
                            <div className="ml-3 text-sm leading-6">
                                <label className="flex items-center gap-x-2 font-acumin text-lg font-light text-zinc-800">
                                    Default Layer
                                </label>
                            </div>
                        </div>
                        <InputGroup
                            label="Layer Type"
                            className="sm:grid-cols-1 gap-x-2"
                            labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                        >
                            <SimpleSelect
                                id="layer_type"
                                formObj={formObj}
                                maxWidth=""
                                name="layerConfig.type"
                                placeholder="Select layer type"
                                options={layerTypeOptions}
                            />
                        </InputGroup>
                        <InputGroup
                            label="Provider"
                            className="sm:grid-cols-1 gap-x-2"
                            labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                        >
                            <SimpleSelect
                                maxWidth=""
                                id="provider"
                                formObj={formObj}
                                name="layerConfig.source.provider.type"
                                placeholder="Select a provider"
                                options={providerOptions}
                            />
                        </InputGroup>
                        {watch('layerConfig.type')?.value === 'raster' &&
                            watch('layerConfig.source.provider.type')?.value ===
                                'wms' && (
                                <InputGroup
                                    label="Tiles of your data"
                                    className="sm:grid-cols-1 gap-x-2"
                                    labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                >
                                    <Input
                                        {...register(
                                            'layerConfig.source.tiles'
                                        )}
                                        type="text"
                                    />
                                    <ErrorDisplay
                                        errors={errors}
                                        name="tiles"
                                    />
                                </InputGroup>
                            )}
                        {watch('layerConfig.source.provider.type')?.value ===
                            'gee' && (
                            <InputGroup
                                label="Layer ID"
                                className="sm:grid-cols-1 gap-x-2"
                                labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                            >
                                <Input {...register('id')} type="text" />
                                <ErrorDisplay errors={errors} name="id" />
                            </InputGroup>
                        )}
                        {watch('layerConfig.source.provider.type')?.value ===
                            'carto' && (
                            <>
                                <InputGroup
                                    label="Account"
                                    className="sm:grid-cols-1 gap-x-2"
                                    labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                >
                                    <Input
                                        {...register(
                                            'layerConfig.source.provider.account'
                                        )}
                                        type="text"
                                        defaultValue="wri-rw"
                                    />
                                    {/* TODO Parse SQL and show errors*/}
                                    <ErrorDisplay
                                        errors={errors}
                                        name="provider.account"
                                    />
                                </InputGroup>
                                <InputGroup
                                    label="SQL Query"
                                    className="sm:grid-cols-1 gap-x-2"
                                    labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                >
                                    <TextArea
                                        {...register(
                                            'layerConfig.source.provider.layers.0.options.sql'
                                        )}
                                        type="text"
                                        defaultValue=""
                                    />
                                    {/* TODO Parse SQL and show errors*/}
                                    <ErrorDisplay
                                        errors={errors}
                                        name="provider.options.sql"
                                    />
                                </InputGroup>
                                <InputGroup
                                    label="Columns URL"
                                    className="sm:grid-cols-1 gap-x-2"
                                    labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                >
                                    <div className="flex gap-x-2 items-center">
                                        <Input
                                            {...register('connectorUrl')}
                                            type="text"
                                            defaultValue="https://wri-rw.carto.com:443/api/v2/sql?q="
                                            icon={
                                                <DefaultTooltip content="URL to get fetch columns from, this allows the form to autofill the interaction and some of the render sections with predefined values from the SQL Table">
                                                    <InformationCircleIcon className="z-10 h-4 w-4 text-gray-300" />
                                                </DefaultTooltip>
                                            }
                                        />
                                        <DefaultTooltip content="Try to fetch columns (this will clear the interaction config)">
                                            <Button
                                                onClick={() => {
                                                    formObj.setValue(
                                                        'interactionConfig.output',
                                                        []
                                                    )
                                                    columns.refetch()
                                                }}
                                                className="px-2"
                                                type="button"
                                            >
                                                <ArrowPathIcon
                                                    className={classNames(
                                                        'h-4 w-4 text-white',
                                                        columns.isLoading
                                                            ? 'animate-spin'
                                                            : ''
                                                    )}
                                                />
                                            </Button>
                                        </DefaultTooltip>
                                    </div>
                                </InputGroup>
                            </>
                        )}
                        <InputGroup
                            label="Min Zoom"
                            className="sm:grid-cols-1 gap-x-2"
                            labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                        >
                            <Input
                                {...register('layerConfig.source.minzoom', {
                                    setValueAs: (v) =>
                                        v === '' ? undefined : parseInt(v),
                                })}
                                icon={
                                    <DefaultTooltip content="Min zoom in which content will appera">
                                        <InformationCircleIcon className="z-10 h-4 w-4 text-gray-300" />
                                    </DefaultTooltip>
                                }
                                type="text"
                            />
                            <ErrorDisplay errors={errors} name="zoom" />
                        </InputGroup>
                        <InputGroup
                            label="Max Zoom"
                            className="sm:grid-cols-1 gap-x-2"
                            labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                        >
                            <Input
                                {...register('layerConfig.source.maxzoom', {
                                    setValueAs: (v) =>
                                        v === '' ? undefined : parseInt(v),
                                })}
                                icon={
                                    <DefaultTooltip content="Max zoom in which content will appera">
                                        <InformationCircleIcon className="z-10 h-4 w-4 text-gray-300" />
                                    </DefaultTooltip>
                                }
                                type="text"
                            />
                            <ErrorDisplay errors={errors} name="zoom" />
                        </InputGroup>

                        <div>
                            <h2 className="text-lg flex items-center gap-x-2">
                                Location Coverage
                                <DefaultTooltip content="This field defines whether a data file will show up on the results or not when doing a search by location">
                                    <InformationCircleIcon
                                        className="h-5 w-5 text-neutral-500"
                                        aria-hidden="true"
                                    />
                                </DefaultTooltip>
                            </h2>
                        </div>
                        <DatafileLocation formObj={_formObj} index={_index} />
                    </div>
                </ScrollArea>
                <Button
                    form="layerForm"
                    type="submit"
                    className="mt-4 ml-auto w-fit"
                >
                    {formObj.watch('layerConfig.source.provider.type').value ===
                    'carto'
                        ? 'Next: Render'
                        : 'Next: Legend'}
                </Button>
            </form>
        </>
    )
}
