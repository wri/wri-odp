import z from 'zod'

export const searchSchema = z.object({
    search: z.string().default(''),
    page: z
        .object({
            start: z.number(),
            rows: z.number(),
        })
        .default({ start: 0, rows: 50 }),
    fq: z.record(z.string()).optional(),
    facetFields: z.array(z.string()).optional(),
    _isUserSearch: z.boolean().default(false).optional()
})

export type SearchInput = z.infer<typeof searchSchema>

