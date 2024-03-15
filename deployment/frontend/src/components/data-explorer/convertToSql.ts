import { filterObj } from '@/components/data-explorer/search.schema'
import z from 'zod'

type FilterObjType = z.infer<typeof filterObj>

interface SortingObj {
    id: string
    desc: boolean
}

interface FilterObj {
    id: string
    value: FilterObjType[]
}

export function convertToSql({
    tableName,
    columns,
    sorting,
    filters,
}: {
    tableName: string
    columns: string[]
    sorting: SortingObj[]
    filters: FilterObj[]
}) {
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
                          `${filter.value
                              .filter((v) => v.value !== '')
                              .map(
                                  (v) =>
                                      `( "${filter.id}" ${v.operation.value} '${
                                          v.value
                                      }' ) ${v.link ?? ''} `
                              )
                              .join('')}`
                  )
                  .join(' AND ')
            : ''
    return `SELECT * FROM "${tableName}" ${filtersSql} ${sortSql}`
}
