import {
    flexRender,
    Table as TableType,
    Column,
    Header,
    Updater,
    VisibilityState,
} from '@tanstack/react-table'
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    FunnelIcon as FunnelIconSolid,
    MapPinIcon as MapPinIconSolid,
} from '@heroicons/react/24/solid'
import React, { Fragment, useEffect, useState } from 'react'
import {
    ArrowDownIcon,
    ArrowsUpDownIcon,
    ArrowUpIcon,
    TableCellsIcon,
    FunnelIcon as FunnelIconOutline,
    XCircleIcon,
    MapPinIcon as MapPinIconOutline,
} from '@heroicons/react/24/outline'
import { DefaultTooltip } from '../_shared/Tooltip'
import { match } from 'ts-pattern'
import { Menu, Popover, Transition } from '@headlessui/react'
import { DebouncedInput } from '../_shared/SimpleInput'
import {
    Controller,
    FormProvider,
    useFieldArray,
    useForm,
    useFormContext,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FilterFormType, FilterObjType, filterSchema } from './search.schema'
import { Button } from '../_shared/Button'
import SimpleSelect from '../_shared/SimpleSelect'
import { DataExplorerColumnFilter } from './DataExplorer'
import { DatePicker } from '../_shared/DatePicker'

type TableProps = {
    table: TableType<any>
    numOfRows: number
    isLoading: boolean
    columnFilters: DataExplorerColumnFilter[]
}

export function TopBar({
    table,
    numOfRows,
}: {
    table: TableType<any>
    numOfRows: number
}) {
    const pageIndex = table.getState().pagination.pageIndex
    const pageSize = table.getState().pagination.pageSize
    const numOfColumns = table.getAllColumns().length
    return (
        <>
            <span className="text-base font-regular leading-5 text-[#3E3E3E] flex items-center">
                <TableCellsIcon className="w-5 h-5 mr-2 text-blue-800" />
                {numOfColumns} columns, {numOfRows} rows
            </span>
            <div>
                <div className="flex items-center gap-x-3">
                    <ToggleColumns table={table} />
                    <span className="flex text-sm">
                        {pageIndex * pageSize + 1} -{' '}
                        {(pageIndex + 1) * pageSize} of {numOfRows}
                    </span>
                    <button
                        aria-label='left-icon'
                        className={`w-4 h-4 ${
                            !table.getCanPreviousPage()
                                ? 'opacity-25'
                                : 'opacity-100'
                        }`}
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeftIcon />
                    </button>
                    <button
                        aria-label='right-icon'
                        className={`w-4 h-4 ${
                            !table.getCanNextPage()
                                ? 'opacity-25'
                                : 'opacity-100'
                        }`}
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRightIcon />
                    </button>
                </div>
            </div>
        </>
    )
}

