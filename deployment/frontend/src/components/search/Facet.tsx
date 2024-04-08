import { Filter } from '@/interfaces/search.interface'
import { SearchInput } from '@/schema/search.schema'
import { Disclosure, Transition } from '@headlessui/react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

interface Option {
    value: string
    label: string
}

export default function Facet({
    text,
    options,
    fqKey,
    setFilters,
    filters,
}: {
    text: string
    options: Option[]
    fqKey: string
    setFilters: Dispatch<SetStateAction<Filter[]>>
    filters: Filter[]
}) {
    const getUpdatedOptionsState = () => {
        return options.reduce((a, v) => {
            const checked = filters.find(
                (f) => f?.key == fqKey && f?.value == v.value
            )

            return {
                ...a,
                [v.value]: checked,
            }
        }, {})
    }

    const [optionsState, setOptionsState] = useState<{ [k: string]: boolean }>(
        getUpdatedOptionsState()
    )

    useEffect(() => {
        setOptionsState(getUpdatedOptionsState)
    }, [filters])

    return (
        <Disclosure
            as="div"
            className="border-b border-r border-stone-200 shadow"
            role="listitem"
        >
            {({ open }) => (
                <>
                    <Disclosure.Button className="flex h-16 w-full items-center gap-x-2 bg-white px-7 py-6">
                        <div className="flex h-16 w-full items-center gap-x-2">
                            <p className="font-['Acumin Pro SemiCondensed'] text-base font-normal text-black">
                                {text}
                            </p>
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 p-1 text-xs font-normal text-black">
                                {options.length}
                            </span>
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
                            <fieldset>
                                <div className="mt-2">
                                    {options.map((option) => (
                                        <div
                                            key={option.value}
                                            className="relative flex items-start py-1"
                                        >
                                            <div className="mr-3 flex h-6 items-center">
                                                <input
                                                    id={`facet-${fqKey}-${option.value}`}
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-gray-300 text-gray-500 focus:ring-gray-500"
                                                    checked={
                                                        optionsState[
                                                            option.value
                                                        ]
                                                    }
                                                    onChange={(e) => {
                                                        const checked =
                                                            e.target.checked

                                                        setFilters((prev) => {
                                                            const newFilters = [
                                                                ...prev,
                                                            ]

                                                            if (checked) {
                                                                newFilters.push(
                                                                    {
                                                                        key: fqKey,
                                                                        title: text,
                                                                        value: option.value,
                                                                        label: option.label,
                                                                    }
                                                                )
                                                            } else {
                                                                newFilters.splice(
                                                                    newFilters.findIndex(
                                                                        (e) =>
                                                                            e.key ==
                                                                                fqKey &&
                                                                            e.value ==
                                                                                option.value
                                                                    ),
                                                                    1
                                                                )
                                                            }

                                                            return newFilters
                                                        })
                                                    }}
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1 text-sm leading-6">
                                                <label
                                                    htmlFor={`facet-${fqKey}-${option.value}`}
                                                    className="select-none font-medium text-gray-900"
                                                >
                                                    {option.label ??
                                                        option.value}
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </fieldset>
                        </Disclosure.Panel>
                    </Transition>
                </>
            )}
        </Disclosure>
    )
}
