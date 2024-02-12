import { Button } from '@/components/_shared/Button'
import { PlusCircleIcon } from '@heroicons/react/20/solid'
import {
    InformationCircleIcon,
    MinusCircleIcon,
} from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Control,
    UseFieldArrayReturn,
    UseFormRegister,
    useFieldArray,
    useForm,
    useFormContext,
} from 'react-hook-form'
import { LayerFormType } from '../layer.schema'
import { getColors, legendsToAdd } from '../getColors'
import { DefaultTooltip } from '@/components/_shared/Tooltip'
import { ScrollArea } from '@/components/_shared/ScrollArea'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/_shared/Popover'
import Image from 'next/image'

export default function LegendForm({
    onNext,
    onPrev,
}: {
    onNext: () => void
    onPrev: () => void
}) {
    const formObj = useFormContext<LayerFormType>()
    const { handleSubmit, register, watch, control } = formObj
    const { append, fields, remove } = useFieldArray({
        name: 'legendConfig.items',
    })
    const onSubmit = () => onNext()
    return (
        <>
            <form
                className="flex min-h-[416px] flex-col justify-between px-4"
                onSubmit={handleSubmit(onSubmit)}
            >
                <div className="mt-10 flex w-full justify-end">
                    <DefaultTooltip content="This button will try to load the colors defined in the render object of the layer config directly as legends">
                        <Button
                            type="button"
                            onClick={() =>
                                legendsToAdd(
                                    formObj.watch('legendConfig'),
                                    formObj.watch('layerConfig.render')
                                ).forEach((color) => {
                                    append({
                                        name: 'Item',
                                        color: color ?? '#000000',
                                    })
                                })
                            }
                        >
                            Load Paint
                        </Button>
                    </DefaultTooltip>
                </div>
                <div className="flex flex-col gap-y-4">
                    <div className="grid grid-cols-12 gap-x-6">
                        <label className="lg:col-span-2 col-span-full lg:text-right text-left font-acumin text-lg font-normal leading-tight text-black flex items-center gap-x-2">
                            Type of Legend{' '}
                            <Popover>
                                <PopoverTrigger className="cursor-pointer">
                                    <InformationCircleIcon className="h-5 w-5 text-gray-500" />
                                    <PopoverContent className="p-4 bg-white shadow-lg rounded-lg max-w-sm w-full">
                                        <p className="text-md font-semibold">
                                            The type of legend to be displayed
                                            for the layer. The options are:
                                        </p>
                                        <ul className="text-sm">
                                            <li>
                                                Basic
                                                <Image
                                                    src="/docs/legends/basic.png"
                                                    alt="Image of basic legend"
                                                    layout="responsive"
                                                    width={300}
                                                    height={120}
                                                />
                                            </li>
                                            <li>
                                                Choropleth
                                                <Image
                                                    src="/docs/legends/choropleth.png"
                                                    alt="Image of choropleth legend"
                                                    layout="responsive"
                                                    width={300}
                                                    height={120}
                                                />
                                            </li>
                                            <li>
                                                Gradient
                                                <Image
                                                    src="/docs/legends/gradient.png"
                                                    alt="Image of gradient legend"
                                                    layout="responsive"
                                                    width={300}
                                                    height={120}
                                                />
                                            </li>
                                        </ul>
                                    </PopoverContent>
                                </PopoverTrigger>
                            </Popover>
                        </label>
                        <select
                            {...register('legendConfig.type')}
                            className="relative lg:col-span-10  col-span-full block w-full rounded-md border-0 px-5 py-2 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-b-2 focus:border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6"
                        >
                            <option value="basic">Basic</option>
                            <option value="choropleth">Choropleth</option>
                            <option value="gradient">Gradient</option>
                        </select>
                    </div>
                    <ScrollArea className="h-[315px]">
                        <div className="flex flex-col gap-y-4">
                            {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="grid grid-cols-12 items-center justify-start gap-x-2"
                                >
                                    <label className="lg:col-span-2 col-span-full lg:text-right text-left font-acumin text-lg font-normal leading-tight text-black">
                                        Item {index + 1}
                                    </label>
                                    <input
                                        className="shadow-wri-small col-span-8 block w-full rounded-md border-0 px-5 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-b-2 focus:border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6"
                                        key={field.id}
                                        {...register(
                                            `legendConfig.items.${index}.name`
                                        )}
                                    />
                                    <input
                                        type="color"
                                        className="col-span-1 h-[40px] w-[40px] rounded shadow"
                                        key={field.id}
                                        {...register(
                                            `legendConfig.items.${index}.color`
                                        )}
                                    />
                                    <DefaultTooltip content="Remove item">
                                        <div className="lg:col-span-1 col-span-2 pl-8 lg:pl-0">
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                            >
                                                <MinusCircleIcon className="h-6 w-6 text-red-500" />
                                            </button>
                                        </div>
                                    </DefaultTooltip>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                    <button
                        onClick={() =>
                            append({ name: 'Item', color: '#000000' })
                        }
                        type="button"
                        className="ml-auto flex items-center justify-end gap-x-1 my-2"
                    >
                        <PlusCircleIcon className="h-5 w-5 text-amber-400" />
                        <span className="font-acumin text-lg font-normal leading-tight text-black">
                            Add another item
                        </span>
                    </button>
                </div>
                <div className="col-span-full flex justify-end space-x-2">
                    <Button
                        variant="outline"
                        onClick={() => onPrev()}
                        type="button"
                    >
                        Back
                    </Button>
                    <Button type="button" onClick={() => onNext()}>
                        Next: Interaction
                    </Button>
                </div>
            </form>
        </>
    )
}
