import { FieldsResponse } from '@/components/data-explorer/queryHooks'
import { filterObj } from '@/components/data-explorer/search.schema'
import { env } from '@/env.mjs'
import { createViewFormSchema, editViewFormSchema } from '@/schema/view.schema'
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from '@/server/api/trpc'
import { a } from 'vitest/dist/suite-SvxfaIxW'
import { z } from 'zod'

export interface NumOfRowsResponse {
    data: Array<{ count: number } | number>
}

export interface DataResponse {
    data: Array<Record<string, any>>
}

export const rwRouter = createTRPCRouter({
    getFields: publicProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .query(async ({ input }) => {
            const hiddenFields = ['the_geom', 'the_geom_webmercator']
            const fieldsRes = await fetch(
                `https://api.resourcewatch.org/v1/fields/${input.id}`
            )
            const fields: FieldsResponse = await fieldsRes.json()
            const columns = {
                tableName: fields.tableName,
                columns: Object.keys(fields.fields)
                    .filter((field) => !hiddenFields.includes(field))
                    .map((field) => ({
                        name: field,
                        key: field,
                    })),
            }
            return columns
        }),
    getData: publicProcedure
        .input(
            z.object({
                pagination: z.object({
                    pageIndex: z.number(),
                    pageSize: z.number(),
                }),
                columns: z.array(z.string()),
                sorting: z.array(
                    z.object({
                        id: z.string(),
                        desc: z.boolean(),
                    })
                ),
                tableName: z.string(),
                datasetId: z.string(),
                provider: z.string(),
                filters: z.array(
                    z.object({
                        id: z.string(),
                        value: z.array(filterObj),
                    })
                ),
            })
        )
        .query(async ({ input }) => {
            const {
                pagination,
                tableName,
                datasetId,
                columns,
                provider,
                sorting,
                filters,
            } = input
            const paginationSql = `LIMIT ${pagination.pageIndex * pagination.pageSize + pagination.pageSize
                }`
            const sortSql =
                sorting.length > 0
                    ? 'ORDER BY ' +
                    sorting
                        .map(
                            (sort) =>
                                `${sort.id} ${sort.desc ? 'DESC' : 'ASC'}`
                        )
                        .join(', ')
                    : ''
            const filtersSql =
                filters.length > 0
                    ? 'WHERE ' +
                    filters
                        .map(
                            (filter) =>
                                `( ${filter.value
                                    .filter((v) => v.value !== '')
                                    .map(
                                        (v) =>
                                            `${filter.id} ${v.operation.value
                                            } '${v.value}' ${v.link ?? ''} `
                                    )
                                    .join('')} )`
                        )
                        .join(' AND ')
                    : ''
            const url = `https://api.resourcewatch.org/v1/query/${datasetId}?sql=SELECT ${columns.join(
                ' , '
            )} FROM ${tableName} ${sortSql} ${filtersSql} ${paginationSql}`

            console.log(url)
            const tableDataRes = await fetch(url)
            const tableData: DataResponse = await tableDataRes.json()
            const data = tableData.data
            if (provider === 'cartodb')
                return data.slice(
                    pagination.pageIndex * pagination.pageSize,
                    data.length
                )
            return data
        }),
    getNumberOfRows: publicProcedure
        .input(
            z.object({
                tableName: z.string(),
                datasetId: z.string(),
                provider: z.string(),
                filters: z.array(
                    z.object({
                        id: z.string(),
                        value: z.array(filterObj),
                    })
                ),
            })
        )
        .query(async ({ input }) => {
            try {
                const { datasetId, tableName, filters, provider } = input
                const filtersSql =
                    filters.length > 0
                        ? 'WHERE ' +
                        filters
                            .map(
                                (filter) =>
                                    `( ${filter.value
                                        .filter((v) => v.value !== '')
                                        .map(
                                            (v) =>
                                                `${filter.id} ${v.operation.value
                                                } '${v.value}' ${v.link ?? ''
                                                } `
                                        )
                                        .join('')} )`
                            )
                            .join(' AND ')
                        : ''
                const numRowsRes = await fetch(
                    `https://api.resourcewatch.org/v1/query/${datasetId}?sql=SELECT COUNT(*) FROM ${tableName} ${filtersSql}`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                )
                const numRows: NumOfRowsResponse = await numRowsRes.json()
                if (typeof numRows.data[0] === 'number') {
                    return numRows.data[0]
                }
                if (numRows.data[0]) {
                    return numRows.data[0].count
                }
                throw new Error('Could not get number of rows')
            } catch (e) {
                let error =
                    'Something went wrong please contact the system administrator'
                if (e instanceof Error) error = e.message
                throw Error(error)
            }
        }),
    createDatasetView: protectedProcedure
        .input(createViewFormSchema)
        .mutation(async ({ input }) => {
            const createRes = await fetch(
                `https://api.resourcewatch.org/v1/dataset/${input.resource_id}/widget`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${env.RW_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    // TODO: should application be the same as on the dataset metadata?
                    body: JSON.stringify({
                        name: input.title,
                        application: ['rw'],
                        widgetConfig: input,
                    }),
                }
            )
            const result = await createRes.json()
            return result
        }),
    updateDatasetView: protectedProcedure
        .input(editViewFormSchema)
        .mutation(async ({ input }) => {
            const createRes = await fetch(
                `https://api.resourcewatch.org/v1/dataset/${input.resource_id}/widget/${input.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${env.RW_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    // TODO: should application be the same as on the dataset metadata?
                    body: JSON.stringify({
                        name: input.title,
                        application: ['rw'],
                        widgetConfig: input,
                    }),
                }
            )
            const result = await createRes.json()
            return result
        }),
    deleteDatasetView: protectedProcedure
        .input(z.object({ datasetId: z.string(), id: z.string() }))
        .mutation(async ({ input }) => {
            const createRes = await fetch(
                `https://api.resourcewatch.org/v1/dataset/${input.datasetId}/widget/${input.id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${env.RW_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    // TODO: should application be the same as on the dataset metadata?
                }
            )
            const result = await createRes.json()
            return result
        }),

    getDatasetViews: publicProcedure
        .input(z.object({ rwDatasetId: z.string() }))
        .query(async ({ input }) => {
            const viewsRes = await fetch(
                `https://api.resourcewatch.org/v1/dataset/${input.rwDatasetId}/widget`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${env.RW_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            )
            const result = await viewsRes.json()
            return result.data.map((d: any) => ({
                id: d.id,
                ...d.attributes.widgetConfig,
            }))
        }),
})
