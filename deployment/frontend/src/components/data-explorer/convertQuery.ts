import { QueryFormType } from "./search.schema";

export function convertToSql(queryObj: QueryFormType) {
  const { filters, sort, pagination } = queryObj;
  const filtersSql = filters.length > 0 ? 'WHERE ' + filters.map((filter) => `${filter.column} ${filter.operator.value} ${filter.value}`).join(' AND ') : ''
  const sortSql = sort.length > 0 ? 'SORT BY ' + sort.map((sort) => `${sort.column} ${sort.direction}`).join(', ') : ''
  const paginationSql = `LIMIT ${pagination.limit ?? 10} OFFSET ${pagination.offset ?? 0}`;
  return `SELECT * FROM ${queryObj.tableName} ${filtersSql} ${sortSql} ${paginationSql}`;
}
