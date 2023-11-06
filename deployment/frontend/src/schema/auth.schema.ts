import z from 'zod'

export const SignInSchema = z.object({
    username: z.string().min(1, 'Please, provide an username'),
    password: z.string().min(1, 'Please, provide a password'),
})

export type SignInFormType = z.infer<typeof SignInSchema>

export const ResetPasswordSchema = z.object({ email: z.string().email() })

export type ResetPasswordFormType = z.infer<typeof ResetPasswordSchema>
