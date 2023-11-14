import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { env } from '@/env.mjs'
import { CkanResponse } from '@/schema/ckan.schema'
import { Organization } from '@portaljs/ckan'
import { TeamSchema } from '@/schema/team.schema'
import { z } from 'zod'
export const teamRouter = createTRPCRouter({
    getAllTeams: protectedProcedure.query(async ({ ctx }) => {
        console.log(env.CKAN_URL)
        const user = ctx.session.user
        const teamRes = await fetch(
            `${env.CKAN_URL}/api/action/organization_list?all_fields=True`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${user.apikey}`,
                },
            }
        )
        const teams: CkanResponse<Organization[]> = await teamRes.json()
        return teams.result
    }),
    editTeam: protectedProcedure
        .input(TeamSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                const user = ctx.session.user
                const body = JSON.stringify({
                    ...input,
                    image_display_url: input.image_url
                        ? `${env.CKAN_URL}/uploads/group/${input.image_url}`
                        : null,
                    groups: input.parent ? [{ name: input.parent }] : [],
                })
                const teamRes = await fetch(
                    `${env.CKAN_URL}/api/action/organization_update`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `${user.apikey}`,
                        },
                        body,
                    }
                )
                const team: CkanResponse<Organization> = await teamRes.json()
                if (!team.success && team.error) {
                    if (team.error.message) throw Error(team.error.message)
                    throw Error(JSON.stringify(team.error))
                }
                return team.result
            } catch (e) {
                let error =
                    'Something went wrong please contact the system administrator'
                if (e instanceof Error) error = e.message
                throw Error(error)
            }
        }),
    getTeam: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const user = ctx.session.user
            const teamRes = await fetch(
                `${env.CKAN_URL}/api/action/organization_show?id=${input.id}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${user.apikey}`,
                    },
                }
            )
            const team: CkanResponse<
                Organization & { groups: Organization[] }
            > = await teamRes.json()
            return {
                ...team.result,
                parent: team.result.groups[0]?.name ?? null,
            }
        }),
    deleteTeam: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const user = ctx.session.user
            const teamRes = await fetch(
                `${env.CKAN_URL}/api/action/organization_delete`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${user.apikey}`,
                    },
                    body: JSON.stringify({ id: input.id }),
                }
            )
            const team: CkanResponse<
                Organization & { groups: Organization[] }
            > = await teamRes.json()
            if (!team.success && team.error) {
                if (team.error.message) throw Error(team.error.message)
                throw Error(JSON.stringify(team.error))
            }
            return {
                ...team.result,
            }
        }),
    createTeam: protectedProcedure
        .input(TeamSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                const user = ctx.session.user
                const body = JSON.stringify({
                    ...input,
                    image_display_url: input.image_url
                        ? `${env.CKAN_URL}/uploads/group/${input.image_url}`
                        : null,
                    groups: input.parent ? [{ name: input.parent }] : [],
                })
                console.log(user)
                const teamRes = await fetch(
                    `${env.CKAN_URL}/api/action/organization_create`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `${user.apikey}`,
                        },
                        body,
                    }
                )
                const team: CkanResponse<Organization> = await teamRes.json()
                if (!team.success && team.error) {
                    if (team.error.message) throw Error(team.error.message)
                    throw Error(JSON.stringify(team.error))
                }
                return team.result
            } catch (e) {
                let error =
                    'Something went wrong please contact the system administrator'
                if (e instanceof Error) error = e.message
                throw Error(error)
            }
        }),
    deleteDashboardTeam: protectedProcedure
        .input(z.string())
        .mutation(async ({ input, ctx }) => {
            const response = await fetch(`${env.CKAN_URL}/api/3/action/organization_delete`, {
                method: "POST",
                body: JSON.stringify({ id: input }),
                headers: {
                    "Authorization": ctx.session.user.apikey,
                    "Content-Type": "application/json"
                }
            });
            const data = (await response.json()) as CkanResponse<null>;
            if (!data.success && data.error) throw Error(data.error.message)
            return data
        })
})
