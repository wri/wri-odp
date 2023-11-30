import { useState } from 'react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { Combobox } from '@headlessui/react'
import { api } from '@/utils/api'
import classNames from '@/utils/classnames'
import { Controller, Path, UseFormReturn } from 'react-hook-form'
import { DatasetFormType } from '@/schema/dataset.schema'
import Spinner from '@/components/_shared/Spinner'
import { match, P } from 'ts-pattern'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

export default function FormatInput({
    formObj,
    name,
    className = '',
}: {
    formObj: UseFormReturn<DatasetFormType>
    name: Path<DatasetFormType>
    className?: string
}) {
    const { control } = formObj
    const [query, setQuery] = useState('')
    const possibleFormats = api.dataset.getFormats.useQuery({ q: query })

    return (
        <Controller
            control={control}
            name={name}
            defaultValue={[]}
            render={({ field: { onChange, value } }) => (
                <Combobox
                    as="div"
                    className="w-full"
                    value={value}
                    onChange={onChange}
                >
                    <div className="relative mt-2 w-full">
                        <Combobox.Input
                            placeholder="Select format"
                            className={classNames(
                                'relative text-left block w-full rounded-md border-0 px-5 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-b-2 focus:border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6 max-w-[70rem]'
                            )}
                            onChange={(event) => setQuery(event.target.value)}
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                            <ChevronDownIcon
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                            />
                        </Combobox.Button>

                        {match(possibleFormats)
                            .with({ isLoading: true }, () => (
                                <span className="flex items-center text-sm gap-x-2">
                                    <Spinner />{' '}
                                    <span className="mt-1">
                                        Loading possible formats...
                                    </span>
                                </span>
                            ))
                            .with(
                                { isSuccess: true, data: P.select() },
                                (data) => (
                                    <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                        {data.length === 0 ? (
                                            <Combobox.Option
                                                key={query}
                                                value={query}
                                                className={({ active }) =>
                                                    classNames(
                                                        'relative cursor-default select-none py-2 pl-3 pr-9',
                                                        active
                                                            ? 'bg-blue-800 text-white'
                                                            : 'text-gray-900'
                                                    )
                                                }
                                            >
                                                Select {query}
                                            </Combobox.Option>
                                        ) : (
                                            data.map((format) => (
                                                <Combobox.Option
                                                    key={format}
                                                    value={format}
                                                    className={({ active }) =>
                                                        classNames(
                                                            'relative cursor-default select-none py-2 pl-3 pr-9',
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
                                                                {format.toUpperCase()}
                                                            </span>

                                                            {selected && (
                                                                <span
                                                                    className={classNames(
                                                                        'absolute inset-y-0 right-0 flex items-center pr-4',
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
                                            ))
                                        )}
                                    </Combobox.Options>
                                )
                            )
                            .otherwise(() => (
                                <span>There was an error</span>
                            ))}
                    </div>
                </Combobox>
            )}
        />
    )
}
