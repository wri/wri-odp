import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import classNames from '@/utils/classnames'
import {
    Controller,
    FieldValues,
    Path,
    PathValue,
    UseFormReturn,
    useForm,
} from 'react-hook-form'

export interface Option<V> {
    label: string
    value: V
    default?: boolean
}

interface SimpleSelectProps<T extends FieldValues, V extends Object> {
    options: PathValue<T, Path<T> & Option<V>>[]
    placeholder: string
    className?: string
    maxWidth?: string
    formObj?: UseFormReturn<T>
    name: Path<T>
    initialValue?: Option<V> | null
    id?: string
}

export default function SimpleSelect<T extends FieldValues, V extends Object>({
    options,
    placeholder,
    className,
    maxWidth = 'xl:max-w-[28rem]',
    formObj,
    name,
    id,
    initialValue,
    onChange: _onChange = (val) => {},
}: SimpleSelectProps<T, V> & { onChange?: (val: any) => void }) {
    const { control } = formObj ?? useForm()
    return (
        <Controller
            control={control}
            name={name}
            defaultValue={options.find((option) => option.default)}
            render={({ field: { onChange: setSelected, value: selected } }) => (
                <Listbox
                    value={selected}
                    onChange={(e) => {
                        if (_onChange && e != null) {
                            _onChange(e.value)
                        }
                        setSelected(e)
                    }}
                >
                    {({ open }) => (
                        <>
                            <div
                                className={classNames(
                                    'relative w-full',
                                    maxWidth
                                )}
                            >
                                <Listbox.Button
                                    id={id}
                                    className={classNames(
                                        'relative text-left block w-full rounded-md border-0 px-5 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-b-2 focus:border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6',
                                        className ?? ''
                                    )}
                                >
                                    <span
                                        className={classNames(
                                            selected && selected.label
                                                ? ''
                                                : 'text-zinc-400',
                                            'block truncate'
                                        )}
                                    >
                                        {selected && selected.label
                                            ? selected.label
                                            : placeholder}
                                    </span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronDownIcon
                                            className="h-5 w-5 text-gray-400"
                                            aria-hidden="true"
                                        />
                                    </span>
                                </Listbox.Button>

                                <Transition
                                    show={open}
                                    as={Fragment}
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
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
                                                {({ selected, active }) => (
                                                    <>
                                                        <span
                                                            className={classNames(
                                                                selected
                                                                    ? 'font-semibold'
                                                                    : 'font-normal',
                                                                'block truncate'
                                                            )}
                                                        >
                                                            {option.label}
                                                        </span>
                                                    </>
                                                )}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </Transition>
                            </div>
                        </>
                    )}
                </Listbox>
            )}
        />
    )
}
