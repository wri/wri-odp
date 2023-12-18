import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { z } from 'zod'

export interface NumOfRowsResponse {
    data: Array<{ count: number } | number>
}

export interface DataResponse {
    data: Array<Record<string, any>>
}

export const rwRouter = createTRPCRouter({
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
                        value: z.object({
                            operation: z.string(),
                            value: z.string(),
                        }),
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
                          .filter((filter) => filter.value.value !== '')
                          .map(
                              (filter) =>
                                  `${filter.id} ${filter.value.operation} '${filter.value.value}'`
                          )
                          .join(' AND ')
                    : ''
            const url = `https://api.resourcewatch.org/v1/query/${datasetId}?sql=SELECT ${columns.join(
                ' , '
            )} FROM ${tableName} ${sortSql} ${filtersSql} ${paginationSql}`
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
                        value: z.object({
                            operation: z.string(),
                            value: z.string(),
                        }),
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
                              .filter((filter) => filter.value.value !== '')
                              .map(
                                  (filter) =>
                                      `${filter.id} ${filter.value.operation} '${filter.value.value}'`
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
                console.log('NUM OF ROWS', numRows)
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
})
