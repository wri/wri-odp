import { useFieldArray, useForm, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/_shared/Button'
import {
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

export default function SourceForm({ onNext }: { onNext: () => void }) {
    const formObj = useFormContext<LayerFormType>()
    const [sqlFilled, setSqlFilled] = useState(false)
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
        !!watch('connectorUrl') && sqlFilled,
        (data) => {
            if (data && watch('interactionConfig.output').length === 0) {
                data.forEach((col) => {
                    append({
                        column: col,
                        format: '',
                        prefix: '',
                        property: '',
                        suffix: '',
                        type: '',
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
                    <InputGroup label="Layer Type">
                        <SimpleSelect
                            id="layer_type"
                            formObj={formObj}
                            maxWidth=""
                            name="type"
                            placeholder="Select layer type"
                            options={layerTypeOptions}
                        />
                    </InputGroup>
                    <InputGroup label="Provider">
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
                            <InputGroup label="Tiles of your data">
                                <Input
                                    {...register('source.tiles')}
                                    type="text"
                                />
                                <ErrorDisplay errors={errors} name="tiles" />
                            </InputGroup>
                        )}
                    <InputGroup label="Layer ID">
                        <Input {...register('id')} type="text" />
                        <ErrorDisplay errors={errors} name="id" />
                    </InputGroup>
                    {watch('source.provider.type')?.value === 'carto' && (
                        <>
                            <InputGroup label="Account">
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
                            <InputGroup label="SQL Query">
                                <TextArea
                                    {...register(
                                        'source.provider.layers.0.options.sql'
                                    )}
                                    onBlur={() => setSqlFilled(true)}
                                    type="text"
                                    defaultValue=""
                                />
                                {/* TODO Parse SQL and show errors*/}
                                <ErrorDisplay
                                    errors={errors}
                                    name="provider.options.sql"
                                />
                            </InputGroup>
                        </>
                    )}
                    <InputGroup label="Connector URL">
                        <Input
                            {...register('connectorUrl')}
                            type="text"
                            defaultValue="https://wri-rw.carto.com:443/api/v2/sql?q="
                        />
                    </InputGroup>
                    <InputGroup label="Min Zoom">
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
                    <InputGroup label="Max Zoom">
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
                    Next: Legend
                </Button>
            </form>
        </>
    )
}
