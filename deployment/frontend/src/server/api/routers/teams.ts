import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'
import { env } from '@/env.mjs'
import { CkanResponse, Collaborator } from '@/schema/ckan.schema'
import { Organization } from '@portaljs/ckan'
import { TeamSchema } from '@/schema/team.schema'
import { z } from 'zod'
import { replaceNames } from '@/utils/replaceNames'
import { searchSchema } from '@/schema/search.schema'
import type { GroupTree, GroupsmDetails } from '@/schema/ckan.schema'
import { getGroups, getAllOrganizations, searchHierarchy, findAllNameInTree } from '@/utils/apiUtils'
import { findNameInTree } from '@/utils/apiUtils'

export const teamRouter = createTRPCRouter({
    getAllTeams: protectedProcedure.query(async ({ ctx }) => {
        const user = ctx.session.user
        const teamsMap = new Map()
        const teamsList = await Promise.all(
            [0, 1, 2, 3, 4, 5].map(async (i) => {
                const teamRes = await fetch(
                    user.sysadmin
                        ? `${
                              env.CKAN_URL
                          }/api/action/organization_list?all_fields=True&limit=${
                              (i + 1) * 25
                          }&offset=${i * 25}`
                        : `${
                              env.CKAN_URL
                          }/api/action/organization_list_for_user?all_fields=True&limit=${
                              (i + 1) * 25
                          }&offset=${i * 25}`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `${user.apikey}`,
                        },
                    }
                )
                const teams: CkanResponse<Organization[]> = await teamRes.json()
                if (!teams.success && teams.error) {
                    if (teams.error.message)
                        throw Error(replaceNames(teams.error.message, true))
                    throw Error(replaceNames(JSON.stringify(teams.error), true))
                }
                teams.result.forEach((team) => {
                    if (teamsMap.has(team.id)) return
                    teamsMap.set(team.id, team)
                })
            })
        )
        return Array.from(teamsMap.values())
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
                    groups:
                        input.parent && input.parent.value !== ''
                            ? [{ name: input.parent.value }]
                            : [],
                })
                const teamRes = await fetch(
                    `${env.CKAN_URL}/api/action/organization_patch`,
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
                    if (team.error.message)
                        throw Error(replaceNames(team.error.message, true))
                    throw Error(replaceNames(JSON.stringify(team.error), true))
                }
                return team.result
            } catch (e) {
                let error =
                    'Something went wrong please contact the system administrator'
                if (e instanceof Error) error = e.message
                throw Error(replaceNames(error, true))
            }
        }),
    getTeam: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const user = ctx.session.user
            const teamRes = await fetch(
                `${env.CKAN_URL}/api/action/organization_show?id=${input.id}&include_users=True`,
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
                if (team.error.message)
                    throw Error(replaceNames(team.error.message, true))
                throw Error(replaceNames(JSON.stringify(team.error), true))
            }
            return {
                ...team.result,
            }
        }),
    getTeamUsers: protectedProcedure
        .input(z.object({ id: z.string(), capacity: z.string().optional() }))
        .query(async ({ ctx, input }) => {
            const user = ctx.session.user
            const membersListRes = await fetch(
                `${env.CKAN_URL}/api/action/member_list?id=${input.id}${input.capacity ? `&capacity=${input.capacity}` : ''}&object_type=user`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${user.apikey}`,
                    },
                }
            )
            const membersList: CkanResponse<string[][]> = await membersListRes.json()
            console.log('MEMBER LIST', membersList)
            return membersList.result
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
                    groups:
                        input.parent && input.parent.value !== ''
                            ? [{ name: input.parent.value }]
                            : [],
                })
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
                    if (team.error.message)
                        throw Error(replaceNames(team.error.message, true))
                    throw Error(replaceNames(JSON.stringify(team.error), true))
                }
                return team.result
            } catch (e) {
                let error =
                    'Something went wrong please contact the system administrator'
                if (e instanceof Error) error = e.message
                throw Error(replaceNames(error, true))
            }
        }),
    deleteDashboardTeam: protectedProcedure
        .input(z.string())
        .mutation(async ({ input, ctx }) => {
            const response = await fetch(
                `${env.CKAN_URL}/api/3/action/organization_delete`,
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
                throw Error(replaceNames(data.error.message, true))
            return data
        }),
    getGeneralTeam: publicProcedure
        .input(searchSchema)
        .query(async ({ input, ctx }) => {
            let groupTree: GroupTree[] = []
            const allGroups = (await getAllOrganizations({ apiKey: ctx?.session?.user.apikey ?? "" }))!
            

            const teamDetails = allGroups.reduce((acc, org) => {
                acc[org.id] = {
                    img_url: org.image_display_url ?? "",
                    description: org.description ?? "",
                    package_count: org.package_count,
                }
                return acc
            }
                , {} as Record<string, GroupsmDetails>)
            
            if (input.search) {
                groupTree = await searchHierarchy({ isSysadmin: true, apiKey: ctx?.session?.user.apikey ?? "", q: input.search, group_type: 'organization' })
                
                if (input.tree) {
                    let groupFetchTree = groupTree[0] as GroupTree
                    const findTree = findNameInTree(groupFetchTree, input.search)
                    if (findTree) {
                        groupFetchTree = findTree
                    }
                    groupTree = [groupFetchTree]
                }

                if (input.allTree) {
                    const filterTree = groupTree.flatMap((group) => {
                        const search = input.search.toLowerCase()
                        if ( group.name.toLowerCase().includes(search) || group.title?.toLowerCase().includes(search) ) return [group]
                        const findtree = findAllNameInTree(group, input.search)
                        return findtree
                    })
                    
                    groupTree = filterTree
                }
                
            }
            else {
                
                groupTree = await getGroups({
                    apiKey: ctx?.session?.user.apikey ?? "",
                    group_type: "organization"
                })
                
            }

            const result = groupTree
            return {
                teams: result,
                teamsDetails: teamDetails,
                count: result.length,
            }
        }),
})
