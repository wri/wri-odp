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
        filters: {
            column: string
            operation: string
            value: string
            link?: string
        }[]
        groupBy: string[]
        aggregate?: { column: string; fn: string }
    },
    session: Session | null
) {
    const {
        pagination,
        resourceId,
        columns,
        sorting,
        filters,
        groupBy,
        aggregate,
    } = input
    const paginationSql = `LIMIT ${pagination.pageIndex * pagination.pageSize + pagination.pageSize
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
                    (f, i) =>
                        `"${f.column}" ${f.operation} '${f.value}' ${f.link && i != filters.length - 1 ? f.link : ''}`
                )
                .join(' ')
            : ''
    const groupBySql =
        groupBy && groupBy.length
            ? 'GROUP BY ' + groupBy.map((item) => `"${item}"`).join(', ')
            : ''

    let aggregateSql = ''
    if (input.aggregate) {
        aggregateSql = `${aggregate?.fn}("${aggregate?.column}") as "${aggregate?.column}"`
    }

    const parsedColumns = columns.map((column) =>
        aggregate?.column == column && aggregateSql
            ? aggregateSql
            : `"${column}"`
    )

    const sql = `SELECT ${parsedColumns.join(
        ' , '
    )} FROM "${resourceId}" ${sortSql} ${filtersSql} ${groupBySql} ${paginationSql}`

    console.log(sql)

    return { data: await sqlQueryDatastore(sql, session), sql }
}
