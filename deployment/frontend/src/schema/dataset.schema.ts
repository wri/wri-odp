import z from 'zod'

const emptyStringToUndefined = z.literal('').transform(() => undefined)
const nanToUndefined = z.literal(NaN).transform(() => undefined)

export const DataDictionarySchema = z.array(
    z.object({
        field: z.string(),
        type: z.string(),
        null: z.string(),
        key: z.string(),
        default: z.string(),
    })
)

export const ResourceSchema = z.object({
    description: z.string().optional(),
    resourceId: z.string().uuid(),
    url: z.string().min(2, { message: 'URL is required' }).url().optional(),
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
    title: z.string().min(1, { message: 'Title is required' }),
    fileBlob: z.any(),
    type: z.enum(['link', 'upload', 'layer', 'empty']),
    dataDictionary: DataDictionarySchema.optional().nullable(),
})

export const DatasetSchema = z.object({
    title: z.string().min(1, { message: 'Title is required' }),
    name: z.string().min(1, { message: 'Name is required' }),
    source: z.string().optional().nullable().or(emptyStringToUndefined),
    language: z
        .object({
            value: z.string(),
            label: z.string(),
        })
        .optional(),
    team: z
        .object({
            value: z.string(),
            label: z.string(),
            id: z.string(),
        })
        .refine((val) => val.value !== '', {
            message: 'Team is required',
        }),
    projects: z.array(z.string()),
    applications: z.string().optional().nullable(),
    technical_notes: z.string().url(),
    tags: z.array(z.string()),
    topics: z.array(z.string()),
    temporalCoverageStart: z.number().optional().nullable().or(nanToUndefined),
    temporalCoverageEnd: z.number().optional().nullable().or(nanToUndefined),
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
            value: z.enum(['public', 'private', 'draft', 'internal']),
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
    short_description: z
        .string()
        .min(1, { message: 'Description is required' }),
    notes: z.string().optional().nullable(),
    featured_dataset: z.boolean().optional().nullable(),
    featured_image: z.string().optional().nullable(),
    signedUrl: z.string().url().optional().nullable(),
    author: z.string(),
    author_email: z.string().email(),
    maintainer: z.string(),
    maintainer_email: z.string().email(),
    function: z.string().optional().nullable(),
    restrictions: z.string().optional().nullable(),
    reason_for_adding: z.string().optional().nullable(),
    learn_more: z
        .string()
        .url()
        .optional()
        .nullable()
        .or(emptyStringToUndefined),
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

export type DataDictionaryFormType = z.infer<typeof DataDictionarySchema>
export type DatasetFormType = z.infer<typeof DatasetSchema>
export type ResourceFormType = z.infer<typeof ResourceSchema>
