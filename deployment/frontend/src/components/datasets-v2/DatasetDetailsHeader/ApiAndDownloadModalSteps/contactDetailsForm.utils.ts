import { z } from 'zod';

export const contactDetailsFormSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    organization: z.string().optional(),
    jobTitle: z.string().optional(),
    email: z.string().email('Enter a valid email'),
});

export type ContactDetailsFormData = z.infer<typeof contactDetailsFormSchema>;
export type ContactDetailsFieldErrors = Partial<Record<keyof ContactDetailsFormData, string>>;
