import { Fragment, useState } from 'react'
import { Combobox, Listbox, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import classNames from '@/utils/classnames'

interface Option {
    value: string
    label: string
    default?: boolean
}

interface TagProps {
    tags: string[]
}

export default function TagsSelect({ tags }: TagProps) {
    const [selected, setSelected] = useState<string[]>([])
    const [query, setQuery] = useState('')

    console.log(selected)

    const filteredTags =
        query === ''
            ? tags
            : tags.filter((item) => {
                  return item.toLowerCase().includes(query.toLowerCase())
              })
    return (
        <Combobox value={selected} onChange={(e) => setSelected(e)} multiple>
            <Combobox.Input
                onChange={(event) => setQuery(event.target.value)}
                className="shadow-wri-small block w-full rounded-md border-0 px-5 py-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-b-2 focus:border-blue-800 disabled:bg-gray-100 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6"
            />
            <Combobox.Options className="mt-1 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {query.length > 0 && (
                    <Combobox.Option value={query}>
                        Create "{query}"
                    </Combobox.Option>
                )}
                {filteredTags.map((tag: string) => (
                    <Combobox.Option
                        key={tag}
                        className={({ active }) =>
                            classNames(
                                active
                                    ? 'bg-blue-800 text-white'
                                    : 'text-gray-900',
                                'relative cursor-default select-none py-2 pl-3 pr-9'
                            )
                        }
                        value={tag}
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
                                    {tag}
                                </span>
                            </>
                        )}
                    </Combobox.Option>
                ))}
            </Combobox.Options>
        </Combobox>
    )
}
