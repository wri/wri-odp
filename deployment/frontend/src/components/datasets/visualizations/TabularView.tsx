import {
    createColumnHelper,
    FilterFn,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'

import {
    ArrowDownIcon,
    ArrowUpIcon,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/solid'

import React, { useEffect, useMemo, useState } from 'react'
import IconButton from '@/components/_shared/map/controls/IconButton'
import { SettingsIcon } from '@/components/_shared/icons/SettingsIcon'
import { DownloadIcon } from '@/components/_shared/icons/DownloadIcon'
import { SearchIcon } from '@/components/_shared/icons/SearchIcon'
import { AdvancedFilteringIcon } from '@/components/_shared/icons/AdvancedFilteringIcon'
import { ColFilterIcon } from '@/components/_shared/icons/ColFilterIcon'

type TableProps = {
    data?: Array<{ [key: string]: number | string }>
    cols?: Array<{ [key: string]: string }>
    csv?: string
    url?: string
    fullWidth?: boolean
}

export default ({
    data: ogData = [],
    cols: ogCols = [],
    csv = '',
    url = '',
    fullWidth = false,
}: TableProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(false)

    ogCols = [
        { key: 'id', name: 'ID' },
        { key: 'name', name: 'Name' },
        { key: 'title', name: 'Title' },
        { key: 'value', name: 'Value' },
        { key: 'value2', name: 'Value 2' },
        { key: 'value3', name: 'Value 3' },
        { key: 'value4', name: 'Value 4' },
    ]

    ogData = [...new Array(50).keys()].map((i) => ({
        id: i,
        name: `row-${i}`,
        title: `Row ${i}`,
        value: `Value ${i}`,
        value2: `Value ${i}`,
        value3: `Value ${i}`,
        value4: `Another value - ${i}`,
    }))

    const [data, setData] = React.useState(ogData)
    const [cols, setCols] = React.useState(ogCols)

    const tableCols = useMemo(() => {
        const columnHelper = createColumnHelper()
        return cols.map((c) =>
            columnHelper.accessor<any, string>(c.key, {
                header: () => c.name,
                cell: (info) => info.getValue(),
            })
        )
    }, [data, cols])

    const [globalFilter, setGlobalFilter] = useState('')

    const table = useReactTable({
        data,
        columns: tableCols,
        getCoreRowModel: getCoreRowModel(),
        state: {
            globalFilter,
        },
        globalFilterFn: globalFilterFn,
        onGlobalFilterChange: setGlobalFilter,
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    const pageIndex = table.getState().pagination.pageIndex
    const pageSize = table.getState().pagination.pageSize

    return isLoading ? (
        <div className="w-full h-full min-h-[500px] flex items-center justify-center">
            Loading...
        </div>
    ) : (
        <div className={`w-full relative`}>
            <div className="flex justify-between mx-5 lg:mx-20 mt-6">
                <span className="text-base font-regular leading-5 text-[#3E3E3E] flex items-center">
                    <svg
                        className="mr-2"
                        width="15"
                        height="11"
                        viewBox="0 0 15 11"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M1.94379 10.5H13.4438M1.94379 10.5C1.74487 10.5 1.55411 10.421 1.41346 10.2803C1.2728 10.1397 1.19379 9.94891 1.19379 9.75M1.94379 10.5H6.94379C7.35779 10.5 7.69379 10.164 7.69379 9.75M13.4438 10.5C13.8578 10.5 14.1938 10.164 14.1938 9.75M13.4438 10.5H8.44379C8.24487 10.5 8.05411 10.421 7.91346 10.2803C7.7728 10.1397 7.69379 9.94891 7.69379 9.75M1.19379 9.75V1.25M1.19379 9.75V8.75C1.19379 8.336 1.52979 8 1.94379 8M7.69379 9.75V8.75M1.19379 1.25C1.19379 0.836 1.52979 0.5 1.94379 0.5H13.4438C13.8578 0.5 14.1938 0.836 14.1938 1.25M1.19379 1.25V2.25C1.19379 2.664 1.52979 3 1.94379 3M1.94379 8C1.52979 8 1.19379 7.664 1.19379 7.25V6.25C1.19379 5.836 1.52979 5.5 1.94379 5.5M1.94379 8H6.94379M14.1938 9.75V1.25M14.1938 9.75V8.75C14.1938 8.336 13.8578 8 13.4438 8M14.1938 1.25V2.25C14.1938 2.664 13.8578 3 13.4438 3M13.4438 8C13.8578 8 14.1938 7.664 14.1938 7.25V6.25C14.1938 5.836 13.8578 5.5 13.4438 5.5M13.4438 8H8.44379M13.4438 3H1.94379M13.4438 3H8.44379C8.02979 3 7.69379 3.336 7.69379 3.75M13.4438 3C13.8578 3 14.1938 3.336 14.1938 3.75V4.75C14.1938 5.164 13.8578 5.5 13.4438 5.5M1.94379 3H6.94379C7.35779 3 7.69379 3.336 7.69379 3.75M1.94379 3C1.52979 3 1.19379 3.336 1.19379 3.75V4.75C1.19379 5.164 1.52979 5.5 1.94379 5.5M7.69379 3.75V4.75M1.94379 5.5H6.94379M13.4438 5.5H8.44379M6.94379 5.5C7.35779 5.5 7.69379 5.164 7.69379 4.75M6.94379 5.5C7.35779 5.5 7.69379 5.836 7.69379 6.25M7.69379 4.75C7.69379 5.164 8.02979 5.5 8.44379 5.5M8.44379 5.5C8.02979 5.5 7.69379 5.836 7.69379 6.25M7.69379 6.25V7.25M6.94379 8C7.35779 8 7.69379 7.664 7.69379 7.25M6.94379 8C7.35779 8 7.69379 8.336 7.69379 8.75M7.69379 7.25C7.69379 7.664 8.02979 8 8.44379 8M8.44379 8C8.02979 8 7.69379 8.336 7.69379 8.75"
                            stroke="#3654A5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    {ogCols.length} columns, {ogData.length} rows
                </span>
                <div className="flex items-center gap-x-3">
                    <span className="flex text-sm">
                        {pageIndex * pageSize + 1} -{' '}
                        {(pageIndex + 1) * pageSize} of{' '}
                        {table.getFilteredRowModel().rows.length}
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
            <div className="absolute right-6 top-0 flex flex-col gap-y-1.5">
                <IconButton>
                    <SettingsIcon />
                </IconButton>
                <IconButton>
                    <DownloadIcon />
                </IconButton>
                <IconButton>
                    <SearchIcon />
                </IconButton>
                <IconButton>
                    <AdvancedFilteringIcon />
                </IconButton>
            </div>
            <div className="overflow-x-scroll max-w-full mt-2">
                <table className="w-full block">
                    <thead className="text-left bg-[#FBFBFB]">
                        {table.getHeaderGroups().map((hg) => (
                            <tr key={hg.id}>
                                {hg.headers.map((h) => (
                                    <th
                                        key={h.id}
                                        className="pl-12 min-w-[200px] py-8 text-base font-semibold"
                                    >
                                        <div className='flex items-center'>
                                            {flexRender(
                                                h.column.columnDef.header,
                                                h.getContext()
                                            )}
                                            <button className='ml-4'>
                                                <ColFilterIcon />
                                            </button>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
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

const globalFilterFn: FilterFn<any> = (row, columnId, filterValue: string) => {
    const search = filterValue.toLowerCase()

    let value = row.getValue(columnId) as string
    if (typeof value === 'number') value = String(value)

    return value?.toLowerCase().includes(search)
}
