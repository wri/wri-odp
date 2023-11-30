import { useForm, useFormContext } from 'react-hook-form'
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

export default function SourceForm({ onNext }: { onNext: () => void }) {
    const formObj = useFormContext<LayerFormType>()
    const {
        register,
        watch,
        handleSubmit,
        formState: { errors },
    } = formObj
    const onSubmit = () => {
        console.log('Submitting')
        onNext()
    }
    console.log('Errors', errors)
    console.log('Form Obj', watch())

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
                            name="type"
                            placeholder="Select layer type"
                            options={layerTypeOptions}
                        />
                    </InputGroup>
                    <InputGroup label="Provider">
                        <SimpleSelect
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
                    <InputGroup label="Layer ID on the Resource Watch API">
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
                    <InputGroup label="Min Zoom">
                        <Input
                            {...register('source.minzoom', {
                                valueAsNumber: true,
                            })}
                            defaultValue={1}
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
                                valueAsNumber: true,
                            })}
                            defaultValue={20}
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
