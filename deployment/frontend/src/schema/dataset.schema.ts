import { layerSchema } from '@/components/dashboard/datasets/admin/datafiles/sections/BuildALayer/layer.schema';
import z from 'zod';

const emptyStringToUndefined = z.literal('').transform(() => undefined);
const nanToUndefined = z.literal(NaN).transform(() => undefined);

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
]);

const datasetTypeInfoSchema = z.enum([
    'raster_data',
    'tiled_raster_data',
    'vector_data',
    'tiled_vector_data',
    'tabular_data',
    'versioned_tabular_data',
    'packaged_dataset',
    'mixed_dataset',
    'documentation',
    'model_output',
    'api_dataset',
]);

const visibilityTypeSchema = z.enum(['public', 'private', 'draft', 'internal']);

const capacitySchema = z.enum(['admin', 'editor', 'member']);

const DataDictionarySchema = z.array(
    z.object({
        id: z.string(),
        info: z.object({
            type_override: z.string(),
            label: z.string(),
            default: z.string(),
        }),
    })
);

const CollaboratorSchema = z.object({
    user: z.object({ value: z.string(), label: z.string() }),
    package_id: z.string(),
    capacity: z.object({
        value: capacitySchema,
        label: z.string(),
    }),
});

export const ResourceSchema = z
    .object({
        description: z.string().optional(),
        resourceId: z.string().uuid(),
        id: z.string().uuid().optional().nullable(),
        rw_id: z.string().optional().nullable(),
        asset_id: z.string().optional().nullable(),
        new: z.boolean().optional(),
        isUploading: z.boolean().optional(),
        package_id: z.string().optional().nullable(),
        url: z.string().optional(),
        cache_type: z
            .enum(['raster', 'vector'], { message: 'Cache type is required' })
            .optional()
            .nullish(),
        asset_type: z
            .enum(['raster', 'vector'], { message: 'Asset type is required' })
            .optional()
            .nullish(),
        name: z.string().optional(),
        key: z.string().optional(),
        format: z.string().optional().nullable(),
        size: z.number().optional().nullable(),
        title: z
            .string()
            .min(2, { message: 'Title is required (minimum of 2 characters)' }),
        advanced_api_usage: z.string().optional().nullable(),
        not_downloadable: z.boolean().optional().default(false),
        fileBlob: z.any(),
        type: z.enum([
            'link',
            'upload',
            'layer',
            'empty-file',
            'tile-cache',
            'gee-asset',
            'empty-layer',
            'layer-raw',
            'reference-layer',
            'data-api-dataset',
        ]),
        url_type: z
            .enum([
                'link',
                'tile-cache',
                'gee-asset',
                'upload',
                'layer',
                'empty-file',
                'empty-layer',
                'layer-raw',
                'reference-layer',
                'data-api-dataset',
            ])
            .optional()
            .nullable(),
        schema: DataDictionarySchema.optional().nullable(),
        layerObj: layerSchema.optional().nullable(),
        datastore_active: z.boolean().optional().nullable(),
        layerObjRaw: z.any().optional().nullable(),
        spatial_address: z.string().optional().nullable(),
        spatial_geom: z.any().optional().nullable(),
        spatial_coordinates: z.any().optional().nullable(),
        spatial_type: z
            .enum(['address', 'geom', 'global'])
            .optional()
            .nullable(),
        data_api_dataset_id: z.string().optional().nullable(),
        data_api_version: z.string().optional().nullable(),
        data_api_asset_id: z.string().optional().nullable(),
        data_api_tiles: z.array(z.string()).optional().nullable(),
    })
    .refine(
        (obj) => {
            if (obj.type !== 'link' && obj.type !== 'tile-cache') return true;
            if (!obj.url) return false;
            if (
                !obj.url.startsWith('http://') &&
                !obj.url.startsWith('https://')
            )
                return false;
            return true;
        },
        {
            message: 'Invalid URL',
            path: ['url'],
        }
    )
    .refine(
        (obj) => {
            if (obj.type !== 'gee-asset') return true;
            if (!obj.asset_type) return false;
            return true;
        },
        {
            message: 'Required',
            path: ['asset_type'],
        }
    )
    .refine(
        (obj) => {
            if (obj.type !== 'tile-cache') return true;
            if (!obj.cache_type) return false;
            return true;
        },
        {
            message: 'Required',
            path: ['cache_type'],
        }
    );

