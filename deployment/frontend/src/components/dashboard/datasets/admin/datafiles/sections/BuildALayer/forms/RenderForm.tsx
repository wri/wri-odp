import { Button } from '@/components/_shared/Button'
import { InputGroup } from '@/components/_shared/InputGroup'
import { Input } from '@/components/_shared/SimpleInput'
import SimpleSelect from '@/components/_shared/SimpleSelect'
import {
    ChevronDownIcon,
    ExclamationCircleIcon,
    PlusCircleIcon,
} from '@heroicons/react/24/outline'
import {
    FieldArrayWithId,
    UseFormReturn,
    useFieldArray,
    useForm,
} from 'react-hook-form'
import { match } from 'ts-pattern'
import { z } from 'zod'
import {
    filterOperationOptions,
    renderTypeOptions,
} from '../../../../formOptions'
import { Disclosure, Transition } from '@headlessui/react'

interface InteractionFormProps {
    onNext: () => void
    onPrev: () => void
}

const emptyStringToUndefined = z.literal('').transform(() => undefined)
const nanToUndefined = z.literal(NaN).transform(() => undefined)

const numericExpression = z.object({
    operation: z.literal('get'),
    column: z.string().optional().nullable(),
})
const filterExpression = z.object({
    operation: z
        .object({
            value: z.enum(['==', '<=', '>=']),
            label: z.string(),
        })
        .optional()
        .nullable(),
    column: z.string().optional().nullable(),
    value: z.string().optional().nullable(),
})
const rampObj = z.object({
    type: z.object({
        value: z.enum([
            'step',
            'interpolate',
            'interpolate-lab',
            'interpolate-hcl',
        ]),
        label: z.string(),
    }),
    interpolationType: z.object({
        value: z.enum(['linear', 'exponential', 'cubic-bezier']),
        label: z.string(),
    }),
    input: z.union([z.number(), numericExpression]),
})
const renderSchema = z.object({
    layers: z.array(
        z.object({
            type: z.object({
                value: z.enum(['circle', 'line', 'fill']),
                label: z.string(),
            }),
            'source-layer': z.string(),
            paint: z
                .object({
                    'fill-color': z
                        .union([z.string(), rampObj])
                        .optional()
                        .nullable()
                        .or(emptyStringToUndefined),
                    'fill-opacity': z
                        .number()
                        .optional()
                        .nullable()
                        .or(nanToUndefined),
                    'line-color': z
                        .union([z.string(), rampObj])
                        .optional()
                        .nullable()
                        .or(emptyStringToUndefined),
                    'line-opacity': z.number().optional().nullable(),
                    'line-width': z.number().optional().nullable(),
                    'circle-color': z
                        .union([z.string(), rampObj])
                        .optional()
                        .nullable()
                        .or(emptyStringToUndefined),
                    'circle-radius': z.number().optional().nullable(),
                    'circle-opacity': z.number().optional().nullable(),
                })
                .optional()
                .nullable(),
            filter: z.array(z.union([z.literal('all'), filterExpression])),
        })
    ),
})

export type RenderFormType = z.infer<typeof renderSchema>

export default function RenderForm({ onPrev, onNext }: InteractionFormProps) {
    const formObj = useForm<RenderFormType>()
    const onSubmit = () => {
        onNext()
    }
    return (
        <>
            <form
                className="flex min-h-[416px] flex-col justify-between px-4"
                onSubmit={formObj.handleSubmit(onSubmit)}
            >
                <div className="mt-10 grid gap-x-6 gap-y-4">
                    <ItemsArray formObj={formObj} />
                    <div className="flex items-center justify-end gap-x-2">
                        <Button
                            variant="outline"
                            onClick={() => onPrev()}
                            type="button"
                        >
                            Back
                        </Button>
                        <Button
                            type="button"
                            onClick={() => onNext()}
                            className="w-fit"
                        >
                            Save layer
                        </Button>
                    </div>
                </div>
            </form>
        </>
    )
}

