import { env } from '@/env.mjs'
import { User } from '@/interfaces/user.interface'
import {
    RequestResetPasswordSchema,
    ResetPasswordSchema,
} from '@/schema/auth.schema'
import { CkanResponse } from '@/schema/ckan.schema'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import ky from 'ky'

export const authRouter = createTRPCRouter({
    requestPasswordReset: publicProcedure
        .input(RequestResetPasswordSchema)
        .mutation(async ({ input }) => {
            try {
                const userUpdate: CkanResponse<string> = await ky
                    .post(`${env.CKAN_URL}/api/3/action/password_reset`, {
                        json: {
                            email: input.email,
                        },
                    })
                    .json()

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
                const userShow: CkanResponse<User> = await ky
                    .post(
                        `${env.CKAN_URL}/api/3/action/user_show?id=${input.id}`,
                        {
                            headers: {
                                Authorization: env.SYS_ADMIN_API_KEY,
                            },
                        }
                    )
                    .json()

      console.log(input)
                const userUpdate: CkanResponse<User> = await ky
                    .post(`${env.CKAN_URL}/api/3/action/user_update`, {
                        json: {
                            ...userShow.result,
                            password: input.password,
                            reset_key: input.reset_key,
                        },
                    })
                    .json()

                return userUpdate
            } catch (e) {
                console.log(e)
                throw new Error(
                    'Failed to reset password. Try again in a few seconds. If the error persists, please contact the system administrator.'
                )
            }
        }),
})
