import { api } from '@/utils/api'
import {
    ColumnSort,
    PaginationState,
    ColumnFilter,
    Updater,
} from '@tanstack/react-table'
import { useQuery } from 'react-query'
import { TabularResource } from '../datasets/visualizations/Visualizations'
import { env } from '@/env.mjs'
import { CkanResponse } from '@/schema/ckan.schema'
import { FilterObjType } from './search.schema'
import { DataExplorerColumnFilter } from './DataExplorer'

export interface FieldsResponse {
    tableName: string
    fields: Record<string, any>
}

export function useFields({ id, provider }: TabularResource) {
    if (provider === 'datastore') {
        return useQuery(['fields', id], async () => {
            const fieldsRes = await fetch(
                `${env.NEXT_PUBLIC_CKAN_URL}/api/3/action/datastore_info`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id,
                    }),
                }
            )
            const fields: CkanResponse<{ fields: Array<{ id: string }> }> =
                await fieldsRes.json()
            return {
                tableName: id,
                columns: fields.result.fields.map((field) => ({
                    key: field.id,
                    name: field.id,
                })),
            }
        })
    }
    const hiddenFields = ['the_geom', 'the_geom_webmercator']
    return useQuery(['fields', id], async () => {
        const fieldsRes = await fetch(
            `https://api.resourcewatch.org/v1/fields/${id}`
        )
        const fields: FieldsResponse = await fieldsRes.json()
        return {
            tableName: fields.tableName,
            columns: Object.keys(fields.fields)
                .filter((field) => !hiddenFields.includes(field))
                .map((field) => ({
                    name: field,
                    key: field,
                })),
        }
    })
}

export function useNumberOfRows({
    tableName,
    datasetId,
    filters,
    provider,
    setPageCount,
}: {
    tableName: string
    datasetId: string
    filters: DataExplorerColumnFilter[]
    provider: string
    setPageCount: (updater: Updater<number>) => void
}) {
    if (provider === 'datastore') {
        return api.datastore.getNumberOfRows.useQuery(
            {
                resourceId: tableName,
                filters
            },
            {
                keepPreviousData: true,
                onSuccess: (data) => {
                    setPageCount(data ? Math.ceil(data / 10) : 0)
                },
            }
        )
    }
    return api.rw.getNumberOfRows.useQuery(
        {
            datasetId,
            provider,
            tableName: tableName ?? '',
            filters: filters as {
                id: string
                value: FilterObjType[]
            }[],
        },
        {
            keepPreviousData: true,
            onSuccess: (data) => {
                setPageCount(data ? Math.ceil(data / 10) : 0)
            },
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
    provider,
}: {
    pagination: PaginationState
    sorting: ColumnSort[]
    tableName: string
    datasetId: string
    columns: string[]
    enabled?: boolean
    filters: ColumnFilter[]
    provider: string
}) {
    if (provider === 'datastore') {
        return api.datastore.getData.useQuery(
            {
                resourceId: tableName,
                pagination,
                columns,
                sorting,
                filters: filters as {
                    id: string
                    value: FilterObjType[]
                }[],
            },
            {
                enabled: !!tableName && enabled,
                keepPreviousData: true,
            }
        )
    }
    return api.rw.getData.useQuery(
        {
            datasetId,
            tableName: tableName ?? '',
            pagination,
            columns,
            provider,
            sorting,
            filters: filters as {
                id: string
                value: FilterObjType[]
            }[],
        },
        {
            enabled: !!datasetId && !!tableName && enabled,
            keepPreviousData: true,
        }
    )
}
