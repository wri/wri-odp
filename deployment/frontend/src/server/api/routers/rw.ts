import { FieldsResponse } from '@/components/data-explorer/queryHooks'
import { filterObj } from '@/components/data-explorer/search.schema'
import { createViewFormSchema, editViewFormSchema } from '@/schema/view.schema'
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from '@/server/api/trpc'
import {
    createDatasetView,
    deleteDatasetView,
    editDatasetView,
    getDatasetViews,
    updateDatasetHasChartsFlag,
} from '@/utils/apiUtils'
import { z } from 'zod'

export interface NumOfRowsResponse {
    data: Array<{ count: number } | number>
}

export interface DataResponse {
    data: Array<Record<string, any>>
}

interface GfwColumn {
    name: string
    alias: string
    description: string | null
    data_type: string
    unit: string | null
    is_feature_info: boolean
    is_filter: boolean
}

export const rwRouter = createTRPCRouter({
    getFields: publicProcedure
        .input(
            z.object({
                id: z.string(),
                provider: z.string(),
            })
        )
        .query(async ({ input }) => {
            const hiddenFields = [
                'the_geom',
                'the_geom_webmercator',
                'geom',
                'geom_wm',
                'gfw_geojson',
            ]
            const fieldsRes = await fetch(
                `https://api.resourcewatch.org/v1/fields/${input.id}`
            )
            const fields: FieldsResponse = await fieldsRes.json()
            if (input.provider === 'gfw') {
                const columns = {
                    tableName: 'gfw',
                    columns: fields.fields
                        .filter(
                            (field: GfwColumn) =>
                                !hiddenFields.includes(field.name)
                        )
                        .map((field: GfwColumn) => ({
                            key: field.name,
                            name: field.alias,
                            type: 'any',
                            default: '',
                        })),
                } as {
                    tableName: string
                    columns: { key: string; name: string; type: string }[]
                }
                return columns
            }

            const columns = {
                tableName: fields.tableName,
                columns: Object.keys(fields.fields)
                    .filter((field) => !hiddenFields.includes(field))
                    .map((field) => ({
                        name: field,
                        key: field,
                        type: 'any',
                        default: '',
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
            const paginationSql = `LIMIT ${
                pagination.pageIndex * pagination.pageSize + pagination.pageSize
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
                                              `${filter.id} ${
                                                  v.operation.value
                                              } '${v.value}' ${v.link ?? ''} `
                                      )
                                      .join('')} )`
                          )
                          .join(' AND ')
                    : ''
            const url = `https://api.resourcewatch.org/v1/query/${datasetId}?sql=SELECT ${columns.join(
                ' , '
            )} FROM ${tableName} ${sortSql} ${filtersSql} ${paginationSql}`

            const tableDataRes = await fetch(url)
            const tableData: DataResponse = await tableDataRes.json()
            const data = tableData.data
            if (provider === 'cartodb' || provider === 'gfw')
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
                                                  `${filter.id} ${
                                                      v.operation.value
                                                  } '${v.value}' ${
                                                      v.link ?? ''
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
        .input(
            z.object({ view: createViewFormSchema, ckanDatasetId: z.string() })
        )
        .mutation(async ({ input, ctx }) => {
            return createDatasetView(input.view).then(async (res) => {
                await updateDatasetHasChartsFlag({
                    ckanDatasetId: input.ckanDatasetId,
                    session: ctx.session,
                })
                return res
            })
        }),
    updateDatasetView: protectedProcedure
        .input(
            z.object({ view: editViewFormSchema, ckanDatasetId: z.string() })
        )
        .mutation(async ({ input, ctx }) => {
            return editDatasetView(input.view).then(async (res) => {
                await updateDatasetHasChartsFlag({
                    ckanDatasetId: input.ckanDatasetId,
                    session: ctx.session,
                })
                return res
            })
        }),
    deleteDatasetView: protectedProcedure
        .input(
            z.object({
                ckanDatasetId: z.string(),
                rwDatasetId: z.string(),
                id: z.string(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            return deleteDatasetView(input.rwDatasetId, input.id).then(
                async (res) => {
                    await updateDatasetHasChartsFlag({
                        ckanDatasetId: input.ckanDatasetId,
                        session: ctx.session,
                    })
                    return res
                }
            )
        }),
    getDatasetViews: publicProcedure
        .input(z.object({ rwDatasetId: z.string() }))
        .query(async ({ input }) => {
            return await getDatasetViews({ rwDatasetId: input.rwDatasetId })
        }),
})
