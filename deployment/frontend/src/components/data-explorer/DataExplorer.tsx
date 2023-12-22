import { useMemo, useState } from 'react'
import { ListOfFilters, Pagination, Table } from './Table'
import {
    ColumnFilter,
    ColumnFiltersState,
    ColumnSort,
    getCoreRowModel,
    PaginationState,
    Updater,
    useReactTable,
} from '@tanstack/react-table'
import { useFields, useNumberOfRows, useTableData } from './queryHooks'
import Spinner from '../_shared/Spinner'
import { TabularResource } from '../datasets/visualizations/Visualizations'
import { FilterObjType } from './search.schema'

interface DataExplorerProps {
    tabularResource: TabularResource
}

export interface Filter {
    operation: '=' | '!=' | '>' | '<' | 'contains'
    value: string
}

export function DataExplorer({ tabularResource }: DataExplorerProps) {
    const { data: tableData } = useFields(tabularResource)
    if (!tableData)
        return (
            <div className="bg-lima-700 my-auto flex w-full flex-col items-center justify-center overflow-hidden opacity-75 h-full">
                <Spinner className="text-wri-green w-12 h-12" />
                <h2 className="text-center text-xl font-semibold text-wri-green">
                    Loading...
                </h2>
            </div>
        )
    return (
        <DataExplorerInner
            tableName={tableData.tableName}
            columns={tableData.columns}
            tabularResource={tabularResource}
        />
    )
}

export interface DataExplorerInnerProps {
    tableName: string
    tabularResource: TabularResource
    columns: { key: string; name: string }[]
}

export interface DataExplorerColumnFilter {
    id: string
    value: FilterObjType[]
}

function DataExplorerInner({
    tableName,
    columns,
    tabularResource,
}: DataExplorerInnerProps) {
    const { id: datasetId, provider } = tabularResource
    const cols = useMemo(() => columns ?? [], [columns])
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })
    const [sorting, setSorting] = useState<ColumnSort[]>([])
    const [columnFilters, setColumnFilters] = useState<
        DataExplorerColumnFilter[]
    >([])
    const [columnPinning, setColumnPinning] = useState({})
    const filteredColumns = columnFilters
        .map((filter) => ({
            ...filter,
            value: filter.value.filter((v) => v.value !== ''),
        }))
        .filter((filter) => filter.value.length > 0)
    const [pageCount, setPageCount] = useState<number>(0)

    const { data: numOfRows } = useNumberOfRows({
        tableName,
        datasetId,
        provider,
        filters: filteredColumns,
        setPageCount,
    })

    const {
        data: tableData,
        isLoading,
        isPreviousData,
        isFetching,
    } = useTableData({
        tableName,
        provider,
        pagination,
        sorting,
        datasetId,
        columns: columns.map((c) => c.key),
        filters: filteredColumns,
    })

    const _prefetchData = useTableData({
        tableName,
        pagination: {
            pageIndex: pagination.pageIndex + 1,
            pageSize: pagination.pageSize,
        },
        sorting,
        provider,
        datasetId,
        filters: filteredColumns,
        columns: columns.map((c) => c.key),
        enabled: !isLoading,
    })

    const data = useMemo(() => tableData ?? [], [tableData])
    const tableCols = useMemo(() => {
        return cols.map((c) => ({
            accessorKey: c.key,
            filterFn: () => {
                // not sure why this needs to be added
                return true
            },
        }))
    }, [cols])

    const table = useReactTable({
        data,
        columns: tableCols,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        onPaginationChange: setPagination,
        manualSorting: true,
        onSortingChange: setSorting,
        manualFiltering: true,
        onColumnFiltersChange: setColumnFilters as (
            filters: Updater<ColumnFiltersState>
        ) => void,
        pageCount,
        onColumnPinningChange: setColumnPinning,

        state: {
            pagination,
            sorting,
            columnPinning,
            columnFilters: filteredColumns,
        },
    })
    return (
        <div className={`w-full relative grow flex flex-col gap-y-2 mt-6`}>
            <div className="flex flex-row justify-between items-center px-6">
                <Pagination table={table} numOfRows={numOfRows} />
            </div>
            <div className="flex flex-row justify-between px-6">
                <ListOfFilters
                    filters={filteredColumns}
                    setFilters={setColumnFilters}
                />
            </div>
            <div className="flex flex-col grow">
                {isFetching && isPreviousData && (
                    <span className="w-full h-1.5 animate-pulse-fast bg-blue-400" />
                )}
                <Table
                    table={table}
                    numOfRows={numOfRows ?? 0}
                    isLoading={isLoading}
                    columnFilters={columnFilters}
                />
            </div>
        </div>
    )
}
