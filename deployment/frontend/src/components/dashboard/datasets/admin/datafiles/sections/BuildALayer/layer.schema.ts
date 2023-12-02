import { z } from 'zod'
const emptyStringToUndefined = z.literal('').transform(() => undefined)
const nanToUndefined = z.literal(NaN).transform(() => undefined)

const sourceSchema = z
    .object({
        provider: z.object({
            type: z.object({
                value: z.enum(['gee', 'carto', 'wms', 'featureservice']),
                label: z.string(),
            }),
            account: z.string().optional().nullable(),
            layers: z
                .array(
                    z.object({
                        options: z.object({
                            sql: z.string().optional().nullable(),
                            type: z.string().default('cartodb'),
                        }),
                    })
                )
                .default([]),
        }),
        minzoom: z.number().optional(),
        maxzoom: z.number().optional(),
        tiles: z.string().url().optional().nullable(),
    })
    //Make sure that maxZoom is always bigger than minZoom
    .refine(
        (obj) => {
            if (obj.provider.type.value === 'carto')
                return (
                    obj.provider.type.value === 'carto' &&
                    obj.provider.account &&
                    obj.provider.account.length > 0
                )
            return true
        },
        {
            path: ['provider.account'],
            message:
                'Informing an account is required when the provider is setup as cartodb',
        }
    )

const numericExpression = z
    .object({
        coercion: z.literal('to-number').default('to-number'),
        operation: z.literal('get').default('get'),
        column: z
            .object({
                value: z.string(),
                label: z.string(),
            })
            .optional()
            .nullable(),
    })
    .default({
        coercion: 'to-number',
        operation: 'get',
        column: { value: '', label: '' },
    })

const filterExpression = z.object({
    operation: z
        .object({
            value: z.enum(['==', '<=', '>=', '>', '<']),
            label: z.string(),
        })
        .optional()
        .nullable(),
    column: z.string().optional().nullable(),
    value: z.coerce.number().optional().nullable(),
})

const rampObj = z
    .object({
        type: z.object({
            value: z.enum([
                'step',
                'interpolate',
                'interpolate-lab',
                'interpolate-hcl',
            ]),
            label: z.string(),
        }),
        interpolationType: z
            .object({
                value: z.enum(['linear', 'exponential', 'cubic-bezier']),
                label: z.string(),
            })
            .optional()
            .nullable()
            .default({ value: 'linear', label: 'Linear' }),
        input: z.union([z.number(), numericExpression]),
        output: z.array(
            z.object({
                color: z.string(),
                value: z.number().optional().nullable(),
            })
        ),
    })
    .transform((val) => {
        if (val.type.value === 'step') {
            return {
                ...val,
                interpolationType: null,
            }
        }
        return val
    })

const colorPattern = z
    .union([z.string(), rampObj])
    .optional()
    .nullable()
    .or(emptyStringToUndefined)

const renderSchema = z.object({
    layers: z.array(
        z.object({
            type: z.object({
                value: z.enum(['circle', 'line', 'fill']),
                label: z.string(),
            }),
            'source-layer': z.string().default('layer0'),
            paint: z
                .object({
                    'fill-color': colorPattern,
                    'fill-opacity': z.coerce
                        .number()
                        .optional()
                        .nullable()
                        .or(nanToUndefined)
                        .transform((val) => {
                            if (val && isNaN(val)) return undefined
                            if (val === 0) return undefined
                            return val
                        }),
                    'line-color': colorPattern,
                    'line-opacity': z.coerce
                        .number()
                        .optional()
                        .nullable()
                        .or(nanToUndefined)
                        .transform((val) => {
                            if (val && isNaN(val)) return undefined
                            if (val === 0) return undefined
                            return val
                        }),
                    'line-width': z.coerce
                        .number()
                        .optional()
                        .nullable()
                        .or(nanToUndefined)
                        .transform((val) => {
                            if (val && isNaN(val)) return undefined
                            if (val === 0) return undefined
                            return val
                        }),
                    'circle-color': colorPattern,
                    'circle-radius': z.coerce
                        .number()
                        .optional()
                        .nullable()
                        .or(nanToUndefined)
                        .transform((val) => {
                            if (val && isNaN(val)) return undefined
                            if (val === 0) return undefined
                            return val
                        }),
                    'circle-opacity': z.coerce
                        .number()
                        .optional()
                        .nullable()
                        .or(nanToUndefined)
                        .transform((val) => {
                            if (val && isNaN(val)) return undefined
                            if (val === 0) return undefined
                            return val
                        }),
                })
                .optional()
                .nullable(),
            filter: z.array(z.literal('all').or(filterExpression)),
        })
    ),
})

const legendsSchema = z.object({
    type: z.enum(['basic', 'choropleth', 'gradient']),
    items: z.array(
        z.object({
            color: z
                .string()
                .length(7, 'It needs to be 7 characters long')
                .regex(/^#/, 'Must start with #'),
            name: z.string(),
        })
    ),
})

const interactionConfigSchema = z.object({
    output: z.array(
        z.object({
            column: z.string().optional().nullable(),
            format: z.string().optional().nullable(),
            prefix: z.string().optional().nullable(),
            property: z.string().optional().nullable(),
            suffix: z.string().optional().nullable(),
            type: z.string().optional().nullable(),
            enabled: z.boolean().default(false)
        })
    ),
})

export const layerSchema = z
    .object({
        id: z.string().uuid().optional().nullable().or(emptyStringToUndefined),
        account: z.string().optional().nullable().or(emptyStringToUndefined),
        type: z.object({
            value: z.enum(['raster', 'vector']),
            label: z.string(),
        }),
        connectorUrl: z
            .string()
            .url()
            .optional()
            .nullable()
            .default('https://wri-rw.carto.com:443/api/v2/sql?q='),
        legendConfig: legendsSchema.optional().nullable(),
        source: sourceSchema.optional().nullable(),
        render: renderSchema.optional().nullable(),
        interactionConfig: interactionConfigSchema.optional().nullable(),
    })
    .refine(
        (obj) => {
            if (
                obj.type.value === 'raster' &&
                obj.source?.provider.type.value === 'wms'
            )
                return (
                    obj.type.value === 'raster' &&
                    obj.source?.tiles &&
                    obj.source?.tiles.length > 0
                )
            return true
        },
        {
            path: ['tiles'],
            message: 'Tiles are required for raster layers',
        }
    )

export type ColorPatternType = z.infer<typeof colorPattern>
export type LayerFormType = z.infer<typeof layerSchema>
export type SourceFormType = z.infer<typeof sourceSchema>
export type RenderFormType = z.infer<typeof renderSchema>
export type LegendsFormType = z.infer<typeof legendsSchema>
