import {
    PlusCircleIcon,
} from '@heroicons/react/20/solid'
import {
    InformationCircleIcon,
} from '@heroicons/react/24/outline'
import { MinusCircleIcon } from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Control,
    UseFormRegister,
    useFieldArray,
    useForm,
    useFormContext,
} from 'react-hook-form'
import { LayerFormType } from '../layer.schema'
import { InputGroup } from '@/components/_shared/InputGroup'
import { Input } from '@/components/_shared/SimpleInput'
import { Button } from '@/components/_shared/Button'
import { useState } from 'react'
import { Accordion } from '../Accordion'
import { ScrollArea } from '@/components/_shared/ScrollArea'
import { DefaultTooltip } from '@/components/_shared/Tooltip'

interface InteractionFormProps {
    onNext: () => void
    onPrev: () => void
}

export default function InteractionForm({
    onPrev,
    onNext,
}: InteractionFormProps) {
    const formObj = useFormContext<LayerFormType>()
    const [q, setQ] = useState('')
    const { handleSubmit, register, control } = formObj
    const onSubmit = () => {
        onNext()
    }
    return (
        <>
            <div className="mt-10 px-4 mb-4">
                <Input
                    onChange={(e) => setQ(e.target.value)}
                    type="text"
                    placeholder="Search interaction items"
                />
            </div>
            <form
                className="flex min-h-[416px] flex-col justify-between px-4"
                onSubmit={handleSubmit(onSubmit)}
            >
                <div className="gap-x-6 gap-y-4">
                    <ItemsArray control={control} register={register} q={q} />
                </div>
                <div className="flex items-center justify-end gap-x-2 my-2">
                    <Button
                        variant="outline"
                        onClick={() => onPrev()}
                        type="button"
                    >
                        Back
                    </Button>
                </div>
            </form>
        </>
    )
}