function FilterExpressions({
    formObj,
    layerIdx,
}: {
    formObj: UseFormReturn<RenderFormType>
    layerIdx: number
}) {
    const { control, register, watch } = formObj
    const { fields, append, remove } = useFieldArray({
        control,
        name: `layers.${layerIdx}.filter`,
    })
    return (
        <div className="flex flex-col gap-y-4 pb-4">
            {fields.length > 1 && (
                <h2 className="text-xl font-acumin font-semibold">Filters</h2>
            )}
            {fields.map((field, index) => (
                <FilterExpression
                    formObj={formObj}
                    layerIdx={layerIdx}
                    filterIdx={index}
                    remove={() => remove(index)}
                />
            ))}
            <button
                onClick={() =>
                    append({
                        operation: { value: '==', label: 'Equals to' },
                        column: '',
                        value: '',
                    })
                }
                type="button"
                className="ml-auto flex items-center justify-end gap-x-1"
            >
                <PlusCircleIcon className="h-5 w-5 text-amber-400" />
                <span className="font-acumin text-lg font-normal leading-tight text-black">
                    Add a filter
                </span>
            </button>
        </div>
    )
}

function ItemsArray({ formObj }: { formObj: UseFormReturn<RenderFormType> }) {
    const { control, register, watch } = formObj
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'layers',
    })

    const RenderCirclePaint = (
        index: number,
        field: FieldArrayWithId<RenderFormType>
    ) => (
        <div className="flex flex-col gap-y-2">
            <InputGroup label="Circle Color">
                <input
                    type="color"
                    className="col-span-1 h-[40px] w-[40px] rounded shadow"
                    key={field.id}
                    {...register(`layers.${index}.paint.circle-color`)}
                />
            </InputGroup>
            <InputGroup label="Circle Radius">
                <Input
                    {...register(`layers.${index}.paint.circle-radius`)}
                    type="number"
                />
            </InputGroup>
            <InputGroup label="Circle Opacity">
                <Input
                    {...register(`layers.${index}.paint.circle-opacity`)}
                    type="number"
                />
            </InputGroup>
        </div>
    )

    const RenderFillPaint = (
        index: number,
        field: FieldArrayWithId<RenderFormType>
    ) => (
        <div className="flex flex-col gap-y-2">
            <InputGroup label="Fill Color">
                <input
                    type="color"
                    className="col-span-1 h-[40px] w-[40px] rounded shadow"
                    key={field.id}
                    {...register(`layers.${index}.paint.fill-color`)}
                />
            </InputGroup>
            <InputGroup label="Fill Opacity">
                <Input
                    {...register(`layers.${index}.paint.fill-opacity`)}
                    type="number"
                />
            </InputGroup>
        </div>
    )

    const RenderLinePaint = (
        index: number,
        field: FieldArrayWithId<RenderFormType>
    ) => (
        <div className="flex flex-col gap-y-2">
            <InputGroup label="Line Color">
                <input
                    type="color"
                    className="col-span-1 h-[40px] w-[40px] rounded shadow"
                    key={field.id}
                    {...register(`layers.${index}.paint.line-color`)}
                />
            </InputGroup>
            <InputGroup label="Line Width">
                <Input
                    {...register(`layers.${index}.paint.line-width`)}
                    type="number"
                />
            </InputGroup>
            <InputGroup label="Line Opacity">
                <Input
                    {...register(`layers.${index}.paint.line-opacity`)}
                    type="number"
                />
            </InputGroup>
        </div>
    )

    return (
        <div className="flex flex-col gap-y-4">
            {fields.map((field, index) => (
                <Disclosure
                    as="div"
                    className="border-b border-r border-stone-200 shadow"
                >
                    {({ open }) => (
                        <>
                            <Disclosure.Button className="flex h-16 w-full items-center gap-x-2 bg-white px-7 py-6">
                                <div className="flex h-16 w-full items-center gap-x-2">
                                    Render Item
                                </div>
                                <ChevronDownIcon
                                    className={`${
                                        open
                                            ? 'rotate-180 transform  transition'
                                            : ''
                                    } h-5 w-5 text-black`}
                                />
                            </Disclosure.Button>
                            <Transition
                                enter="transition duration-100 ease-out"
                                enterFrom="transform scale-95 opacity-0"
                                enterTo="transform scale-100 opacity-100"
                                leave="transition duration-75 ease-out"
                                leaveFrom="transform scale-100 opacity-100"
                                leaveTo="transform scale-95 opacity-0"
                            >
                                <Disclosure.Panel className="border-t-2 border-amber-400 bg-white px-7 pb-2 text-sm text-gray-500 py-8">
                                    <div key={field.id}>
                                        <InputGroup label="Render Type">
                                            <SimpleSelect
                                                formObj={formObj}
                                                name={`layers.${index}.type`}
                                                placeholder="Select the type of render"
                                                options={renderTypeOptions}
                                            />
                                        </InputGroup>
                                        <h2 className="text-xl font-acumin font-semibold">
                                            Paint Properties
                                        </h2>
                                        {match(watch('layers')[index])
                                            .with(
                                                { type: { value: 'circle' } },
                                                () =>
                                                    RenderCirclePaint(
                                                        index,
                                                        field
                                                    )
                                            )
                                            .with(
                                                { type: { value: 'fill' } },
                                                () =>
                                                    RenderFillPaint(
                                                        index,
                                                        field
                                                    )
                                            )
                                            .with(
                                                { type: { value: 'line' } },
                                                () =>
                                                    RenderLinePaint(
                                                        index,
                                                        field
                                                    )
                                            )
                                            .otherwise(() => (
                                                <></>
                                            ))}
                                        <FilterExpressions
                                            formObj={formObj}
                                            layerIdx={index}
                                        />
                                    </div>
                                    <div className="w-full flex justify-end">
                                        <Button
                                            variant="destructive"
                                            type="button"
                                            className="mb-4 ml-auto"
                                            onClick={() => remove(index)}
                                        >
                                            Delete Render Item
                                        </Button>
                                    </div>
                                </Disclosure.Panel>
                            </Transition>
                        </>
                    )}
                </Disclosure>
            ))}
            <button
                onClick={() =>
                    append({
                        type: {
                            value: 'circle',
                            label: 'Circle',
                        },
                        'source-layer': 'layer0',
                        filter: ['all'],
                    })
                }
                type="button"
                className="ml-auto flex items-center justify-end gap-x-1"
            >
                <PlusCircleIcon className="h-5 w-5 text-amber-400" />
                <span className="font-acumin text-lg font-normal leading-tight text-black">
                    Add a render item
                </span>
            </button>
        </div>
    )
}

