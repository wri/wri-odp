import { env } from '@/env.mjs'
import { User } from '@/interfaces/user.interface'
import {
    RequestResetPasswordSchema,
    ResetPasswordSchema,
} from '@/schema/auth.schema'
import { CkanResponse } from '@/schema/ckan.schema'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'

export const authRouter = createTRPCRouter({
    requestPasswordReset: publicProcedure
        .input(RequestResetPasswordSchema)
        .mutation(async ({ input }) => {
            try {
                const userUpdate: CkanResponse<string> = await (
                    await fetch(`${env.CKAN_URL}/api/3/action/password_reset`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: input.email,
                        }),
                    })
                ).json()
                return userUpdate
            } catch (e) {
                console.log(e)
                throw new Error(
                    'Failed to request password reset. Try again in a few seconds. If the error persists, please contact the system administrator.'
                )
            }
        }),
    resetPassword: publicProcedure
        .input(ResetPasswordSchema)
        .mutation(async ({ input }) => {
            try {
                const userShow: CkanResponse<User> = await (
                    await fetch(
                        `${env.CKAN_URL}/api/action/user_show?id=${input.id}`,
                        {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `${env.SYS_ADMIN_API_KEY}`,
                            },
                        }
                    )
                ).json()

                if (userShow.error) {
                    throw userShow.error
                }

                const userUpdate: CkanResponse<User> = await (
                    await fetch(`${env.CKAN_URL}/api/3/action/user_update`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            ...userShow.result,
                            password: input.password,
                            reset_key: input.reset_key,
                        }),
                    })
                ).json()

                if (userUpdate.error) {
                    throw userUpdate.error
                }

                return userUpdate
            } catch (e) {
                console.log(e)
                throw new Error(
                    'Failed to reset password. Try again in a few seconds. If the error persists, please contact the system administrator.'
                )
            }
        }),
})
