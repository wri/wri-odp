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

export default function SourceForm({ onNext }: { onNext: () => void }) {
    const formObj = useFormContext<LayerFormType>()
    const [columnsFetchEnabled, setColumnsFetchEnabled] = useState(false)
    const {
        register,
        watch,
        handleSubmit,
        control,
        formState: { errors },
    } = formObj
    const onSubmit = () => {
        console.log('Submitting')
        onNext()
    }
    const { append } = useFieldArray({
        control,
        name: 'interactionConfig.output',
    })
    const columns = useColumns(
        watch('source.provider.type.value'),
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
                <div className="mt-10 grid gap-x-6 gap-y-4 max-h-[375px] overflow-auto">
                    <InputGroup
                        label="Layer Type"
                        className="sm:grid-cols-1 gap-x-2"
                        labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                    >
                        <SimpleSelect
                            id="layer_type"
                            formObj={formObj}
                            maxWidth=""
                            name="type"
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
                            name="source.provider.type"
                            placeholder="Select a provider"
                            options={providerOptions}
                        />
                    </InputGroup>
                    {watch('type')?.value === 'raster' &&
                        watch('source.provider.type')?.value === 'wms' && (
                            <InputGroup
                                label="Tiles of your data"
                                className="sm:grid-cols-1 gap-x-2"
                                labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                            >
                                <Input
                                    {...register('source.tiles')}
                                    type="text"
                                />
                                <ErrorDisplay errors={errors} name="tiles" />
                            </InputGroup>
                        )}
                    {watch('source.provider.type')?.value === 'gee' && (
                        <InputGroup
                            label="Layer ID"
                            className="sm:grid-cols-1 gap-x-2"
                            labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                        >
                            <Input {...register('id')} type="text" />
                            <ErrorDisplay errors={errors} name="id" />
                        </InputGroup>
                    )}
                    {watch('source.provider.type')?.value === 'carto' && (
                        <>
                            <InputGroup
                                label="Account"
                                className="sm:grid-cols-1 gap-x-2"
                                labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                            >
                                <Input
                                    {...register('source.provider.account')}
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
                                        'source.provider.layers.0.options.sql'
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
                                    <DefaultTooltip content="Try to fetch columns">
                                        <Button
                                            onClick={() => columns.refetch()}
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
                            {...register('source.minzoom', {
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
                            {...register('source.maxzoom', {
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
                </div>
                <Button
                    form="layerForm"
                    type="submit"
                    className="mt-4 ml-auto w-fit"
                >
                    {formObj.watch('source.provider.type').value === 'carto'
                        ? 'Next: Render'
                        : 'Next: Legend'}
                </Button>
            </form>
        </>
    )
}
