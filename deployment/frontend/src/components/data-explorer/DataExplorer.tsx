import { useMemo, useState } from 'react'
import { Table } from './Table'
import {
    ColumnFilter,
    ColumnSort,
    getCoreRowModel,
    PaginationState,
    useReactTable,
} from '@tanstack/react-table'
import { useFields, useNumberOfRows, useTableData } from './queryHooks'
import Spinner from '../_shared/Spinner'
import { TabularResource } from '../datasets/visualizations/Visualizations'

interface DataExplorerProps {
    tabularResource: TabularResource
}

export interface Filter {
    operation: '=' | '!=' | '>' | '<' | 'contains'
    value: string
}

export function DataExplorer({ tabularResource }: DataExplorerProps) {
    const { data: tableData } = useFields(tabularResource)
    if (!tableData) return (
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
    const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([])
    const [pageCount, setPageCount] = useState<number>(0)

    const { data: numOfRows } = useNumberOfRows({
        tableName,
        datasetId,
        provider,
        filters: columnFilters,
        setPageCount,
    })

    const { data: tableData, isLoading } = useTableData({
        tableName,
        provider,
        pagination,
        sorting,
        datasetId,
        columns: columns.map((c) => c.key),
        filters: columnFilters,
    })
    console.log(tableData)

    const _prefetchData = useTableData({
        tableName,
        pagination: {
            pageIndex: pagination.pageIndex + 1,
            pageSize: pagination.pageSize,
        },
        sorting,
        provider,
        datasetId,
        filters: columnFilters,
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
        onColumnFiltersChange: setColumnFilters,
        pageCount,
        state: {
            pagination,
            sorting,
            columnFilters: (
                columnFilters as { id: string; value: Filter }[]
            ).filter((f) => f.value.value !== ''),
        },
    })
    return <Table table={table} numOfRows={numOfRows ?? 0} isLoading={isLoading} />
}
