import { z } from 'zod'
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from '@/server/api/trpc'
import { env } from '@/env.mjs'
import type { Application } from '@/schema/ckan.schema'
import type { CkanResponse, User } from '@/schema/ckan.schema'
import type { Group } from '@portaljs/ckan'

import { ApplicationSchema } from '@/schema/application.schema'
import { replaceNames } from '@/utils/replaceNames'
import { sendMemberNotifications } from '@/utils/apiUtils'

export const applicationRouter = createTRPCRouter({
    getAllApplications: publicProcedure.query(async ({ ctx }) => {
        const apikey = ctx.session?.user.apikey ?? ''
        const applicationRes = await fetch(
            `${env.CKAN_URL}/api/action/group_list?all_fields=True&type=application`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${apikey}`,
                },
            }
        )
        const applications: CkanResponse<Application[]> = await applicationRes.json()
        if (!applications.success && applications.error)
            throw Error(replaceNames(applications.error.message))
        return applications.result.filter(
            (application) => application.state === 'active'
        )
    }),
    editApplication: protectedProcedure
        .input(ApplicationSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                const user = ctx.session.user
                const body = JSON.stringify({
                    ...input,
                    type: 'application'
                })
                const applicationRes = await fetch(
                    `${env.CKAN_URL}/api/action/group_patch`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `${user.apikey}`,
                        },
                        body,
                    }
                )
                const application: CkanResponse<Application> =
                    await applicationRes.json()
                if (!application.success && application.error) {
                    if (application.error.message)
                        throw Error(replaceNames(application.error.message))
                    throw Error(replaceNames(JSON.stringify(application.error)))
                }
                return application.result
            } catch (e) {
                let error =
                    'Something went wrong please contact the system administrator'
                if (e instanceof Error) error = e.message
                throw Error(replaceNames(error))
            }
        }),
    getApplication: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const apikey = ctx.session?.user.apikey ?? ''
            const applicationRes = await fetch(
                `${env.CKAN_URL}/api/action/group_show?id=${input.id}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${apikey}`,
                    },
                }
            )
            const application: CkanResponse<
                Application
            > = await applicationRes.json()
            if (!application.result) throw Error('Application not found')
            if (!application.success && application.error)
                throw Error(replaceNames(application.error.message))
            return {
                ...application.result,
            }
        }),
    deleteApplication: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const user = ctx.session.user
            const applicationRes = await fetch(
                `${env.CKAN_URL}/api/action/group_delete`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${user.apikey}`,
                    },
                    body: JSON.stringify({ id: input.id }),
                }
            )
            const application: CkanResponse<Application> =
                await applicationRes.json()
            if (!application.success && application.error) {
                if (application.error.message)
                    throw Error(replaceNames(application.error.message))
                throw Error(replaceNames(JSON.stringify(application.error)))
            }
            return {
                ...application.result,
            }
        }),
    createApplication: protectedProcedure
        .input(ApplicationSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                const user = ctx.session.user
                const body = JSON.stringify({
                    ...input,
                    type: 'application'
                })
                const applicationRes = await fetch(
                    `${env.CKAN_URL}/api/action/group_create`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `${user.apikey}`,
                        },
                        body,
                    }
                )
                const application: CkanResponse<Group> =
                    await applicationRes.json()
                if (!application.success && application.error) {
                    if (application.error.message)
                        throw Error(replaceNames(application.error.message))
                    throw Error(replaceNames(JSON.stringify(application.error)))
                }
                return application.result
            } catch (e) {
                let error =
                    'Something went wrong please contact the system administrator'
                if (e instanceof Error) error = e.message
                throw Error(replaceNames(error))
            }
        }),
    deleteDashBoardApplication: protectedProcedure
        .input(z.string())
        .mutation(async ({ input, ctx }) => {
            const response = await fetch(
                `${env.CKAN_URL}/api/3/action/group_delete`,
                {
                    method: 'POST',
                    body: JSON.stringify({ id: input }),
                    headers: {
                        Authorization: ctx.session.user.apikey,
                        'Content-Type': 'application/json',
                    },
                }
            )
            const data = (await response.json()) as CkanResponse<null>
            if (!data.success && data.error)
                throw Error(replaceNames(data.error.message))
            return data
        }),
    list: publicProcedure.query(async ({ ctx, input }) => {
        const applicationRes = await fetch(
            `${env.CKAN_URL}/api/action/group_list?all_fields=True`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )
        const application: CkanResponse<Group[]> = await applicationRes.json()
        if (!application.success && application.error)
            throw Error(replaceNames(application.error.message))
        return {
            applications: application.result,
        }
    }),
})
