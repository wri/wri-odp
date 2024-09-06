import { Filter } from '@/interfaces/search.interface'
import { Disclosure, Transition } from '@headlessui/react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import TagMulText from './Tagmultext'

interface Option {
    value: string
    label: string
}

export default function Tags({
    options,
    fqKey,
    setFilters,
    filters,
    facetSelectedCount,
    setFacetSelectedCount,
    value,
    setValue,
}: {
    options: Option[]
    fqKey: string
    setFilters: Dispatch<SetStateAction<Filter[]>>
    filters: Filter[]
    facetSelectedCount: Record<string, number>
    setFacetSelectedCount: Dispatch<SetStateAction<Record<string, number>>>
    value: string[]
    setValue: Dispatch<SetStateAction<string[]>>
}) {
    // console.log('Facetselect79000: ', facetSelectedCount)
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
                                Tags
                            </p>
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 p-1 text-xs font-normal text-black">
                                {facetSelectedCount[fqKey] ?? 0}
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
                            <fieldset className="mt-4">
                                <TagMulText
                                    options={options}
                                    name="tags"
                                    title="Tags"
                                    filters={filters}
                                    setFilters={setFilters}
                                    setFacetSelectedCount={
                                        setFacetSelectedCount
                                    }
                                    facetSelectedCount={facetSelectedCount}
                                    value={value}
                                    setValue={setValue}
                                />
                            </fieldset>
                        </Disclosure.Panel>
                    </Transition>
                </>
            )}
        </Disclosure>
    )
}
