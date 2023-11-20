import { Option } from '@/components/_shared/SimpleSelect'
import z from 'zod'

export const TeamSchema = z.object({
    id: z.string().optional(),
    name: z
        .string()
        .regex(
            /^[^\(\) +]+$/,
            'The name cant have spaces nor the dot(.) character, it needs to be URL Compatible'
        ),
    title: z.string(),
    image_display_url: z.string().optional().nullable(),
    image_url: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    parent: z
        .object({
            value: z.string(),
            label: z.string(),
        })
        .optional(),
})

export type TeamFormType = z.infer<typeof TeamSchema>
