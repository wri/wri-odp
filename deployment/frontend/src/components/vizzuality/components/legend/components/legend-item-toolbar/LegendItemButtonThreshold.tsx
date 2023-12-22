import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import {
    AdjustmentsVerticalIcon,
    ChevronDownIcon,
} from '@heroicons/react/20/solid'
import classNames from '@/utils/classnames'
import {
    Controller,
    FieldValues,
    Path,
    PathValue,
    UseFormReturn,
    useForm,
} from 'react-hook-form'
import { useThreshold } from '@/utils/storeHooks'

export interface Option<V> {
    label: string
    value: V
    default?: boolean
}

export default function LegendItemButtonThreshold<
    T extends FieldValues,
    V extends Object,
>(props: any) {
    const { activeLayer } = props
    const { control } = useForm()
    const { setThreshold, threshold } = useThreshold()

    const hasThreshold = activeLayer?.layerConfig?.params_config?.some(
        (item: any) => item.key == 'thresh'
    )

    const options = [10, 15, 20, 25, 30, 50, 75].map((item) => ({
        label: `>${item}%`,
        value: item,
        default: item == threshold
    }))

    return hasThreshold ? (
        <Controller
            control={control}
            name={'threshold' as Path<T>}
            // @ts-ignore
            defaultValue={
                options.find((option) => option.default) ??
                ({
                    value: '',
                    label: '',
                } as PathValue<T, Path<T> & Option<V>>)
            }
            render={({ field: { onChange: setSelected, value: selected } }) => (
                <Listbox
                    value={selected}
                    onChange={(e) => {
                        setSelected(e)
                        setThreshold(e.value)
                    }}
                >
                    {({ open }) => (
                        <>
                            <div className="relative">
                                <Listbox.Button
                                    id={'threshold'}
                                    className={classNames(
                                        'relative text-left block w-full rounded-md border-0 px-5 py-3 text-gray-900 placeholder:text-gray-400 sm:text-sm sm:leading-6'
                                    )}
                                >
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                                        <AdjustmentsVerticalIcon className="w-4" />
                                    </span>
                                </Listbox.Button>

                                <div className="absolute bottom-[300px] left-[20px]">
                                    <Transition
                                        show={open}
                                        as={Fragment}
                                        leave="transition ease-in duration-100"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                    >
                                        <Listbox.Options className="fixed z-50 mt-1 max-h-60 w-full auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                            {options.map((option) => (
                                                <Listbox.Option
                                                    key={option.value}
                                                    className={({ active }) =>
                                                        classNames(
                                                            active
                                                                ? 'bg-blue-800 text-white'
                                                                : 'text-gray-900',
                                                            'relative cursor-default select-none py-2 pl-3 pr-9'
                                                        )
                                                    }
                                                    value={option}
                                                >
                                                    {({ selected, active }) => {
                                                        return (
                                                            <>
                                                                <span
                                                                    className={classNames(
                                                                        selected
                                                                            ? 'font-semibold'
                                                                            : 'font-normal',
                                                                        'block truncate'
                                                                    )}
                                                                >
                                                                    {
                                                                        option.label
                                                                    }
                                                                </span>
                                                            </>
                                                        )
                                                    }}
                                                </Listbox.Option>
                                            ))}
                                        </Listbox.Options>
                                    </Transition>
                                </div>
                            </div>
                        </>
                    )}
                </Listbox>
            )}
        />
    ) : null
}