function ItemsArray({
    control,
    register,
    q = '',
}: {
    register: UseFormRegister<LayerFormType>
    control: Control<LayerFormType>
    q?: string
}) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'interactionConfig.output',
    })
    const { watch } = useFormContext<LayerFormType>()
    const filteredOutputs =
        q !== ''
            ? watch(`interactionConfig.output`)
                  ?.filter((item) =>
                      item.column ? item.column.includes(q) : false
                  )
                  .map((item) => item.column)
            : watch(`interactionConfig.output`).map((item) => item.column)
    return (
        <>
            <ScrollArea className="h-[375px]">
                <div className="flex flex-col gap-y-4">
                    {fields.map((field, index) => (
                        <Accordion
                            className={
                                filteredOutputs.includes(
                                    watch(
                                        `interactionConfig.output.${index}.column`
                                    )
                                )
                                    ? ''
                                    : 'hidden'
                            }
                            text={
                                watch(
                                    `interactionConfig.output.${index}.column`
                                ) ?? 'Output Config'
                            }
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pb-8">
                                <InputGroup
                                    label="Column"
                                    className="sm:grid-cols-1 gap-x-2"
                                    labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                >
                                    <Input
                                        {...register(
                                            `interactionConfig.output.${index}.column`
                                        )}
                                        type="text"
                                        icon={
                                            <DefaultTooltip contentClassName='max-w-[20rem]' content="The column that you want to show the data, needs to be spelled exactly like in the database">
                                                <InformationCircleIcon className="z-10 h-4 w-4 text-gray-300" />
                                            </DefaultTooltip>
                                        }
                                    />
                                </InputGroup>
                                {/*
                <InputGroup
                                    label="Format"
                                    className="sm:grid-cols-1 gap-x-2"
                                    labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                >
                                    <Input
                                        {...register(
                                            `interactionConfig.output.${index}.format`
                                        )}
                                        type="text"
                                    />
                                </InputGroup> */}
                                <InputGroup
                                    label="Prefix"
                                    className="sm:grid-cols-1 gap-x-2"
                                    labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                >
                                    <Input
                                        {...register(
                                            `interactionConfig.output.${index}.prefix`
                                        )}
                                        type="text"
                                        icon={
                                            <DefaultTooltip  side="left" contentClassName="max-w-[20rem]" content="Allows you to add a prefix to tooltip displaying this item">
                                                <InformationCircleIcon className="z-10 h-4 w-4 text-gray-300" />
                                            </DefaultTooltip>
                                        }
                                    />
                                </InputGroup>
                                <InputGroup
                                    label="Property"
                                    className="sm:grid-cols-1 gap-x-2"
                                    labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                >
                                    <Input
                                        {...register(
                                            `interactionConfig.output.${index}.property`
                                        )}
                                        type="text"
                                        icon={
                                            <DefaultTooltip contentClassName="max-w-[30rem]" content="Allows you to give a title to this item, for example instead of showing the column name country_index you could show 'Country Index'">
                                                <InformationCircleIcon className="z-10 h-4 w-4 text-gray-300" />
                                            </DefaultTooltip>
                                        }
                                    />
                                </InputGroup>
                                <InputGroup
                                    label="Suffix"
                                    className="sm:grid-cols-1 gap-x-2"
                                    labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                >
                                    <Input
                                        {...register(
                                            `interactionConfig.output.${index}.suffix`
                                        )}
                                        type="text"
                                        icon={
                                            <DefaultTooltip  side="left" contentClassName="max-w-[20rem]" content="Allows you to add a suffix to the tooltip displaying this item e.g: tonnes, degrees etc">
                                                <InformationCircleIcon className="z-10 h-4 w-4 text-gray-300" />
                                            </DefaultTooltip>
                                        }
                                    />
                                </InputGroup>
                                <InputGroup
                                    label="Type"
                                    className="sm:grid-cols-1 gap-x-2"
                                    labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                >
                                    <Input
                                        {...register(
                                            `interactionConfig.output.${index}.type`
                                        )}
                                        type="text"
                                        icon={
                                            <DefaultTooltip  contentClassName="max-w-[20rem]" content="Allows you to define the type for this column, e.g: datetime/number/year etc">
                                                <InformationCircleIcon className="z-10 h-4 w-4 text-gray-300" />
                                            </DefaultTooltip>
                                        }
                                    />
                                </InputGroup>
                                <div className="relative flex justify-start col-span-full">
                                    <div className="flex h-6 items-center">
                                        <input
                                            id="featured_dataset"
                                            aria-describedby="comments-description"
                                            {...register(
                                                `interactionConfig.output.${index}.enabled`
                                            )}
                                            type="checkbox"
                                            className="h-5 w-5 rounded border-gray-300 text-blue-800 shadow focus:ring-blue-800"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm leading-6">
                                        <label className="flex items-center gap-x-2 font-acumin text-lg font-light text-zinc-800">
                                            Enable
                                            <DefaultTooltip  contentClassName="max-w-[10rem]" content="Toggle this to enable the tooltip for this item">
                                                <InformationCircleIcon className="z-10 h-4 w-4 text-gray-300" />
                                            </DefaultTooltip>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="destructive"
                                type="button"
                                className="mb-4 ml-auto"
                                onClick={() => remove(index)}
                            >
                                Remove Interaction Item
                            </Button>
                        </Accordion>
                    ))}
                    <button
                        onClick={() =>
                            append({
                                column: '',
                                format: '',
                                prefix: '',
                                property: '',
                                suffix: '',
                                type: '',
                                enabled: false,
                            })
                        }
                        type="button"
                        className="ml-auto flex items-center justify-end gap-x-1"
                    >
                        <PlusCircleIcon className="h-5 w-5 text-amber-400" />
                        <span className="font-acumin text-lg font-normal leading-tight text-black">
                            Add another item
                        </span>
                    </button>
                </div>
            </ScrollArea>
        </>
    )
}
