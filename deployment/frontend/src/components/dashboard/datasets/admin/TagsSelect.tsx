import { Fragment, useRef, useState } from 'react'
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
import { Controller, UseFormReturn } from 'react-hook-form'

interface TagProps {
    tags: string[]
    formObj: UseFormReturn<DatasetFormType>
}

export default function TagsSelect({ tags, formObj }: TagProps) {
    const { control } = formObj
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLButtonElement>(null)
    const [selected, setSelected] = useState<string[]>([])
    const [query, setQuery] = useState('')

    const filteredTags =
        query === ''
            ? tags
            : tags.filter((item) => {
                  return item.toLowerCase().includes(query.toLowerCase())
              })

    return (
        <Controller
            control={control}
            name="tags"
            defaultValue={[]}
            render={({ field: { onChange, value } }) => (
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            ref={ref}
                            aria-expanded={open}
                            className="relative flex min-h-[7rem] h-auto w-full flex-row items-start justify-between rounded-md border-0 px-5 py-3 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 hover:bg-white focus:border-b-2 focus:border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6"
                        >
                            <div className="flex w-full items-start justify-between">
                                {value.length === 0 ? (
                                    <span className="font-acumin text-base font-light text-zinc-400">
                                        Tags
                                    </span>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {value.map((item, index) => (
                                            <span
                                                key={index}
                                                className="flex items-center gap-x-2 rounded-[3px] border border-blue-800 hover:bg-neutral-50 transition bg-white px-2 py-0.5"
                                            >
                                                <span className="font-['Acumin Pro SemiCondensed'] text-[15px] font-normal text-zinc-800">
                                                    {item}
                                                </span>
                                                <DefaultTooltip content="Remove tag">
                                                    <XMarkIcon
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            onChange(
                                                                value.filter(
                                                                    (tag) =>
                                                                        tag !==
                                                                        item
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
                                Tags
                            </span>
                            <div className="relative isolate">
                                <Combobox.Input
                                    onChange={(event) =>
                                        setQuery(event.target.value)
                                    }
                                    className="shadow-wri-small block w-full rounded-md border-0 px-5 py-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-b-2 focus:border-blue-800 disabled:bg-gray-100 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6"
                                />
                            </div>
                            <Combobox.Options
                                static
                                className="overflow-auto rounded-md bg-white py-1 text-base focus:outline-none sm:text-sm"
                            >
                                {query.length > 0 && (
                                    <Combobox.Option
                                        value={query}
                                        className={({ active }) =>
                                            classNames(
                                                active
                                                    ? 'bg-blue-800 text-white'
                                                    : 'text-gray-900',
                                                'relative cursor-default select-none py-2 pl-3 pr-9'
                                            )
                                        }
                                    >
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
                                                'relative group cursor-default select-none py-2 pl-3 pr-9'
                                            )
                                        }
                                        value={tag}
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
                                                    {tag}
                                                </span>
                                            </>
                                        )}
                                    </Combobox.Option>
                                ))}
                            </Combobox.Options>
                        </Combobox>
                    </PopoverContent>
                </Popover>
            )}
        />
    )
}
