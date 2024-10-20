import { Fragment, useRef, useState, Dispatch, SetStateAction } from 'react'
import { Combobox, Listbox, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import classNames from '@/utils/classnames'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/_shared/Popover'
import { Button } from '@/components/_shared/Button'
import { DefaultTooltip } from '@/components/_shared/Tooltip'
import { DatasetFormType } from '@/schema/dataset.schema'
import { Controller, Path, UseFormReturn } from 'react-hook-form'
import { Filter } from '@/interfaces/search.interface'
import { set } from 'lodash'

interface Option {
    value: string
    label: string
}

interface MulTextProps {
    options?: Option[]
    name: Path<DatasetFormType>
    title: string
    tooltip?: string
    facetSelectedCount: Record<string, number>
    setFacetSelectedCount: Dispatch<SetStateAction<Record<string, number>>>
    setFilters: Dispatch<SetStateAction<Filter[]>>
    filters: Filter[]
    value: string[]
    setValue: Dispatch<SetStateAction<string[]>>
}

function defaultSelectedOptions(
    options: Option[],
    filters: Filter[]
): string[] {
    // return array of string from .label
    const f = filters
        .filter((f) => f.key === 'tags')
        .map((f) => options.find((o) => o.value === f.value)?.label)

    return f as string[]
}

export default function TagMulText({
    options = [],
    name,
    title,
    tooltip = 'Remove item',
    facetSelectedCount,
    setFacetSelectedCount,
    setFilters,
    filters,
    value,
    setValue,
}: MulTextProps) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLButtonElement>(null)
    const [selected, setSelected] = useState<string[]>([])
    // const [value, setValue] = useState<string[]>(
    //     defaultSelectedOptions(options, filters) || []
    // )
    const [query, setQuery] = useState('')

    const filteredOptions =
        query === ''
            ? options
            : options.filter((item) => {
                  return item.label.toLowerCase().includes(query.toLowerCase())
              })

    const onChange = (event: string[]) => {
        setValue((prev) => [...event])
        setFacetSelectedCount((prev) => {
            const newFacetSelectedCount = { ...prev }
            newFacetSelectedCount[name] = event.length
            return newFacetSelectedCount
        })
        setFilters((prev) => {
            const newFilters = prev.filter((f) => f.key !== 'tags')
            event.forEach((e) => {
                let value = options.find((o) => o.label === e)?.value
                value = value!
                newFilters.push({
                    key: 'tags',
                    title: 'Tags',
                    value: value,
                    label: e,
                })
            })
            return newFilters
        })
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    aria-label="Open dropdown"
                    variant="outline"
                    role="combobox"
                    ref={ref}
                    className="relative flex min-h-[7rem] h-auto w-full flex-row items-start justify-between rounded-md border-0 px-5 py-3 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 hover:bg-white focus:border-b-2 focus:border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6"
                >
                    <div className="flex w-full items-start justify-between">
                        {value.length === 0 ? (
                            <span className="font-acumin text-base font-light text-zinc-500">
                                Click and search for Tags
                            </span>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {value.map((item: string, index: number) => (
                                    <span
                                        key={index}
                                        className="flex items-center gap-x-2 rounded-[3px] border border-blue-800 hover:bg-neutral-50 transition bg-white px-2 py-0.5"
                                    >
                                        <span className="font-['Acumin Pro SemiCondensed'] text-[15px] font-normal text-zinc-800">
                                            {item}
                                        </span>
                                        <DefaultTooltip content={tooltip}>
                                            <XMarkIcon
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onChange(
                                                        value.filter(
                                                            (option: string) =>
                                                                option !== item
                                                        )
                                                    )
                                                }}
                                                className="mt-0.5 h-3 w-3 cursor-pointer text-red-600"
                                            />
                                        </DefaultTooltip>
                                    </span>
                                ))}
                            </div>
                        )}
                        <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                style={{ width: ref.current?.offsetWidth ?? 'auto' }}
                className="w-full md:w-[28rem] lg:w-[20rem] xl:w-[28rem] bg-white p-0"
            >
                <Combobox
                    as="div"
                    className="shadow-lg p-2"
                    value={value}
                    onChange={(e) => onChange(e)}
                    multiple
                >
                    <span className="font-acumin text-base font-semibold text-black">
                        {title}
                    </span>
                    <div className="relative isolate">
                        <Combobox.Input
                            id={`${name}SearchInput`}
                            onChange={(event) => setQuery(event.target.value)}
                            className="shadow-wri-small block w-full rounded-md border-0 px-5 py-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-b-2 focus:border-blue-800 disabled:bg-gray-100 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6"
                        />
                    </div>
                    <Combobox.Options
                        static
                        className="overflow-auto rounded-md bg-white py-1 text-base focus:outline-none sm:text-sm"
                    >
                        {filteredOptions.map((option: Option) => (
                            <Combobox.Option
                                key={option.label}
                                className={({ active }) =>
                                    classNames(
                                        active
                                            ? 'bg-blue-800 text-white'
                                            : 'text-gray-900',
                                        'relative group cursor-default select-none py-2 pl-3 pr-9'
                                    )
                                }
                                value={option.value}
                            >
                                {({ selected }) => (
                                    <>
                                        <span className="truncate flex items-center group-hover:text-white">
                                            <CheckIcon
                                                className={classNames(
                                                    'mr-2 h-4 w-4 text-blue-800 group-hover:text-white',
                                                    selected
                                                        ? 'opacity-100'
                                                        : 'opacity-0'
                                                )}
                                            />
                                            {option.label}
                                        </span>
                                    </>
                                )}
                            </Combobox.Option>
                        ))}
                    </Combobox.Options>
                </Combobox>
            </PopoverContent>
        </Popover>
    )
}
