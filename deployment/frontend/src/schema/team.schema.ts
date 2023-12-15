import { Option } from '@/components/_shared/SimpleSelect'
import z from 'zod'

const capacitySchema = z.enum(['admin', 'editor', 'member'])


export const MemberSchema = z.object({
    user: z.object({ value: z.string(), label: z.string() }),
    team_id: z.string(),
    capacity: z.object({
        value: capacitySchema,
        label: z.string(),
    }),
})

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
    members: z.array(MemberSchema).default([]),
    users: z.array(z.object({ name: z.string(), capacity: z.string() })).default([]),
})

export type TeamFormType = z.infer<typeof TeamSchema>
export type MemberFormType = z.infer<typeof MemberSchema>
