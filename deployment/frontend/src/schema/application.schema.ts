import { Option } from '@/components/_shared/SimpleSelect'
import z from 'zod'
const emptyStringToUndefined = z.literal('').transform(() => undefined)

export const ApplicationSchema = z.object({
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
    contact_url: z.string().url().optional().nullable().or(emptyStringToUndefined),
    help_url: z.string().url().optional().nullable().or(emptyStringToUndefined),
})

export type ApplicationFormType = z.infer<typeof ApplicationSchema>
