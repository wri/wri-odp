import { Filter } from '@/interfaces/search.interface'
import { SearchInput } from '@/schema/search.schema'
import { Disclosure, Transition } from '@headlessui/react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {Input} from '../_shared/SimpleInput'

export default function TemporalCoverageFacet({
    setFilters,
    filters,
}: {
    setFilters: Dispatch<SetStateAction<Filter[]>>
    filters: Filter[]
}) {
    const getUpdatedState = () => {
        return ['temporal_coverage_start', 'temporal_coverage_end'].reduce(
            (a, v) => {
                const value = filters.find((f) => f?.key == v)

                return {
                    ...a,
                    [v]: value,
                }
            },
            {}
        )
    }

    const [optionsState, setOptionsState] = useState<{ [k: string]: number }>(
        getUpdatedState()
    )

    useEffect(() => {
        setOptionsState(getUpdatedState())
    }, [filters])

    return (
        <Disclosure
            as="div"
            className="border-b border-r border-stone-200 shadow"
        >
            {({ open }) => (
                <>
                    <Disclosure.Button className="flex h-16 w-full items-center gap-x-2 bg-white px-7 py-6">
                        <div className="flex h-16 w-full items-center gap-x-2">
                            <p className="font-['Acumin Pro SemiCondensed'] text-base font-normal text-black">
                                Temporal Coverage
                            </p>
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
                                    <div
                                        key={'temporal_coverage_start'}
                                        className="relative flex items-start py-1"
                                    >
                                        <div className="min-w-0 flex-1 text-sm leading-6">
                                            <label className="select-none font-medium text-gray-900">
                                                Start
                                            </label>
                                        </div>
                                        <div className="mr-3 flex h-6 items-center">
                                            <Input
                                                id={`facet-temporal_coverage-start}`}
                                                placeholder='E.g. "2010"'
                                                type="number"
                                                min="0"
                                                max="3000"
                                                className="h-8 w-28 rounded border-gray-300 text-gray-500 focus:ring-gray-500"
                                                defaultValue={
                                                    optionsState.temporal_coverage_start
                                                }
                                                onKeyDown={(e: any) => {
                                                    if (e.key == 'Enter') {
                                                        setFilters((prev) => {
                                                            const value =
                                                                e?.target?.value

                                                            const newFilters = [
                                                                ...prev,
                                                            ]

                                                            const filter =
                                                                newFilters.find(
                                                                    (f) =>
                                                                        f.key ==
                                                                        'temporal_coverage_start'
                                                                )

                                                            if (
                                                                value &&
                                                                !filter
                                                            ) {
                                                                newFilters.push(
                                                                    {
                                                                        key: 'temporal_coverage_start',
                                                                        title: 'Temporal Coverage Start',
                                                                        value: value,
                                                                        label: value,
                                                                    }
                                                                )
                                                            }
                                                            if (
                                                                value &&
                                                                filter
                                                            ) {
                                                                newFilters.splice(
                                                                    newFilters.findIndex(
                                                                        (e) =>
                                                                            e.key ==
                                                                            'temporal_coverage_start'
                                                                    ),
                                                                    1
                                                                )
                                                                newFilters.push(
                                                                    {
                                                                        key: 'temporal_coverage_start',
                                                                        title: 'Temporal Coverage Start',
                                                                        value: value,
                                                                        label: value,
                                                                    }
                                                                )
                                                            } else if (!value) {
                                                                newFilters.splice(
                                                                    newFilters.findIndex(
                                                                        (e) =>
                                                                            e.key ==
                                                                            'temporal_coverage_start'
                                                                    ),
                                                                    1
                                                                )
                                                            }

                                                            return newFilters
                                                        })
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </fieldset>
                            <fieldset>
                                <div className="mt-2">
                                    <div
                                        key={'temporal_coverage_end'}
                                        className="relative flex items-start py-1"
                                    >
                                        <div className="min-w-0 flex-1 text-sm leading-6">
                                            <label className="select-none font-medium text-gray-900">
                                                End
                                            </label>
                                        </div>
                                        <div className="mr-3 flex h-6 items-center">
                                            <Input
                                                id={`facet-temporal_coverage-end}`}
                                                type="number"
                                                min="0"
                                                max="3000"
                                                placeholder='E.g. "2015"'
                                                defaultValue={
                                                    optionsState.temporal_coverage_end
                                                }
                                                className="h-8 w-28 rounded border-gray-300 text-gray-500 focus:ring-gray-500"
                                                onKeyDown={(e: any) => {
                                                    if (e.key == 'Enter') {
                                                        setFilters((prev) => {
                                                            const value =
                                                                e?.target?.value

                                                            const newFilters = [
                                                                ...prev,
                                                            ]

                                                            const filter =
                                                                newFilters.find(
                                                                    (f) =>
                                                                        f.key ==
                                                                        'temporal_coverage_end'
                                                                )

                                                            if (
                                                                value &&
                                                                !filter
                                                            ) {
                                                                newFilters.push(
                                                                    {
                                                                        key: 'temporal_coverage_end',
                                                                        title: 'Temporal Coverage End',
                                                                        value: value,
                                                                        label: value,
                                                                    }
                                                                )
                                                            }
                                                            if (
                                                                value &&
                                                                filter
                                                            ) {
                                                                newFilters.splice(
                                                                    newFilters.findIndex(
                                                                        (e) =>
                                                                            e.key ==
                                                                            'temporal_coverage_end'
                                                                    ),
                                                                    1
                                                                )
                                                                newFilters.push(
                                                                    {
                                                                        key: 'temporal_coverage_end',
                                                                        title: 'Temporal Coverage End',
                                                                        value: value,
                                                                        label: value,
                                                                    }
                                                                )
                                                            } else if (!value) {
                                                                newFilters.splice(
                                                                    newFilters.findIndex(
                                                                        (e) =>
                                                                            e.key ==
                                                                            'temporal_coverage_end'
                                                                    ),
                                                                    1
                                                                )
                                                            }

                                                            return newFilters
                                                        })
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </fieldset>
                        </Disclosure.Panel>
                    </Transition>
                </>
            )}
        </Disclosure>
    )
}
