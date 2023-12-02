import { layerSchema } from '@/components/dashboard/datasets/admin/datafiles/sections/BuildALayer/layer.schema'
import z from 'zod'

const emptyStringToUndefined = z.literal('').transform(() => undefined)
const nanToUndefined = z.literal(NaN).transform(() => undefined)

const updateFrequencySchema = z.enum([
    'annually',
    'biannually',
    'weekly',
    'as_needed',
    'hourly',
    'monthly',
    'quarterly',
    'daily',
])

const visibilityTypeSchema = z.enum(['public', 'private', 'draft', 'internal'])

const capacitySchema = z.enum(['admin', 'editor', 'member'])

export const DataDictionarySchema = z.array(
    z.object({
        field: z.string(),
        type: z.string(),
        null: z.string(),
        key: z.string(),
        default: z.string(),
    })
)

export const CollaboratorSchema = z.object({
    user: z.object({value: z.string(), label: z.string()}),
    package_id: z.string(),
    capacity: z.object({
        value: capacitySchema,
        label: z.string(),
    }),
})

export const ResourceSchema = z.object({
    description: z.string().optional(),
    resourceId: z.string().uuid(),
    id: z.string().uuid().optional().nullable(),
    new: z.boolean().optional(),
    package_id: z.string().optional().nullable(),
    url: z.string().min(2, { message: 'URL is required' }).url().optional(),
    name: z.string().optional(),
    key: z.string().optional(),
    format: z.string().optional().nullable(),
    size: z.number().optional().nullable(),
    title: z.string().optional(),
    fileBlob: z.any(),
    type: z.enum(['link', 'upload', 'layer', 'empty']),
    schema: DataDictionarySchema.optional().nullable(),
    layerObj: layerSchema.optional().nullable(),
})

export const DatasetSchema = z
    .object({
        id: z.string().uuid().optional().nullable(),
        title: z.string().min(1, { message: 'Title is required' }),
        name: z.string().min(1, { message: 'Name is required' }),
        url: z.string().optional().nullable().or(emptyStringToUndefined),
        connectorUrl: z.string().optional().nullable().default(''),
        connectorType: z.string().optional().nullable().default('rest'),
        tableName: z.string().optional().nullable().default(''),
        provider: z.string().optional().nullable().default('cartodb'),
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
                value: updateFrequencySchema,
                label: z.string(),
            })
            .optional()
            .nullable(),
        citation: z.string().optional().nullable(),
        visibility_type: z
            .object({
                value: visibilityTypeSchema,
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
        signedUrl: z
            .string()
            .url()
            .optional()
            .nullable()
            .or(emptyStringToUndefined),
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
        collaborators: z.array(CollaboratorSchema).default([]),
        spatial_address: z.string().optional(),
        spatial: z.any().optional(),
        spatial_type: z.enum(['address', 'geom']).optional()
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

export type VisibilityTypeUnion = z.infer<typeof visibilityTypeSchema>
export type UpdateFrequencyUnion = z.infer<typeof updateFrequencySchema>
export type CapacityUnion = z.infer<typeof capacitySchema>

export type DataDictionaryFormType = z.infer<typeof DataDictionarySchema>
export type DatasetFormType = z.infer<typeof DatasetSchema>
export type ResourceFormType = z.infer<typeof ResourceSchema>
