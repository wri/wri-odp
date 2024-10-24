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
    appendRawFq: z.string().optional(),
    facetFields: z.array(z.string()).optional(),
    sortBy: z.string().default('score desc').optional(),
    extGlobalQ: z.enum(['only', 'exclude', 'include']).default('include').optional(),
    extLocationQ: z.string().optional(),
    extAddressQ: z.string().optional(),
    _isUserSearch: z.boolean().default(false).optional(),
    tree: z.boolean().optional(),
    allTree: z.boolean().optional(),
    pageEnabled: z.boolean().optional(),
    removeUnecessaryDataInResources: z.boolean().optional(),
    tab: z.string().optional(),
})

export type SearchInput = z.infer<typeof searchSchema>
