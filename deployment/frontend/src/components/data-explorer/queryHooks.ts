import { api } from '@/utils/api'
import {
    ColumnSort,
    PaginationState,
    ColumnFilter,
    Updater,
} from '@tanstack/react-table'
import { useQuery } from 'react-query'

export interface FieldsResponse {
    tableName: string
    fields: Record<string, any>
}

export function useFields(datasetId: string) {
    const hiddenFields = ['the_geom', 'the_geom_webmercator']
    return useQuery(['fields', datasetId], async () => {
        const fieldsRes = await fetch(
            `https://api.resourcewatch.org/v1/fields/${datasetId}`
        )
        const fields: FieldsResponse = await fieldsRes.json()
        return {
            tableName: fields.tableName,
            columns: Object.keys(fields.fields)
                .filter((field) => !hiddenFields.includes(field))
                .map((field) => ({
                    key: field,
                    name: field,
                })),
        }
    })
}

export function useNumberOfRows({
    tableName,
    datasetId,
    filters,
    setPageCount,
}: {
    tableName: string
    datasetId: string
    filters: ColumnFilter[]
    setPageCount: (updater: Updater<number>) => void
}) {
    return api.rw.getNumberOfRows.useQuery(
        {
            datasetId,
            tableName: tableName ?? '',
            filters: filters as {
                id: string
                value: { operation: string; value: string }
            }[],
        },
        {
            keepPreviousData: true,
            onSuccess: (data) => {
                setPageCount(data ? Math.ceil(data / 10) : 0)
            }
        }
    )
}

export function useTableData({
    pagination,
    tableName,
    datasetId,
    columns,
    sorting,
    enabled = true,
    filters,
}: {
    pagination: PaginationState
    sorting: ColumnSort[]
    tableName: string
    datasetId: string
    columns: string[]
    enabled?: boolean
    filters: ColumnFilter[]
}) {
    return api.rw.getData.useQuery(
        {
            datasetId,
            tableName: tableName ?? '',
            pagination,
            columns,
            provider: 'cartodb',
            sorting,
            filters: filters as {
                id: string
                value: { operation: string; value: string }
            }[],
        },
        {
            enabled: !!datasetId && !!tableName && enabled,
            keepPreviousData: true,
        }
    )
}
