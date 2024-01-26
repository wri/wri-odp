import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { env } from '@/env.mjs'
import { z } from 'zod'
import { CkanResponse } from '@/schema/ckan.schema'
import { filterObj } from '@/components/data-explorer/search.schema'

export type DataResponse = CkanResponse<{
    sql: string
    records: Array<Record<string, any>>
    fields: Array<Record<string, any>>
}>

export const datastoreRouter = createTRPCRouter({
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
                resourceId: z.string(),
                filters: z.array(
                    z.object({
                        id: z.string(),
                        value: z.array(filterObj),
                    })
                ),
                groupBy: z.array(z.string()).optional(),
            })
        )
        .query(async ({ input, ctx }) => {
            const { pagination, resourceId, columns, sorting, filters, groupBy } = input
            const paginationSql = `LIMIT ${
                pagination.pageIndex * pagination.pageSize + pagination.pageSize
            } OFFSET ${pagination.pageIndex * pagination.pageSize}`
            const sortSql =
                sorting.length > 0
                    ? 'ORDER BY ' +
                      sorting
                          .map(
                              (sort) =>
                                  `"${sort.id}" ${sort.desc ? 'DESC' : 'ASC'}`
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
            const groupBySql =
                groupBy && groupBy.length
                    ? 'GROUP BY ' + groupBy.map(item => `"${item}"`).join(', ')
                    : ''


            const parsedColumns = columns.map((column) => `"${column}"`)
            const url = `${
                env.CKAN_URL
            }/api/action/datastore_search_sql?sql=SELECT ${parsedColumns.join(
                ' , '
            )} FROM "${resourceId}" ${sortSql} ${filtersSql} ${groupBySql} ${paginationSql}`
            const tableDataRes = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: ctx.session?.user.apikey ?? '',
                },
            })
            const tableData: DataResponse = await tableDataRes.json()
            if (!tableData.success && tableData.error) {
                console.log(tableData.error)
                if (tableData.error.message){
                    throw Error(tableData.error.message)
                }
                throw Error(JSON.stringify(tableData.error))
            }
            console.log(tableData)
            const data = tableData.result.records
            return data
        }),
    getNumberOfRows: publicProcedure
        .input(
            z.object({
                resourceId: z.string(),
                filters: z.array(
                    z.object({
                        id: z.string(),
                        value: z.array(filterObj),
                    })
                ),
            })
        )
        .query(async ({ input, ctx }) => {
            try {
                const { resourceId, filters } = input
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
                const url = `${env.CKAN_URL}/api/action/datastore_search_sql?sql=SELECT COUNT(*) FROM "${resourceId}" ${filtersSql}`
                const numRowsRes = await fetch(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${ctx?.session?.user.apikey}`,
                    },
                })
                const numRows: DataResponse = await numRowsRes.json()
                if (!numRows.success && numRows.error) {
                    if (numRows.error.message)
                        throw Error(numRows.error.message)
                    throw Error(JSON.stringify(numRows.error))
                }
                if (
                    numRows.result &&
                    numRows.result.records[0] &&
                    (numRows.result.records[0].count || numRows.result.records[0].count === 0)
                ) {
                    return numRows.result.records[0].count as number
                }
                console.log(numRows)
                throw new Error('Could not get number of rows')
            } catch (e) {
                let error =
                    'Something went wrong please contact the system administrator'
                if (e instanceof Error) error = e.message
                throw Error(error)
            }
        }),
})
