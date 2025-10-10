import z from 'zod'

export const SignInSchema = z.object({
    username: z.string().min(1, 'Please, provide an username'),
    password: z.string().min(1, 'Please, provide a password'),
})

export type SignInFormType = z.infer<typeof SignInSchema>

export const RequestResetPasswordSchema = z.object({
    email: z.string().email(),
})

export type RequestResetPasswordFormType = z.infer<
    typeof RequestResetPasswordSchema
>

export const ResetPasswordSchema = z
    .object({
        password: z.string().min(8, 'Password must be at least 8 characters'),
        confirm_password: z.string(),
        reset_key: z.string(),
        id: z.string(),
    })
    .refine((data) => data.password === data.confirm_password, {
        message: "Passwords don't match",
        path: ['confirm'],
    })

export type ResetPasswordFormType = z.infer<typeof ResetPasswordSchema>
