import { useState } from 'react'
import {
    CheckIcon,
    ChevronDownIcon,
    ChevronUpDownIcon,
} from '@heroicons/react/20/solid'
import { Combobox } from '@headlessui/react'
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

interface ComboboxProps<T extends FieldValues, V extends Object> {
    options: PathValue<T, Path<T> & Option<V>>[]
    placeholder: string
    className?: string
    maxWidth?: string
    formObj?: UseFormReturn<T>
    name: Path<T>
}

export default function SimpleCombobox<
    T extends FieldValues,
    V extends Object,
>({ options, name, formObj, className = '' }: ComboboxProps<T, V>) {
    const { control } = formObj ?? useForm()
    const [query, setQuery] = useState('')

    const filteredItems =
        query === ''
            ? options
            : options.filter((option) => {
                  return option.label
                      .toLowerCase()
                      .includes(query.toLowerCase())
              })

    return (
        <Controller
            control={control}
            name={name}
            defaultValue={options.find((option) => option.default)}
            render={({ field: { onChange: setSelected, value: selected } }) => (
                <Combobox
                    as="div"
                    className="w-full"
                    value={selected}
                    onChange={setSelected}
                >
                    <div className="relative mt-2 w-full">
                        <Combobox.Input
                            id={name}
                            className={classNames(
                                'relative text-left block w-full rounded-md border-0 px-5 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-b-2 focus:border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6 max-w-[70rem]'
                            )}
                            onChange={(event) => setQuery(event.target.value)}
                            displayValue={(item: Option<V>) => item?.label}
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                            <ChevronDownIcon
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                            />
                        </Combobox.Button>

                        {filteredItems.length > 0 && (
                            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                {filteredItems.map((item) => (
                                    <Combobox.Option
                                        key={item.value}
                                        value={item}
                                        className={({ active }) =>
                                            classNames(
                                                'relative cursor-default select-none py-2 pl-8 pr-4',
                                                active
                                                    ? 'bg-blue-800 text-white'
                                                    : 'text-gray-900'
                                            )
                                        }
                                    >
                                        {({ active, selected }) => (
                                            <>
                                                <span
                                                    className={classNames(
                                                        'block truncate',
                                                        selected &&
                                                            'font-semibold'
                                                    )}
                                                >
                                                    {item.label}
                                                </span>

                                                {selected && (
                                                    <span
                                                        className={classNames(
                                                            'absolute inset-y-0 left-0 flex items-center pl-1.5',
                                                            active
                                                                ? 'text-white'
                                                                : 'text-blue-800'
                                                        )}
                                                    >
                                                        <CheckIcon
                                                            className="h-5 w-5"
                                                            aria-hidden="true"
                                                        />
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </Combobox.Option>
                                ))}
                            </Combobox.Options>
                        )}
                    </div>
                </Combobox>
            )}
        />
    )
}
