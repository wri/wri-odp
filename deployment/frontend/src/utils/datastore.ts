import { FilterObjType } from '@/components/data-explorer/search.schema'
import { env } from '@/env.mjs'
import { DataResponse } from '@/server/api/routers/datastore'
import { Session } from 'next-auth'

export async function sqlQueryDatastore(sql: string, session: Session | null) {
    const url = `${env.NEXT_PUBLIC_CKAN_URL}/api/action/datastore_search_sql?sql=${sql}`

    const tableDataRes = await fetch(url, {
        headers: {
            Authorization: session?.user.apikey ?? '',
        },
    })
    const tableData: DataResponse = await tableDataRes.json()
    if (!tableData.success && tableData.error) {
        console.log(tableData.error)
        if (tableData.error.message) {
            throw Error(tableData.error.message)
        }
        throw Error(JSON.stringify(tableData.error))
    }

    const data = tableData.result.records
    return data
}

export async function queryDatastore(
    input: {
        pagination: { pageIndex: number; pageSize: number }
        resourceId: string
        columns: string[]
        sorting: { id: string; desc: boolean }[]
        filters: { id: string; value: FilterObjType[] }[]
        groupBy: string[]
    },
    session: Session | null
) {
    const { pagination, resourceId, columns, sorting, filters, groupBy } = input
    const paginationSql = `LIMIT ${
        pagination.pageIndex * pagination.pageSize + pagination.pageSize
    }`
    const sortSql =
        sorting.length > 0
            ? 'ORDER BY ' +
              sorting
                  .map((sort) => `"${sort.id}" ${sort.desc ? 'DESC' : 'ASC'}`)
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
                                      `${filter.id} ${v.operation.value} '${
                                          v.value
                                      }' ${v.link ?? ''} `
                              )
                              .join('')} )`
                  )
                  .join(' AND ')
            : ''
    const groupBySql =
        groupBy && groupBy.length
            ? 'GROUP BY ' + groupBy.map((item) => `"${item}"`).join(', ')
            : ''

    const parsedColumns = columns.map((column) => `"${column}"`)

    const sql = `SELECT ${parsedColumns.join(
        ' , '
    )} FROM "${resourceId}" ${sortSql} ${filtersSql} ${groupBySql} ${paginationSql}`

    return await sqlQueryDatastore(sql, session)
}
