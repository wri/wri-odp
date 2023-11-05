import z from 'zod'

export const TopicSchema = z.object({
    id: z.string().optional(),
    name: z
        .string()
        .regex(
            /^[^\(\) +]+$/,
            'The name cant have spaces nor the dot(.) character, it needs to be URL Compatible'
        ),
    title: z.string(),
    image_display_url: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
})

export type TopicFormType = z.infer<typeof TopicSchema>
