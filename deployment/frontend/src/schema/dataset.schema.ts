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
    format: z.string().optional().nullable(),
    size: z.number().optional(),
    title: z.string().min(1, { message: 'Title is required' }),
    fileBlob: z.any(),
    type: z.enum(['link', 'upload', 'layer', 'empty']),
    dataDictionary: DataDictionarySchema.optional().nullable(),
})

export const DatasetSchema = z
    .object({
        title: z.string().min(1, { message: 'Title is required' }),
        name: z.string().min(1, { message: 'Name is required' }),
        source: z.string().optional().nullable().or(emptyStringToUndefined),
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
        project: z.string().optional().nullable().or(emptyStringToUndefined),
        application: z.string().optional().nullable(),
        technical_notes: z
            .string()
            .url()
            .optional()
            .nullable()
            .or(emptyStringToUndefined),
        tags: z.array(z.string()),
        topics: z.array(z.string()),
        temporal_coverage_start: z
            .number()
            .optional()
            .nullable()
            .or(nanToUndefined),
        temporal_coverage_end: z
            .number()
            .optional()
            .nullable()
            .or(nanToUndefined),
        update_frequency: z
            .object({
                value: z.enum([
                    'annually',
                    'biannually',
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
        license_id: z
            .object({
                value: z.string(),
                label: z.string(),
            })
            .optional(),
        short_description: z
            .string()
            .min(1, { message: 'Description is required' }),
        notes: z.string().optional().nullable(),
        wri_data: z.boolean().optional().nullable(),
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
        methodology: z.string().optional().nullable(),
        extras: z.array(
            z.object({
                key: z.string(),
                value: z.string(),
            })
        ),
        open_in: z.array(
            z.object({
                title: z.string(),
                url: z.string().url(),
            })
        ),
        resources: z.array(ResourceSchema),
    })
    .refine(
        (obj) => {
            if (!obj.featured_dataset) return true
            if (obj.featured_dataset && !obj.featured_image) return false
            return true
        },
        {
            message: 'An image is required for featured datasets',
            path: ['featured_image'],
        }
    )
    .refine(
        (obj) => {
            if (obj.visibility_type.value !== 'public') return true
            if (!obj.technical_notes) return false
            return true
        },
        {
            message: 'Technical notes are required for public datasets',
            path: ['technical_notes'],
        }
    )

export type DataDictionaryFormType = z.infer<typeof DataDictionarySchema>
export type DatasetFormType = z.infer<typeof DatasetSchema>
export type ResourceFormType = z.infer<typeof ResourceSchema>
