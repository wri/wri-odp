import z from 'zod'

export const ResourceSchema = z.object({
    description: z.string().optional(),
    resourceId: z.string().uuid(),
    url: z.string().url().optional(),
    name: z.string().optional(),
    key: z.string().optional(),
    format: z
        .object({
            value: z.string(),
            label: z.string(),
        })
        .optional()
        .nullable(),
    size: z.number().optional(),
    title: z.string(),
    fileBlob: z.any(),
    type: z.enum(['link', 'upload', 'layer', 'empty']),
    dataDictionary: z.array(z.object({
        field: z.string(),
        type: z.string(),
        null: z.string(),
        key: z.string(),
        default: z.string(),
    })),
})

export const DatasetSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1, { message: 'Title is required' }),
    name: z.string().min(1, { message: 'Name is required' }),
    source: z.string().url().optional().nullable(),
    language: z
        .object({
            value: z.string(),
            label: z.string(),
        })
        .optional(),
    team: z.object({
        value: z.string(),
        label: z.string(),
        id: z.string(),
    }),
    projects: z.string().optional().nullable(),
    applications: z.string().optional().nullable(),
    technical_notes: z.string().url(),
    tags: z.array(z.string()),
    topics: z.array(z.string()),
    temporalCoverageStart: z.number().optional().nullable(),
    temporalCoverageEnd: z.number().optional().nullable(),
    update_frequency: z
        .object({
            value: z.enum([
                'anually',
                'bianually',
                'weekly',
                'as_needed',
                'hourly',
                'monthly',
                'quarterly',
                'daily',
            ]),
            label: z.string(),
        })
        .optional()
        .nullable(),
    citation: z.string().optional().nullable(),
    visibility_type: z
        .object({
            value: z.enum(['public', 'private', 'draft']),
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
    short_description: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    featured_dataset: z.boolean().optional().nullable(),
    featuredImage: z.string().optional().nullable(),
    signedUrl: z.string().url().optional().nullable(),
    author: z.string(),
    author_email: z.string().email(),
    maintainer: z.string(),
    maintainer_email: z.string().email(),
    function: z.string().optional().nullable(),
    restrictions: z.string().optional().nullable(),
    reason_for_adding: z.string().optional().nullable(),
    learn_more: z.string().url().optional().nullable(),
    cautions: z.string().optional().nullable(),
    summary: z.string().optional().nullable(),
    extras: z.array(
        z.object({
            key: z.string(),
            value: z.string(),
        })
    ),
    resources: z.array(ResourceSchema),
})

export type DatasetFormType = z.infer<typeof DatasetSchema>
export type ResourceFormType = z.infer<typeof ResourceSchema>
