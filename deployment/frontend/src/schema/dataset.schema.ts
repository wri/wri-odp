import { layerSchema } from '@/components/dashboard/datasets/admin/datafiles/sections/BuildALayer/layer.schema'
import z from 'zod'

const emptyStringToUndefined = z.literal('').transform(() => undefined)
const nanToUndefined = z.literal(NaN).transform(() => undefined)

const updateFrequencySchema = z.enum([
    'annually',
    'biannually',
    'weekly',
    'as_needed',
    'not_planned',
    'hourly',
    'monthly',
    'quarterly',
    'daily',
])

const visibilityTypeSchema = z.enum(['public', 'private', 'draft', 'internal'])

const capacitySchema = z.enum(['admin', 'editor', 'member'])

export const DataDictionarySchema = z.array(
    z.object({
        id: z.string(),
        info: z.object({
            type_override: z.string(),
            label: z.string(),
            default: z.string(),
        }),
    })
)

export const CollaboratorSchema = z.object({
    user: z.object({ value: z.string(), label: z.string() }),
    package_id: z.string(),
    capacity: z.object({
        value: capacitySchema,
        label: z.string(),
    }),
})

export const ResourceSchema = z
    .object({
        description: z.string().optional(),
        resourceId: z.string().uuid(),
        id: z.string().uuid().optional().nullable(),
        rw_id: z.string().optional().nullable(),
        new: z.boolean().optional(),
        package_id: z.string().optional().nullable(),
        url: z.string().optional(),
        name: z.string().optional(),
        key: z.string().optional(),
        format: z.string().optional().nullable(),
        size: z.number().optional().nullable(),
        title: z.string().optional(),
        advanced_api_usage: z.string().optional().nullable(),
        fileBlob: z.any(),
        type: z.enum([
            'link',
            'upload',
            'layer',
            'empty-file',
            'empty-layer',
            'layer-raw',
        ]),
        url_type: z
            .enum([
                'link',
                'upload',
                'layer',
                'empty-file',
                'empty-layer',
                'layer-raw',
            ])
            .optional()
            .nullable(),
        schema: DataDictionarySchema.optional().nullable(),
        layerObj: layerSchema.optional().nullable(),
        datastore_active: z.boolean().optional().nullable(),
        layerObjRaw: z.any().optional().nullable(),
        spatial_address: z.string().optional(),
        spatial_geom: z.any().optional(),
        spatial_coordinates: z.any().optional(),
        spatial_type: z.enum(['address', 'geom', 'global']).optional(),
    })
    .refine(
        (obj) => {
            if (obj.type !== 'link') return true
            if (!obj.url) return false
            return true
        },
        {
            message: 'URL are required for resource of type link',
            path: ['url'],
        }
    )

export const DatasetSchemaObject = z.object({
    id: z.string().uuid().optional().nullable(),
    rw_id: z.string().optional().nullable(),
    title: z.string().min(1, { message: 'Title is required' }),
    name: z.string().min(1, { message: 'Name is required' }),
    url: z.string().optional().nullable().or(emptyStringToUndefined),
    rw_dataset: z.boolean().default(false),
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
        .url({
            message: 'Invalid URL. Use the format https://www.website.com',
        })
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
    temporal_coverage_end: z.number().optional().nullable().or(nanToUndefined),
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
    wri_data: z.boolean().default(false),
    featured_dataset: z.boolean().optional().nullable(),
    featured_image: z.string().optional().nullable(),
    signedUrl: z
        .string()
        .url()
        .optional()
        .nullable()
        .or(emptyStringToUndefined),
    authors: z.array(
        z.object({
            name: z.string().min(1, { message: 'Author Name is required' }),
            email: z.string().email().min(1, {
                message: 'Author Email is required',
            }),
        })
    ).min(1, { message: 'At least one (1) Author Name and Author Email is required.' }),
    maintainers: z.array(
        z.object({
            name: z.string().min(1, { message: 'Maintainer Name is required' }),
            email: z.string().email().min(1, {
                message: 'Maintainer Email is required',
            }),
        })
    ).min(1, { message: 'At least one (1) Maintainer Name and Maintainer Email is required.' }),
    function: z.string().optional().nullable(),
    restrictions: z.string().optional().nullable(),
    reason_for_adding: z.string().optional().nullable(),
    learn_more: z
        .string()
        .url({
            message: 'Invalid URL. Use the format https://www.website.com',
        })
        .optional()
        .nullable()
        .or(emptyStringToUndefined),
    cautions: z.string().optional().nullable(),
    methodology: z.string().optional().nullable(),
    usecases: z.string().optional().nullable(),
    extras: z.array(
        z.object({
            key: z.string(),
            value: z.string(),
        })
    ),
    open_in: z.array(
        z.object({
            title: z.string(),
            url: z
                .string()
                .url('Invalid URL. Use the format https://www.website.com'),
        })
    ),
    resources: z.array(ResourceSchema),
    collaborators: z.array(CollaboratorSchema).default([]),
    spatial_address: z.string().optional(),
    spatial: z.any().optional(),
    spatial_type: z.enum(['address', 'geom', 'global']).optional(),
    release_notes: z.string().optional(),
})

export const DatasetSchema = DatasetSchemaObject.refine(
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
            if (!obj.rw_dataset) return true
            if (obj.rw_dataset && !obj.connectorType) return false
            return true
        },
        {
            message: 'Connector Type is required for RW datasets',
            path: ['connectorType'],
        }
    )
    .refine(
        (obj) => {
            if (!obj.rw_dataset) return true
            if (obj.rw_dataset && !obj.connectorType) return false
            return true
        },
        {
            message: 'Provider is required for RW datasets',
            path: ['provider'],
        }
    )
    .refine(
        (obj) => {
            if (!obj.rw_dataset) return true
            if (obj.rw_dataset && !obj.connectorUrl && !obj.tableName)
                return false
            return true
        },
        {
            message:
                'ConnectorUrl is required for RW datasets, unless a table name is provided',
            path: ['connectorUrl'],
        }
    )
    .refine(
        (obj) => {
            if (!obj.rw_dataset) return true
            if (obj.rw_dataset && !obj.connectorUrl && !obj.tableName)
                return false
            return true
        },
        {
            message:
                'Tablename is required for RW datasets, unless a connectorUrl is provided',
            path: ['tableName'],
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
    .refine(
        (obj) => {
            if (obj.authors.length === 0) return false
            return true
        },
        {
            message: 'At least one (1) Author Name and Author Email is required.',
            path: ['authors'],
        }
    )
    .refine(
        (obj) => {
            if (obj.maintainers.length === 0) return false
            return true
        },
        {
            message:
                'At least one (1) Maintainer Name and Maintainer Email is required.',
            path: ['maintainers'],
        }
    )

export const DatasetSchemaForEdit = DatasetSchemaObject.partial()
export type VisibilityTypeUnion = z.infer<typeof visibilityTypeSchema>
export type UpdateFrequencyUnion = z.infer<typeof updateFrequencySchema>
export type CapacityUnion = z.infer<typeof capacitySchema>

export type DataDictionaryFormType = z.infer<typeof DataDictionarySchema>
export type DatasetFormType = z.infer<typeof DatasetSchema>
export type ResourceFormType = z.infer<typeof ResourceSchema>
