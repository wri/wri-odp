import { z } from 'zod'

export const viewFormSchema = z.object({
    title: z.string().min(1),
    description: z.string(),
    view_type: z.literal('custom'),
    config_obj: z.object({
        type: z.enum(['chart']),
        config: z.any(),
        form_state: z.any(),
    }),
})

export type ViewFormSchema = z.infer<typeof viewFormSchema>

export const createViewFormSchema = viewFormSchema.and(
    z.object({ resource_id: z.string() })
)

export type CreateViewFormSchema = z.infer<typeof createViewFormSchema>

export const editViewFormSchema = createViewFormSchema.and(
    z.object({ id: z.string() })
)

export type EditViewFormSchema = z.infer<typeof createViewFormSchema>

export const chartSchema = z.object({
    title: z.string().min(1, 'Please insert a title'),
    // description: z.string(),
    config: z.object({
        chart: z.object({
            type: z
                .object({
                    value: z.enum(['bar', 'scatter'], {
                        errorMap: () => ({
                            message: 'Please select a chart type',
                        }),
                    }),
                    label: z.string(),
                })
                .required(),

            sorting: z
                .object({
                    by: z
                        .object({
                            value: z.string().optional(),
                            label: z.string(),
                        })
                        .optional(),
                    order: z.object({
                        value: z.string().optional(),
                        label: z.string(),
                    }),
                })
                .optional(),
            labels: z.object({
                x: z
                    .object({
                        text: z.string().optional(),
                        angle: z
                            .object({
                                value: z.literal('auto').or(z.number()),
                                label: z.string(),
                            })
                            .optional(),
                    })
                    .optional(),
                y: z
                    .object({
                        text: z.string().optional(),
                        angle: z
                            .object({
                                value: z.literal('auto').or(z.number()),
                                label: z.string(),
                            })
                            .optional(),
                    })
                    .optional(),
            }),
            legends: z.object({
                enabled: z
                    .object({
                        label: z.string(),
                        value: z.boolean().default(false),
                    })
                    .optional(),
                title: z.string().optional(),
            }),
            tooltips: z.object({
                enabled: z
                    .object({
                        label: z.string(),
                        value: z.boolean().default(true),
                    })
                    .optional(),
                format: z.string().optional(),
            }),
            colors: z.object({ starting: z.string(), ending: z.string() }),
        }),
        query: z.object({
            dimension: z
                .object({
                    value: z
                        .string({
                            errorMap: () => ({
                                message: 'Please select a dimension',
                            }),
                        })
                        .min(1),
                    label: z.string(),
                })
                .required(),
            category: z
                .object({ value: z.string().optional(), label: z.string() })
                .optional(),
            measure: z.object({
                value: z
                    .string({
                        errorMap: () => ({
                            message: 'Please select a measure',
                        }),
                    })
                    .min(1),
                label: z.string(),
            }),
            aggregate: z
                .object({ value: z.string().optional(), label: z.string() })
                .optional(),
            filters: z.array(
                z.object({
                    column: z.string(),
                    operation: z.object({
                        value: z.string(),
                        label: z.string(),
                    }),
                    value: z.string(),
                    link: z.string().default("OR")
                })
            ).optional(),
        }),
    }),
})

export type ChartFormType = z.infer<typeof chartSchema>
