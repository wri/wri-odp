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
import { useSession } from 'next-auth/react'

export interface FieldsResponse {
    tableName: string
    fields: Record<string, any> | Array<{ name: string; alias: string }>
}

export function useFields({ id, provider, apiKey }: TabularResource) {
    const session = useSession()

    const headers = {
        'Content-Type': 'application/json',
    } as any

    if (apiKey) {
        headers['Authorization'] = apiKey
    } else if (session.data?.user.apikey) {
        headers['Authorization'] = session.data?.user.apikey
    }

    const datastoreHook = useQuery(['fields', id], async () => {
        const fieldsRes = await fetch(
            `${env.NEXT_PUBLIC_CKAN_URL}/api/3/action/datastore_info`,
            {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    id,
                }),
            }
        )
        const fields: CkanResponse<{
            fields: Array<{
                id: string
                name: string
                info: { label: string | null; default: string | null }
                type: string
            }>
        }> = await fieldsRes.json()

        return {
            tableName: id,
            columns: fields.result.fields.map((field) => ({
                key: field.id,
                name: field.info.label ?? field.id,
                type: field.type,
                default: field.info.default ?? '',
            })),
        }
    })
    const rwHook = api.rw.getFields.useQuery({
        id,
        provider,
    })
    if (provider === 'datastore') {
        return datastoreHook
    }
    return rwHook
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
    console.log('TABLE NAME', tableName)
    if (provider === 'datastore') {
        return api.datastore.getNumberOfRows.useQuery(
            {
                resourceId: tableName,
                filters,
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
    groupBy,
}: {
    pagination: PaginationState
    sorting: ColumnSort[]
    tableName: string
    datasetId: string
    columns: string[]
    enabled?: boolean
    filters: ColumnFilter[]
    provider: string
    groupBy?: string[]
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
                groupBy,
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
