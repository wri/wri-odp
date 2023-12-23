import {
    ColumnFilter,
    Updater,
    flexRender,
    Table as TableType,
    Column,
} from '@tanstack/react-table'

import {
    ChevronLeftIcon,
    ChevronRightIcon,
    FunnelIcon as FunnelIconSolid,
} from '@heroicons/react/24/solid'

import React, { Fragment, useEffect, useMemo, useState } from 'react'
import {
    ArrowDownIcon,
    ArrowsUpDownIcon,
    ArrowUpIcon,
    TableCellsIcon,
    FunnelIcon as FunnelIconOutline,
} from '@heroicons/react/24/outline'
import { DefaultTooltip } from '../_shared/Tooltip'
import { match } from 'ts-pattern'
import { Popover, Transition } from '@headlessui/react'
import { DebouncedInput } from '../_shared/SimpleInput'
import { Filter } from './DataExplorer'

type TableProps = {
    table: TableType<any>
    numOfRows: number
    isLoading: boolean
}

export function Table({ table, numOfRows, isLoading }: TableProps) {
    const pageIndex = table.getState().pagination.pageIndex
    const pageSize = table.getState().pagination.pageSize
    const numOfColumns = table.getAllColumns().length
    return (
        <div className={`w-full relative grow flex flex-col`}>
            <div className="flex justify-between mx-6 my-4">
                <span className="text-base font-regular leading-5 text-[#3E3E3E] flex items-center">
                    <TableCellsIcon className="w-5 h-5 mr-2 text-blue-800" />
                    {numOfColumns} columns, {numOfRows} rows
                </span>
                <div className="flex items-center gap-x-3">
                    <span className="flex text-sm">
                        {pageIndex * pageSize + 1} -{' '}
                        {(pageIndex + 1) * pageSize} of {numOfRows}
                    </span>
                    <button
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
            <div className="overflow-x-scroll max-w-full mt-2 grow">
                <table className="w-full block">
                    <thead className="text-left bg-[#FBFBFB]">
                        {table.getHeaderGroups().map((hg) => (
                            <tr key={hg.id}>
                                {hg.headers.map((h) => (
                                    <th
                                        key={h.id}
                                        className="pl-12 min-w-[200px] py-8 text-base font-semibold"
                                    >
                                        <div className="relative flex gap-x-2 items-center">
                                            {flexRender(
                                                h.column.columnDef.header,
                                                h.getContext()
                                            )}
                                            {match(h.column.getIsSorted())
                                                .with(false, () => (
                                                    <DefaultTooltip content="Sort by this column">
                                                        <button
                                                            onClick={() =>
                                                                h.column.toggleSorting(
                                                                    false,
                                                                    true
                                                                )
                                                            }
                                                        >
                                                            <ArrowsUpDownIcon className="w-4 h-4 opacity-75" />
                                                        </button>
                                                    </DefaultTooltip>
                                                ))
                                                .with('asc', () => (
                                                    <DefaultTooltip content="Sorting asc">
                                                        <button
                                                            onClick={() =>
                                                                h.column.toggleSorting(
                                                                    true,
                                                                    true
                                                                )
                                                            }
                                                        >
                                                            <ArrowUpIcon className="w-4 h-4" />
                                                        </button>
                                                    </DefaultTooltip>
                                                ))
                                                .with('desc', () => (
                                                    <DefaultTooltip content="Sorting desc">
                                                        <button
                                                            onClick={() =>
                                                                h.column.clearSorting()
                                                            }
                                                        >
                                                            <ArrowDownIcon className="w-4 h-4" />
                                                        </button>
                                                    </DefaultTooltip>
                                                ))
                                                .otherwise(() => (
                                                    <></>
                                                ))}
                                            <FilterColumn column={h.column} />
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    {isLoading && (
                        <tbody>
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((r) => (
                                <tr
                                    key={r}
                                    className="border-b border-b-slate-200"
                                >
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
                            <tr
                                key={r.id}
                                className="border-b border-b-slate-200"
                            >
                                {r.getVisibleCells().map((c) => (
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
            </div>
        </div>
    )
}

function FilterColumn({ column }: { column: Column<any, unknown> }) {
    return (
        <Popover as={Fragment}>
            {({ open }) => (
                <>
                    <Popover.Button>
                        {open || column.getIsFiltered() ? (
                            <FunnelIconSolid className="w-4 h-4" />
                        ) : (
                            <FunnelIconOutline className="w-4 h-4" />
                        )}
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
    const columnFilterValue = (column.getFilterValue() as Filter) || {
        operation: '=',
        value: '',
    }
    return (
        <div className="flex flex-col gap-y-2 px-2 py-4">
            <div className="flex flex-col gap-y-2">
                <select
                    value={
                        columnFilterValue
                            ? columnFilterValue.operation ?? ''
                            : ''
                    }
                    onChange={(event) =>
                        column.setFilterValue({
                            operation: event.target.value,
                            value: columnFilterValue.value,
                        })
                    }
                    className="block w-full rounded-md border-0 py-2 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-b-2 focus:border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-xs"
                >
                    <option value="=">Equals</option>
                    <option value="!=">Different</option>
                    <option value=">">Greater than</option>
                    <option value="<">Smaller than</option>
                    <option value="contains">Contains</option>
                </select>
                <DebouncedInput
                    className="sm:text-xs sm:py-2 sm:px-2"
                    value={
                        columnFilterValue ? columnFilterValue.value ?? '' : ''
                    }
                    onChange={(value) => {
                        column.setFilterValue({
                            operation: columnFilterValue.operation,
                            value,
                        })
                    }}
                    type="text"
                    placeholder="Enter value"
                />
            </div>
        </div>
    )
}