export function ToggleColumns({ table }: { table: TableType<any> }) {
    const [q, setQ] = useState('')

    const filteredItems =
        q === ''
            ? table.getAllLeafColumns()
            : table.getAllLeafColumns().filter((column) => {
                  return column.id.toLowerCase().includes(q.toLowerCase()) || typeof column.columnDef.header === 'string' && column.columnDef.header.toLowerCase().includes(q.toLowerCase())
              })
    return (
        <Popover as="div" className="relative inline-block text-left">
            <Popover.Button className=" p-4 flex items-center justify-center h-8 rounded-md bg-blue-100 hover:bg-blue-800 hover:text-white text-blue-800 text-xs ">
               
                    Show Columns
               
            </Popover.Button>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Popover.Panel className="absolute overflow-hidden max-h-[200px] overflow-y-auto right-0 z-10 mt-2 py-4 w-64 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 pb-2">
                        <div className="relative w-full rounded-md">
                            <input
                                className="shadow-wri-small block w-full rounded-md border-0 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-b-2 focus:border-blue-800 disabled:bg-gray-100 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm min-w-0"
                                onChange={(e) => setQ(e.target.value)}
                                value={q}
                            />
                            <div className="z-10 absolute inset-y-0 right-0 flex items-center pr-3">
                                <DefaultTooltip content="Clear input">
                                    <button
                                        onClick={() => setQ('')}
                                        className="w-4 h-4"
                                    >
                                        <XCircleIcon className="text-gray-400" />
                                    </button>
                                </DefaultTooltip>
                            </div>
                        </div>
                    </div>
                    {q === '' && (
                        <div className="relative flex items-start px-4">
                            <div className="flex h-6 items-center">
                                <input
                                    {...{
                                        type: 'checkbox',
                                        checked: table.getIsAllColumnsVisible(),
                                        onChange:
                                            table.getToggleAllColumnsVisibilityHandler(),
                                    }}
                                    name="toggle-all"
                                    className="h-4 w-4 rounded border-gray-300 text-blue-800 focus:ring-blue-800"
                                />
                            </div>
                            <div className="ml-3 text-sm leading-6">
                                <label
                                    htmlFor="toggle-all"
                                    className="font-medium text-gray-900"
                                >
                                    Toggle All
                                </label>
                            </div>
                        </div>
                    )}
                    {filteredItems.map((column) => (
                        <div
                            key={column.id}
                            className="relative flex items-start px-4"
                        >
                            <div className="flex h-6 items-center">
                                <input
                                    {...{
                                        type: 'checkbox',
                                        checked: column.getIsVisible(),
                                        onChange:
                                            column.getToggleVisibilityHandler(),
                                    }}
                                    name={column.id}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-800 focus:ring-blue-800"
                                />
                            </div>
                            <div className="ml-3 text-sm leading-6">
                                <label
                                    htmlFor={column.id}
                                    className="font-medium text-gray-900 truncate"
                                >
                                    {typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
                                </label>
                            </div>
                        </div>
                    ))}
                </Popover.Panel>
            </Transition>
        </Popover>
    )
}

export function Table({ table, isLoading }: TableProps) {
    const numOfColumns = table.getAllColumns().length
    return (
        <div className="max-w-full grow flex border-t border-gray-200">
            <table className="block border-r border-gray-200 shadow">
                <thead className="text-left bg-[#FBFBFB]">
                    {table.getLeftHeaderGroups().map((hg) => (
                        <tr key={hg.id}>
                            {hg.headers.map((h) => (
                                <th
                                    key={h.id}
                                    className="pl-12 min-w-[200px] py-8 text-base font-semibold"
                                >
                                    <Column h={h} />
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((r) => (
                        <tr key={r.id} className="border-b border-b-slate-200">
                            {r.getLeftVisibleCells().map((c) => (
                                <td key={c.id} className="py-2 pl-12">
                                    <div className="min-h-[65px] flex items-center text-base">
                                        {' '}
                                        {flexRender(
                                            c.column.columnDef.cell,
                                            c.getContext()
                                        )}
                                    </div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <table className="w-full block overflow-x-scroll ">
                <thead className="text-left bg-[#FBFBFB]">
                    {table.getCenterHeaderGroups().map((hg) => (
                        <tr key={hg.id}>
                            {hg.headers.map((h) => (
                                <th
                                    key={h.id}
                                    className="pl-12 min-w-[200px] py-8 text-base font-semibold"
                                >
                                    <Column h={h} />
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                {isLoading && (
                    <tbody>
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((r) => (
                            <tr key={r} className="border-b border-b-slate-200">
                                {Array.from(Array(numOfColumns).keys()).map(
                                    (c) => (
                                        <td key={c} className="py-2 pl-12">
                                            <div className="min-h-[65px] flex items-center text-base">
                                                <span className="w-24 h-4 animate-pulse rounded-md bg-blue-100" />
                                            </div>
                                        </td>
                                    )
                                )}
                            </tr>
                        ))}
                    </tbody>
                )}
                <tbody>
                    {table.getRowModel().rows.map((r) => (
                        <tr key={r.id} className="border-b border-b-slate-200">
                            {r.getCenterVisibleCells().map((c) => {
                                if (
                                    c.getValue() === '' ||
                                    c.getValue() === ' '
                                ) {
                                    return (
                                        <td key={c.id} className="py-2 pl-12">
                                            <div className="min-h-[65px] flex items-center text-base">
                                                {c.column.columnDef.meta
                                                    ?.default ?? ''}
                                            </div>
                                        </td>
                                    )
                                }
                                return (
                                    <td key={c.id} className="py-2 pl-12">
                                        <div className="min-h-[65px] flex items-center text-base">
                                            {flexRender(
                                                c.column.columnDef.cell,
                                                c.getContext()
                                            )}
                                        </div>
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function Column({ h }: { h: Header<any, unknown> }) {
    return (
        <div className="relative flex gap-x-2 items-center pr-4">
            {flexRender(h.column.columnDef.header, h.getContext())}
            {match(h.column.getIsSorted())
                .with(false, () => (
                    <DefaultTooltip content="Sort by this column">
                        <button
                            aria-label='sort'
                            onClick={() => h.column.toggleSorting(false, true)}
                        >
                            <ArrowsUpDownIcon className="w-4 h-4 opacity-75" />
                        </button>
                    </DefaultTooltip>
                ))
                .with('asc', () => (
                    <DefaultTooltip content="Sorting asc">
                        <button
                            aria-label='asc sorting'
                            onClick={() => h.column.toggleSorting(true, true)}
                        >
                            <ArrowUpIcon className="w-4 h-4" />
                        </button>
                    </DefaultTooltip>
                ))
                .with('desc', () => (
                    <DefaultTooltip content="Sorting desc">
                        <button aria-label='desc sorting' onClick={() => h.column.clearSorting()}>
                            <ArrowDownIcon className="w-4 h-4" />
                        </button>
                    </DefaultTooltip>
                ))
                .otherwise(() => (
                    <></>
                ))}
            <FilterColumn column={h.column} />
            {!h.isPlaceholder && h.column.getCanPin() && (
                <div className="flex gap-1 justify-center">
                    {h.column.getIsPinned() !== 'left' ? (
                        <DefaultTooltip content="Pin to left">
                            <button
                                aria-label="pin to left"
                                onClick={() => {
                                    h.column.pin('left')
                                }}
                            >
                                <MapPinIconOutline className="w-4 h-4" />
                            </button>
                        </DefaultTooltip>
                    ) : (
                        <DefaultTooltip content="Unpin">
                                <button
                                aria-label="unpin"
                                onClick={() => {
                                    h.column.pin(false)
                                }}
                            >
                                <MapPinIconSolid className="w-4 h-4" />
                            </button>
                        </DefaultTooltip>
                    )}
                </div>
            )}
        </div>
    )
}

function FilterColumn({ column }: { column: Column<any, unknown> }) {
    return (
        <Popover as={Fragment}>
            {({ open }) => (
                <>
                    <Popover.Button aria-label="filter">
                        <DefaultTooltip content="Filter" >
                            {open || column.getIsFiltered() ? (
                                <FunnelIconSolid className="w-4 h-4" />
                            ) : (
                                <FunnelIconOutline className="w-4 h-4" />
                            )}
                        </DefaultTooltip>
                    </Popover.Button>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Popover.Panel className="absolute top-0 left-0 z-10 mt-6 w-56 origin-bottom rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <FilterForm column={column} />
                        </Popover.Panel>
                    </Transition>
                </>
            )}
        </Popover>
    )
}

function FilterForm({ column }: { column: Column<any, unknown> }) {
    const defaultValues = column.getFilterValue()
    const formObj = useForm<FilterFormType>({
        resolver: zodResolver(filterSchema),
        defaultValues: {
            filters: (defaultValues as FilterObjType[]) ?? [
                {
                    operation:
                        column.columnDef.meta?.type === 'timestamp'
                            ? { label: 'Greater than', value: '>' }
                            : { label: 'Equals', value: '=' },
                    value: '',
                    link: null,
                },
            ],
        },
    })
    const { watch } = formObj
    useEffect(() => {
        const subscription = watch((value, { name, type }) => {
            column.setFilterValue(value.filters)
        })
        return () => subscription.unsubscribe()
    }, [watch])

    return (
        <FormProvider {...formObj}>
            <div className="flex flex-col gap-y-2 py-4 px-4">
                <div className="flex flex-col gap-y-2 justify-center items-center">
                    <Filters
                        datePicker={column.columnDef.meta?.type === 'timestamp'}
                    />
                </div>
            </div>
        </FormProvider>
    )
}

export default function Filters({
    datePicker = false,
}: {
    datePicker?: boolean
}) {
    const formObj = useFormContext<FilterFormType>()
    const { register, control, setValue, watch, getValues } = formObj
    const { append, fields, remove } = useFieldArray({
        control,
        name: 'filters',
    })
    const addFilter = (link: 'and' | 'or') => {
        setValue(`filters.${lastItem}.link`, link)
        append({
            operation: { label: 'Equals', value: '=' },
            value: '',
            link: null,
        })
    }
    const removeFilter = (index: number) => {
        remove(index)
        const lastItem = watch(`filters`).length - 1
        if (lastItem >= 0) {
            setValue(`filters.${lastItem}.link`, null)
        }
    }
    const lastItem = fields.length - 1

    return (
        <>
            {fields.map((field, index) => (
                <div
                    key={field.id}
                    className="flex flex-col items-center gap-y-2 w-full"
                >
                    <SimpleSelect
                        formObj={formObj}
                        name={`filters.${index}.operation`}
                        options={[
                            {
                                label: 'Equals',
                                value: '=',
                            },
                            {
                                label: 'Not equal',
                                value: '!=',
                            },
                            {
                                label: 'Greater than',
                                value: '>',
                            },
                            {
                                label: 'Greater or equal than',
                                value: '>=',
                            },
                            {
                                label: 'Smaller than',
                                value: '<',
                            },
                            {
                                label: 'Smaller or equal than',
                                value: '<=',
                            },
                        ].filter((o) => {
                            if (!datePicker) return true
                            return (
                                datePicker &&
                                o.value !== '=' &&
                                o.value !== '!='
                            )
                        })}
                        placeholder="Select a filter"
                    />
                    <Controller
                        control={control}
                        name={`filters.${index}.value`}
                        render={({
                            field: { onChange, onBlur, value, ref },
                        }) =>
                            datePicker ? (
                                <DatePicker date={value} setDate={onChange} />
                            ) : (
                                <DebouncedInput
                                    onChange={onChange} // send value to hook form
                                    onBlur={onBlur} // notify when input is touched/blur
                                    value={value}
                                    icon={
                                        fields.length > 1 && (
                                            <DefaultTooltip content="Remove filter">
                                                <button
                                                    onClick={() =>
                                                        removeFilter(index)
                                                    }
                                                    className="w-4 h-4"
                                                >
                                                    <XCircleIcon className="text-red-600" />
                                                </button>
                                            </DefaultTooltip>
                                        )
                                    }
                                />
                            )
                        }
                    />
                    {field.link && (
                        <span className="text-xs text-gray-500 uppercase">
                            {field.link}
                        </span>
                    )}
                </div>
            ))}
            <div className="grid grid-cols-2 w-full gap-x-2">
                <Button
                    type="button"
                    onClick={() => addFilter('and')}
                    className="flex items-center w-full justify-center h-8 rounded-md bg-blue-100 hover:bg-blue-800 hover:text-white text-blue-800 text-xs "
                >
                    AND
                </Button>
                <Button
                    type="button"
                    onClick={() => addFilter('or')}
                    className="flex items-center w-full justify-center h-8 rounded-md bg-blue-100 hover:bg-blue-800 hover:text-white text-blue-800 text-xs "
                >
                    OR
                </Button>
            </div>
        </>
    )
}

export function ListOfFilters({
    filters,
    setFilters,
}: {
    filters: DataExplorerColumnFilter[]
    setFilters: (filters: DataExplorerColumnFilter[]) => void
}) {
    function removeFilter(index: number) {
        if (index >= 0 && index < filters.length) {
            const newFilters = filters
                .slice(0, index)
                .concat(filters.slice(index + 1))
            setFilters(newFilters)
        }
    }

    return (
        <>
            <div className="flex flex-wrap gap-2">
                {filters.map((f, i) => (
                    <div
                        key={f.id}
                        className="flex h-8 w-fit items-center gap-x-2 rounded-sm bg-neutral-100 hover:bg-neutral-200 transition px-3 py-1 shadow"
                    >
                        <div className="font-['Acumin Pro SemiCondensed'] text-xs font-semibold leading-none text-black">
                            {f.id}
                        </div>
                        <DefaultTooltip content="Remove filter">
                            <button onClick={() => removeFilter(i)}>
                                <XCircleIcon className="h-4 w-4 text-red-600 cursor-pointer" />
                            </button>
                        </DefaultTooltip>
                    </div>
                ))}
            </div>
            {filters.length ? (
                <button
                    onClick={() => setFilters([])}
                    className="font-['Acumin Pro SemiCondensed'] text-sm font-normal text-black underline"
                >
                    Clear all filters
                </button>
            ) : null}
        </>
    )
}
