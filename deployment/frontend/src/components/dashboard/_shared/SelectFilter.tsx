import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import classNames from '@/utils/classnames'
import type { SearchInput } from '@/schema/search.schema'

interface Option {
    id: string
    label: string
}

export default function SelectFilter({
    options,
    setQuery,
    query,
    filtername,
}: {
    options: { id: string; label: string | undefined }[]
    filtername: string
    setQuery: React.Dispatch<React.SetStateAction<SearchInput>>
    query: SearchInput
}) {
    const [selected, setSelected] = useState(
        options[0] ? options[0] : { id: '0', label: '' }
    )

    const handleSelect = (option: Option) => {
        setSelected(option)
        if (option.id === 'None' && filtername !== 'selectEntity') {
            const { [filtername]: filterdata, ...remainingFilters } =
                query.fq || {}
            const updateQuery: SearchInput = {
                page: { ...query?.page, start: 0 },
                search: query.search,
                fq: remainingFilters,
            }
            setQuery && setQuery(updateQuery)
        } else if (filtername === 'selectEntity') {
            if (option.id === 'None') {
                setQuery((prev) => {
                    return {
                        ...prev,
                        search: 'None',
                    }
                })
            } else {
                setQuery((prev) => {
                    return {
                        ...prev,
                        search: option.id,
                    }
                })
            }
        } else {
            let updateQuery: SearchInput

            if (['orgId', 'packageId', 'groupId'].includes(filtername)) {
                const action = query.fq?.action
                const timestamp = query.fq?.timestamp
                const prev: Record<string, string> = {}
                if (action) {
                    prev['action'] = action
                }
                if (timestamp) {
                    prev['timestamp'] = timestamp
                }

                updateQuery = {
                    page: { ...query?.page, start: 0 },
                    search: query.search,
                    fq: {
                        ...prev,
                        [filtername]: option.label === 'All' ? '' : option.id,
                    },
                }
            } else {
                updateQuery = {
                    page: { ...query?.page, start: 0 },
                    search: query.search,
                    fq: {
                        ...query.fq,
                        [filtername]: option.label === 'All' ? '' : option.id,
                    },
                }
            }

            setQuery && setQuery(updateQuery)
        }
    }

    return (
        <Listbox value={selected} onChange={handleSelect}>
            {({ open }) => (
                <>
                    <div className="relative w-32 sm:w-48 ">
                        <Listbox.Button className="relative w-full cursor-default rounded-sm bg-wri-gray py-2 pl-3 pr-8 text-left shadow-sm border-b-wri-gold border-b-2 focus:outline-none  sm:leading-6 text-black text-sm font-normal font-['Acumin Pro SemiCondensed']">
                            <span className="block truncate text-wri-black">
                                {selected.label}
                            </span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                <ChevronDownIcon
                                    className="h-4 w-4 text-stone-600"
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
                                        key={option.id}
                                        className={({ active }) =>
                                            classNames(
                                                active
                                                    ? 'bg-wri-green text-white'
                                                    : 'text-gray-900',
                                                'relative cursor-default select-none py-2 px-4'
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
    )
}
