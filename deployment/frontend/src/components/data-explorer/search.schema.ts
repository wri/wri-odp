import z from 'zod'

export const filterObj = z
    .object({
        operation: z.object({
            value: z.enum([
                '=',
                '!=',
                '>',
                '<',
                '>=',
                '<=',
                'in',
                'not in',
                'like',
                'not like',
                'is null',
                'is not null',
            ]),
            label: z.string(),
        }),
        value: z.string(),
        link: z.string().nullable(),
    })

export const filterSchema = z.object({
  filters: z.array(filterObj),
})

const sortSchema = z.object({
    column: z.string(),
    direction: z.enum(['asc', 'desc']),
})

const paginationSchema = z.object({
    limit: z.number(),
    offset: z.number(),
})

export const querySchema = z.object({
    filters: filterSchema,
    sort: z.array(sortSchema),
    pagination: paginationSchema,
    tableName: z.string(),
})

export type QueryFormType = z.infer<typeof querySchema>
export type PaginationType = z.infer<typeof paginationSchema>
export type FilterFormType = z.infer<typeof filterSchema>
export type FilterObjType = z.infer<typeof filterObj>
