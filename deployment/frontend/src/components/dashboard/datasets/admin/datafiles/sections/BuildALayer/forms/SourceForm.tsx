import { useForm } from 'react-hook-form'
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

const sourceSchema = z
    .object({
        type: z.object({
            value: z.enum(['raster', 'vector']),
            label: z.string(),
        }),
        provider: z.object({
            type: z.object({
                value: z.enum(['gee', 'cartodb']),
                label: z.string(),
            }),
            account: z.string().optional().nullable(),
            options: z.object({
                sql: z.string().optional().nullable(),
            }),
        }),
        minzoom: z.number().min(0).max(22).default(0),
        maxzoom: z.number().min(0).max(22).default(22),
        tiles: z.string().url().optional().nullable(),
    })
    //Make sure that maxZoom is always bigger than minZoom
    .refine((obj) => obj.maxzoom >= obj.minzoom, {
        path: ['zoom'],
        message: 'maxZoom must be bigger than minZoom',
    })
    .refine(
        (obj) =>
            obj.type.value === 'raster' && obj.tiles && obj.tiles.length > 0,
        {
            path: ['tiles'],
            message: 'Tiles are required for raster layers',
        }
    )
    .refine(
        (obj) =>
            obj.provider.type.value === 'cartodb' &&
            obj.provider.account &&
            obj.provider.account.length > 0,
        {
            path: ['provider.account'],
            message:
                'Informing an account is required when the provider is setup as cartodb',
        }
    )

export type SourceFormType = z.infer<typeof sourceSchema>

export default function SourceForm({
    onNext,
    defaultValues,
}: {
    onNext: (data: SourceFormType) => void
    defaultValues: SourceFormType | null
}) {
    const formObj = useForm<SourceFormType & { zoom?: string }>({
        defaultValues: defaultValues || undefined,
        resolver: zodResolver(sourceSchema),
    })
    const {
        register,
        watch,
        handleSubmit,
        formState: { errors },
    } = formObj
    const onSubmit = (data: SourceFormType) => onNext(data)

    return (
        <>
            <form
                id="layerForm"
                className="flex flex-col px-4 min-h-[416px] justify-between"
                onSubmit={handleSubmit(onSubmit)}
            >
                <div className="mt-10 grid gap-x-6 gap-y-4">
                    <InputGroup label="Layer Type">
                        <SimpleSelect
                            id="layer_type"
                            formObj={formObj}
                            name="type"
                            placeholder="Select layer type"
                            initialValue={watch('type') ?? null}
                            options={layerTypeOptions}
                        />
                    </InputGroup>
                    {watch('type')?.value === 'raster' && (
                        <InputGroup label="Tiles of your data">
                            <Input
                                {...register('tiles')}
                                type="text"
                                defaultValue="https://tiles.globalforestwatch.org/umd_tree_cover_loss/v1.10/tcd_30/{z}/{x}/{y}.png"
                            />
                            <ErrorDisplay errors={errors} name="tiles" />
                        </InputGroup>
                    )}
                    <InputGroup label="Provider">
                        <SimpleSelect
                            id="provider"
                            formObj={formObj}
                            name="provider.type"
                            placeholder="Select a provider"
                            initialValue={watch('provider.type') ?? null}
                            options={providerOptions}
                        />
                    </InputGroup>
                    {watch('provider.type')?.value === 'cartodb' && (
                        <InputGroup label="SQL Query">
                            <TextArea
                                {...register('provider.options.sql')}
                                type="text"
                                defaultValue=""
                            />
                            {/* TODO Parse SQL and show errors*/}
                            <ErrorDisplay
                                errors={errors}
                                name="provider.options.sql"
                            />
                        </InputGroup>
                    )}
                    <InputGroup label="Min Zoom">
                        <Input
                            {...register('minzoom', { valueAsNumber: true })}
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
                            {...register('maxzoom', { valueAsNumber: true })}
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
                    form="#layerForm"
                    type="button"
                    onClick={() => onNext(watch())}
                    className="mt-4 ml-auto w-fit"
                >
                    Next: Legend
                </Button>
            </form>
        </>
    )
}
