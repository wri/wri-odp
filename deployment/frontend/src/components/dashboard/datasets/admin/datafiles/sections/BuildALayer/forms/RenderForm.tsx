import { Fragment } from 'react'
import { Button } from '@/components/_shared/Button'
import { InputGroup } from '@/components/_shared/InputGroup'
import { Input } from '@/components/_shared/SimpleInput'
import SimpleSelect from '@/components/_shared/SimpleSelect'
import { ChevronDownIcon, PlusCircleIcon } from '@heroicons/react/24/outline'
import { Path, useFieldArray, useFormContext } from 'react-hook-form'
import { match } from 'ts-pattern'
import {
    filterOperationOptions,
    rampTypes,
    renderTypeOptions,
} from '../../../../formOptions'
import { Disclosure, Switch, Transition } from '@headlessui/react'
import { LayerFormType } from '../layer.schema'
import { useState } from 'react'
import classNames from '@/utils/classnames'
import { useColumns } from '../useColumns'
import SimpleCombobox from '@/components/dashboard/_shared/SimpleCombobox'
import { Accordion } from '@/components/dashboard/datasets/admin/datafiles/sections/BuildALayer/Accordion'

interface InteractionFormProps {
    onNext: () => void
    onPrev: () => void
}

export default function RenderForm({ onPrev, onNext }: InteractionFormProps) {
    const formObj = useFormContext<LayerFormType>()
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
                    <ItemsArray />
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
                            Next: Legends
                        </Button>
                    </div>
                </div>
            </form>
        </>
    )
}
function ItemsArray() {
    const formObj = useFormContext<LayerFormType>()
    const { control, register, watch } = formObj
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'layerConfig.render.layers',
    })

    const RenderCirclePaint = (index: number) => (
        <div className="flex flex-col gap-y-2">
            <InputGroup
                label="Circle Color"
                className="sm:grid-cols-1 gap-x-2"
                labelClassName="sm:text-start xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
            >
                <ColorPicker
                    name={`layerConfig.render.layers.${index}.paint.circle-color`}
                />
            </InputGroup>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputGroup
                    label="Circle Radius"
                    className="sm:grid-cols-1 gap-x-2"
                    labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                >
                    <Input
                        {...register(
                            `layerConfig.render.layers.${index}.paint.circle-radius`,
                            {
                                valueAsNumber: true,
                                setValueAs: (v) => {
                                    console.log('V', v)
                                    return v === '' ? undefined : parseFloat(v)
                                },
                            }
                        )}
                        defaultValue={1}
                        step="any"
                        type="number"
                    />
                </InputGroup>
                <InputGroup
                    label="Circle Opacity"
                    className="sm:grid-cols-1 gap-x-2"
                    labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                >
                    <Input
                        {...register(
                            `layerConfig.render.layers.${index}.paint.circle-opacity`,
                            {
                                valueAsNumber: true,
                                setValueAs: (v) =>
                                    v === '' ? undefined : parseFloat(v),
                            }
                        )}
                        defaultValue={1}
                        step="any"
                        type="number"
                    />
                </InputGroup>
            </div>
        </div>
    )

    const RenderFillPaint = (index: number) => (
        <div className="flex flex-col gap-y-2">
            <InputGroup
                label="Fill Color"
                className="sm:grid-cols-1 gap-x-2"
                labelClassName="sm:text-start xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
            >
                <ColorPicker
                    name={`layerConfig.render.layers.${index}.paint.fill-color`}
                />
            </InputGroup>
            <InputGroup
                label="Fill Opacity"
                className="sm:grid-cols-1 gap-x-2"
                labelClassName="sm:text-start xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
            >
                <Input
                    {...register(
                        `layerConfig.render.layers.${index}.paint.fill-opacity`,
                        {
                            valueAsNumber: true,
                            setValueAs: (v) =>
                                v === '' ? undefined : parseFloat(v),
                        }
                    )}
                    defaultValue={1}
                    step="any"
                    type="number"
                />
            </InputGroup>
        </div>
    )

    const RenderLinePaint = (index: number) => (
        <div className="flex flex-col gap-y-2">
            <InputGroup
                label="Line Color"
                className="sm:grid-cols-1 gap-x-2"
                labelClassName="sm:text-start xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
            >
                <ColorPicker
                    name={`layerConfig.render.layers.${index}.paint.line-color`}
                />
            </InputGroup>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputGroup
                    label="Line Width"
                    className="sm:grid-cols-1 gap-x-2"
                    labelClassName="sm:text-start xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                >
                    <Input
                        {...register(
                            `layerConfig.render.layers.${index}.paint.line-width`,
                            {
                                valueAsNumber: true,
                                setValueAs: (v) =>
                                    v === '' ? undefined : parseFloat(v),
                            }
                        )}
                        defaultValue={1}
                        step="any"
                        type="number"
                    />
                </InputGroup>
                <InputGroup
                    label="Line Opacity"
                    className="sm:grid-cols-1 gap-x-2"
                    labelClassName="sm:text-start xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                >
                    <Input
                        {...register(
                            `layerConfig.render.layers.${index}.paint.line-opacity`,
                            {
                                valueAsNumber: true,
                                setValueAs: (v) =>
                                    v === '' ? undefined : parseFloat(v),
                            }
                        )}
                        defaultValue={1}
                        step="any"
                        type="number"
                    />
                </InputGroup>
            </div>
        </div>
    )

    return (
        <div className="flex flex-col gap-y-4 max-h-[375px] overflow-auto">
            {fields.map((field, index) => (
                <Accordion key={field.id} text="Render Item">
                    <div>
                        <Accordion text="Render Properties">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputGroup
                                    label="Render Type"
                                    className="sm:grid-cols-1 gap-x-2"
                                    labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                >
                                    <SimpleSelect
                                        formObj={formObj}
                                        name={`layerConfig.render.layers.${index}.type`}
                                        placeholder="Select the type of render"
                                        options={renderTypeOptions}
                                    />
                                </InputGroup>
                                <InputGroup
                                    className="sm:grid-cols-1 gap-x-2"
                                    label="Source Layer"
                                    labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                >
                                    <Input
                                        defaultValue={'layer0'}
                                        {...register(
                                            `layerConfig.render.layers.${index}.source-layer`
                                        )}
                                        type="text"
                                    />
                                </InputGroup>
                            </div>
                        </Accordion>
                        <Accordion text="Paint Properties">
                            {match(watch('layerConfig.render.layers')[index])
                                .with({ type: { value: 'circle' } }, () =>
                                    RenderCirclePaint(index)
                                )
                                .with({ type: { value: 'fill' } }, () =>
                                    RenderFillPaint(index)
                                )
                                .with({ type: { value: 'line' } }, () =>
                                    RenderLinePaint(index)
                                )
                                .otherwise(() => (
                                    <></>
                                ))}
                        </Accordion>
                        <FilterExpressions layerIdx={index} />
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
                </Accordion>
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

function FilterExpressions({ layerIdx }: { layerIdx: number }) {
    const formObj = useFormContext<LayerFormType>()
    const { control, register, watch } = formObj
    const { fields, append, remove } = useFieldArray({
        control,
        name: `layerConfig.render.layers.${layerIdx}.filter`,
    })
    return (
        <div className="flex flex-col gap-y-4 pb-4">
            {fields.map((field, index) => (
                <FilterExpression
                    key={field.id}
                    layerIdx={layerIdx}
                    filterIdx={index}
                    remove={() => remove(index)}
                />
            ))}
            <button
                onClick={() =>
                    append({
                        operation: { value: '==', label: 'Equals to' },
                        column: { value: '', label: '' },
                        value: null,
                    })
                }
                type="button"
                className="ml-auto flex items-center justify-end gap-x-1 pt-4"
            >
                <PlusCircleIcon className="h-5 w-5 text-amber-400" />
                <span className="font-acumin text-lg font-normal leading-tight text-black">
                    Add a filter
                </span>
            </button>
        </div>
    )
}

function FilterExpression({
    layerIdx,
    filterIdx,
    remove,
}: {
    layerIdx: number
    filterIdx: number
    remove: () => void
}) {
    const formObj = useFormContext<LayerFormType>()
    const { control, register, watch } = formObj
    if (
        watch(`layerConfig.render.layers.${layerIdx}.filter.${filterIdx}`) ===
        'all'
    )
        return <></>
    const columns = useColumns(
        watch('layerConfig.source.provider.type.value'),
        watch('connectorUrl') as string,
        !!watch('connectorUrl')
    )
    return (
        <Accordion text={`Filter ${filterIdx}`}>
            <div className="py-4 flex flex-col gap-y-2">
                <InputGroup label="Operation">
                    <SimpleSelect
                        formObj={formObj}
                        name={`layerConfig.render.layers.${layerIdx}.filter.${filterIdx}.operation`}
                        placeholder="Select filter operation"
                        options={filterOperationOptions}
                    />
                </InputGroup>
                <InputGroup label="Column">
                    <SimpleCombobox
                        options={
                            columns.data
                                ? columns.data.map((column) => ({
                                      value: column,
                                      label: column,
                                  }))
                                : []
                        }
                        placeholder="Select column to match"
                        formObj={formObj}
                        name={`layerConfig.render.layers.${layerIdx}.filter.${filterIdx}.column`}
                    />
                </InputGroup>
                <InputGroup label="Value">
                    <Input
                        {...register(
                            `layerConfig.render.layers.${layerIdx}.filter.${filterIdx}.value`,
                            {
                                valueAsNumber: true,
                                setValueAs: (v) =>
                                    v === '' ? undefined : parseFloat(v),
                            }
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
        </Accordion>
    )
}

function ColorPicker({
    name,
}: {
    name:
        | `layerConfig.render.layers.${number}.paint.fill-color`
        | `layerConfig.render.layers.${number}.paint.circle-color`
        | `layerConfig.render.layers.${number}.paint.line-color`
}) {
    const formObj = useFormContext<LayerFormType>()
    const { register, watch } = formObj
    const [rampObjEnabled, setRampObjEnabled] = useState(
        watch(name) ? typeof watch(name) !== 'string' : false
    )
    return (
        <div className="flex flex-col gap-y-4">
            <Switch.Group as="div" className="flex items-center">
                <Switch
                    checked={rampObjEnabled}
                    onChange={setRampObjEnabled}
                    className={classNames(
                        rampObjEnabled ? 'bg-blue-800' : 'bg-gray-200',
                        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-800 focus:ring-offset-2'
                    )}
                >
                    <span
                        aria-hidden="true"
                        className={classNames(
                            rampObjEnabled ? 'translate-x-5' : 'translate-x-0',
                            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                        )}
                    />
                </Switch>
                <Switch.Label as="span" className="ml-3 text-sm">
                    <span className="font-medium text-gray-900">
                        Use a {rampObjEnabled ? 'plain color' : 'ramp object'}
                    </span>{' '}
                </Switch.Label>
            </Switch.Group>
            {rampObjEnabled ? (
                <RampObj name={name} />
            ) : (
                <div className="pb-8">
                    <Input type="text" defaultValue={''} {...register(name)} />
                </div>
            )}
        </div>
    )
}

function RampObj({
    name,
}: {
    name:
        | `layerConfig.render.layers.${number}.paint.fill-color`
        | `layerConfig.render.layers.${number}.paint.circle-color`
        | `layerConfig.render.layers.${number}.paint.line-color`
}) {
    const formObj = useFormContext<LayerFormType>()
    const { control, register, watch } = formObj
    const { fields, append, remove } = useFieldArray({
        control,
        name: `${name}.output`,
    })
    const columns = useColumns(
        watch('layerConfig.source.provider.type.value'),
        watch('connectorUrl') as string,
        !!watch('connectorUrl')
    )
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pb-8">
            <InputGroup
                label="Type"
                className="sm:grid-cols-1 gap-x-2"
                labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
            >
                <SimpleSelect
                    formObj={formObj}
                    name={`${name}.type` as Path<LayerFormType>}
                    placeholder="Select a step operation"
                    options={rampTypes}
                />
            </InputGroup>
            <InputGroup
                label="Column to match"
                className="sm:grid-cols-1 gap-x-2"
                labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
            >
                <SimpleCombobox
                    options={
                        columns.data
                            ? columns.data.map((column) => ({
                                  value: column,
                                  label: column,
                              }))
                            : []
                    }
                    placeholder="Select column to match"
                    formObj={formObj}
                    name={`${name}.input.column` as Path<LayerFormType>}
                />
            </InputGroup>
            {fields.map((field, index) => (
                <Fragment key={field.id}>
                    <InputGroup
                        label="Color of step"
                        className="sm:grid-cols-1 gap-x-2"
                        labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                    >
                        <Input
                            {...register(
                                `${name}.output.${index}.color` as Path<LayerFormType>
                            )}
                            type="text"
                        />
                    </InputGroup>
                    <InputGroup
                        label="Value of stop"
                        className="sm:grid-cols-1 gap-x-2"
                        labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                    >
                        <Input
                            {...register(
                                `${name}.output.${index}.value` as Path<LayerFormType>,
                                {
                                    setValueAs: (v) =>
                                        v === '' ? undefined : parseFloat(v),
                                }
                            )}
                            step="any"
                            type="number"
                        />
                    </InputGroup>
                </Fragment>
            ))}
            <button
                onClick={() =>
                    append({
                        color: '',
                        value: 0,
                    })
                }
                type="button"
                className="ml-auto flex items-center justify-end gap-x-1 col-span-full"
            >
                <PlusCircleIcon className="h-4 w-4 text-amber-400 mb-1" />
                <span className="font-acumin text-sm font-normal leading-tight text-black">
                    Add a step
                </span>
            </button>
        </div>
    )
}
