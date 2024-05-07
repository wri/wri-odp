export const queryRw = async (
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
        tableName: string
        datasetId: string
        provider: string
    },
) => {
    const {
        pagination,
        tableName,
        datasetId,
        columns,
        provider,
        sorting,
        filters,
        aggregate,
        groupBy
    } = input
    const paginationSql = `LIMIT ${pagination.pageIndex * pagination.pageSize + pagination.pageSize
        }`
    const sortSql =
        sorting.length > 0
            ? 'ORDER BY ' +
            sorting
                .map((sort) => `${sort.id} ${sort.desc ? 'DESC' : 'ASC'}`)
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

    let agregateSql = ''
    if (aggregate) {
        agregateSql = `${aggregate?.fn}("${aggregate?.column}") as "${aggregate?.column}"`
    }

    const parsedColumns = columns.map((column) =>
        aggregate?.column == column && agregateSql
            ? agregateSql
            : `"${column}"`
    )

    const url = `https://api.resourcewatch.org/v1/query/${datasetId}?sql=SELECT ${parsedColumns.join(
        ' , '
    )} FROM ${tableName} ${sortSql} ${filtersSql} ${groupBySql} ${paginationSql}`
    const tableDataRes = await fetch('/api/proxy', {
        method: 'POST',
        body: JSON.stringify({
            url,
        }),
    })
    const tableData: any = await tableDataRes.json()
    const data = tableData.data
    if (provider === 'cartodb')
        return data.slice(
            pagination.pageIndex * pagination.pageSize,
            data.length
        )
    return data
}
