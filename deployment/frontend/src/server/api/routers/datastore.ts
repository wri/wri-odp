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
            })
        )
        .query(async ({ input }) => {
            const { pagination, resourceId, columns, sorting, filters } = input
            const paginationSql = `LIMIT ${
                pagination.pageIndex * pagination.pageSize + pagination.pageSize
            }`
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
            const parsedColumns = columns.map((column) => `"${column}"`)
            const url = `${
                env.CKAN_URL
            }/api/action/datastore_search_sql?sql=SELECT ${parsedColumns.join(
                ' , '
            )} FROM "${resourceId}" ${sortSql} ${filtersSql} ${paginationSql}`
            const tableDataRes = await fetch(url)
            const tableData: DataResponse = await tableDataRes.json()
            if (!tableData.success && tableData.error) {
                if (tableData.error.message)
                    throw Error(tableData.error.message)
                throw Error(JSON.stringify(tableData.error))
            }
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
        .query(async ({ input }) => {
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
                    numRows.result.records[0].count
                ) {
                    return numRows.result.records[0].count as number
                }
                throw new Error('Could not get number of rows')
            } catch (e) {
                let error =
                    'Something went wrong please contact the system administrator'
                if (e instanceof Error) error = e.message
                throw Error(error)
            }
        }),
})