function FilterExpression({
    formObj,
    layerIdx,
    filterIdx,
    remove,
}: {
    formObj: UseFormReturn<RenderFormType>
    layerIdx: number
    filterIdx: number
    remove: () => void
}) {
    const { control, register, watch } = formObj
    console.log('FILTER', watch(`layers.${layerIdx}.filter.${filterIdx}`))
    if (watch(`layers.${layerIdx}.filter.${filterIdx}`) === 'all') return <></>
    return (
        <Disclosure
            as="div"
            className="border-b border-r border-stone-200 shadow"
        >
            {({ open }) => (
                <>
                    <Disclosure.Button className="flex h-16 w-full items-center gap-x-2 bg-white px-7 py-6">
                        <div className="flex h-16 w-full items-center gap-x-2">
                            Filter {filterIdx + 1}
                        </div>
                        <ChevronDownIcon
                            className={`${
                                open ? 'rotate-180 transform  transition' : ''
                            } h-5 w-5 text-black`}
                        />
                    </Disclosure.Button>
                    <Transition
                        enter="transition duration-100 ease-out"
                        enterFrom="transform scale-95 opacity-0"
                        enterTo="transform scale-100 opacity-100"
                        leave="transition duration-75 ease-out"
                        leaveFrom="transform scale-100 opacity-100"
                        leaveTo="transform scale-95 opacity-0"
                    >
                        <Disclosure.Panel className="border-t-2 border-amber-400 bg-white px-7 pb-2 text-sm text-gray-500">
                            <div className="py-4 flex flex-col gap-y-2">
                                <InputGroup label="Operation">
                                    <SimpleSelect
                                        formObj={formObj}
                                        name={`layers.${layerIdx}.filter.${filterIdx}.operation`}
                                        placeholder="Select filter operation"
                                        options={filterOperationOptions}
                                    />
                                </InputGroup>
                                <InputGroup label="Column">
                                    <Input
                                        {...register(
                                            `layers.${layerIdx}.filter.${filterIdx}.column`
                                        )}
                                        type="text"
                                    />
                                </InputGroup>
                                <InputGroup label="Value">
                                    <Input
                                        {...register(
                                            `layers.${layerIdx}.filter.${filterIdx}.value`
                                        )}
                                        type="text"
                                    />
                                </InputGroup>
                            </div>
                            <div className="w-full flex justify-end">
                                <Button
                                    variant="destructive"
                                    type="button"
                                    className="mb-4 ml-auto"
                                    onClick={() => remove()}
                                >
                                    Delete Filter Item
                                </Button>
                            </div>
                        </Disclosure.Panel>
                    </Transition>
                </>
            )}
        </Disclosure>
    )
}
