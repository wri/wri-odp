import z from 'zod'

const filterSchema = z
    .object({
        column: z.string(),
        operator: z.object({
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
    })
    .transform((data) => {
        if (['>', '<', '>=', '<='].includes(data.operator.value)) {
            return { ...data, value: parseFloat(data.value) }
        }
        return data
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
    filters: z.array(filterSchema),
    sort: z.array(sortSchema),
    pagination: paginationSchema,
    tableName: z.string(),
})

export type QueryFormType = z.infer<typeof querySchema>
export type PaginationType = z.infer<typeof paginationSchema>
