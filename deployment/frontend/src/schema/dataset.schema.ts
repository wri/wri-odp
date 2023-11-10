import z from 'zod'

export const ResourceSchema = z.object({
    description: z.string().optional(),
    url: z.string().url().optional(),
    format: z.string().optional(),
    size: z.number().optional(),
    title: z.string(),
    type: z.enum(['link', 'upload', 'layer', 'empty']),
})

export const DatasetSchema = z.object({
    title: z.string(),
    name: z.string(),
    source: z.string().url().optional().nullable(),
    language: z.string().optional().nullable(),
    team: z.string(),
    projects: z.string().optional().nullable(),
    applications: z.string().optional().nullable(),
    technicalNotes: z.string().url(),
    tags: z.array(z.string()),
    temporalCoverageStart: z.date().optional().nullable(),
    temporalCoverageEnd: z.date().optional().nullable(),
    updateFrequency: z
        .object({
            value: z.enum(['monthly', 'quarterly', 'yearly', 'daily']),
            label: z.string(),
        })
        .optional()
        .nullable(),
    citation: z.string().optional().nullable(),
    visibility: z
        .object({
            value: z.string(),
            label: z.string(),
        })
        .optional()
        .default({ value: 'public', label: 'Public' }),
    license: z
        .object({
            value: z.string(),
            label: z.string(),
        })
        .optional(),
    shortDescription: z.string().optional().nullable(),
    longDescription: z.string().optional().nullable(),
    featured: z.boolean().optional().nullable(),
    featuredImage: z.string().url().optional().nullable(),
    authorName: z.string(),
    authorEmail: z.string().email(),
    maintainerName: z.string(),
    maintainerEmail: z.string().email(),
    function: z.string().optional().nullable(),
    restrictions: z.string().optional().nullable(),
    reasonsForAdding: z.string().optional().nullable(),
    learnMore: z.string().optional().nullable(),
    cautions: z.string().optional().nullable(),
    summary: z.string().optional().nullable(),
    customFields: z.array(
        z.object({
            name: z.string(),
            value: z.string(),
        })
    ),
    resources: z.array(ResourceSchema),
})

export type DatasetFormType = z.infer<typeof DatasetSchema>
export type ResourceFormType = z.infer<typeof ResourceSchema>