const DatasetSchemaObject = z.object({
    id: z.string().uuid().optional().nullable(),
    rw_id: z.string().optional().nullable(),
    title: z
        .string()
        .min(2, { message: 'Title is required (minimum 2 characters)' }),
    name: z
        .string()
        .min(1, { message: 'Name is required' })
        .regex(
            /^[a-z0-9_-]+$/,
            '[!] Name must consist only of lowercase ASCII letters, numbers, hyphens, and underscores.'
        ),
    url: z
        .string()
        .url({
            message: 'Must be in a valid URL format',
        })
        .optional()
        .nullable()
        .or(emptyStringToUndefined),
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
        value: z
            .string()
            .min(1, { message: 'Team is required for all Datasets' }),
        label: z.string(),
        id: z.string(),
        visibility: z.string(),
    }),
    project: z.string().optional().nullable().or(emptyStringToUndefined),
    dataset_type_info: z
        .object({
            value: datasetTypeInfoSchema,
            label: z.string(),
        })
        .optional()
        .nullable(),
    applications: z.array(z.string()).default([]),
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
    authors: z
        .array(
            z.object({
                name: z.string().min(1, { message: 'Author Name is required' }),
                email: z
                    .string()
                    .optional()
                    .nullable()
                    .or(emptyStringToUndefined),
            })
        )
        .min(1, {
            message: 'At least one (1) Author Name is required.',
        }),
    maintainers: z
        .array(
            z.object({
                name: z
                    .string()
                    .min(1, { message: 'Maintainer Name is required' }),
                email: z.string().email().min(1, {
                    message: 'Maintainer Email is required',
                }),
            })
        )
        .min(1, {
            message:
                'At least one (1) Maintainer Name and Maintainer Email is required.',
        }),
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
    spatial_address: z.string().optional().nullable(),
    spatial: z.any().optional(),
    spatial_type: z
        .enum(['address', 'geom', 'global', 'derived_from_resources'])
        .optional(),
    release_notes: z.string().optional(),
});

export const DatasetSchema = DatasetSchemaObject.refine(
    (obj) => {
        if (!obj.featured_dataset) return true;
        // ODP-520
        //if (obj.featured_dataset && !obj.featured_image) return false
        return true;
    },
    {
        message: 'An image is required for featured Datasets',
        path: ['featured_image'],
    }
)
    .refine(
        (obj) => {
            if (!obj.rw_dataset) return true;
            if (obj.rw_dataset && !obj.connectorType) return false;
            return true;
        },
        {
            message: 'Connector Type is required for RW Datasets',
            path: ['connectorType'],
        }
    )
    .refine(
        (obj) => {
            if (!obj.rw_dataset) return true;
            if (obj.rw_dataset && !obj.connectorType) return false;
            return true;
        },
        {
            message: 'Provider is required for RW Datasets',
            path: ['provider'],
        }
    )
    .refine(
        (obj) => {
            if (!obj.rw_dataset) return true;
            if (obj.rw_dataset && !obj.connectorUrl && !obj.tableName)
                return false;
            return true;
        },
        {
            message:
                'ConnectorUrl is required for RW Datasets, unless a table name is provided',
            path: ['connectorUrl'],
        }
    )
    .refine(
        (obj) => {
            if (!obj.rw_dataset) return true;
            if (obj.rw_dataset && !obj.connectorUrl && !obj.tableName)
                return false;
            return true;
        },
        {
            message:
                'Tablename is required for RW Datasets, unless a connectorUrl is provided',
            path: ['tableName'],
        }
    )
    .refine(
        (obj) => {
            if (obj.visibility_type.value !== 'public') return true;
            if (!obj.technical_notes) return false;
            return true;
        },
        {
            message: 'Technical notes are required for public Datasets',
            path: ['technical_notes'],
        }
    )
    .refine(
        (obj) => {
            if (obj.authors.length === 0) return false;
            return true;
        },
        {
            message: 'At least one (1) Author Name is required.',
            path: ['authors'],
        }
    )
    .refine(
        (obj) => {
            if (obj.maintainers.length === 0) return false;
            return true;
        },
        {
            message:
                'At least one (1) Maintainer Name and Maintainer Email is required.',
            path: ['maintainers'],
        }
    )
    .refine(
        (obj) => {
            if (
                (obj.visibility_type.value === 'public' ||
                    obj.visibility_type.value === 'internal') &&
                obj.team.visibility === 'private'
            )
                return false;
            return true;
        },
        {
            message: 'Public Dataset cannot be assigned to private Team',
            path: ['visibility_type'],
        }
    )
    .refine(
        (obj) => {
            if (!obj.team?.value) return false;
            return true;
        },
        {
            message: 'Team is required for all Datasets',
            path: ['team'],
        }
    );

export const DatasetSchemaForEdit = DatasetSchemaObject.partial();
export type VisibilityTypeUnion = z.infer<typeof visibilityTypeSchema>;
export type UpdateFrequencyUnion = z.infer<typeof updateFrequencySchema>;
export type DatasetTypeInfoUnion = z.infer<typeof datasetTypeInfoSchema>;
export type CapacityUnion = z.infer<typeof capacitySchema>;

export type DataDictionaryFormType = z.infer<typeof DataDictionarySchema>;
export type DatasetFormType = z.infer<typeof DatasetSchema>;
export type ResourceFormType = z.infer<typeof ResourceSchema>;
