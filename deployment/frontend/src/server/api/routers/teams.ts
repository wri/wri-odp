import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from '@/server/api/trpc'
import { env } from '@/env.mjs'
import { CkanResponse, Collaborator } from '@/schema/ckan.schema'
import { Organization } from '@portaljs/ckan'
import { TeamSchema } from '@/schema/team.schema'
import { z } from 'zod'
import { replaceNames } from '@/utils/replaceNames'
import { searchSchema } from '@/schema/search.schema'
import type {
    GroupTree,
    GroupsmDetails,
    User,
    WriOrganization,
} from '@/schema/ckan.schema'
import {
    getGroups,
    getAllOrganizations,
    searchHierarchy,
    findAllNameInTree,
    getAllDatasetFq,
} from '@/utils/apiUtils'
import { findNameInTree, sendMemberNotifications } from '@/utils/apiUtils'
import { json } from 'stream/consumers'
import { flattenTree } from '@/utils/flattenGroupTree'

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
                var newMembers = []
                for (const member of input.members) {
                    newMembers.push({
                        name: member.user.value,
                        capacity: member.capacity.value,
                    })
                }
                try {
                    sendMemberNotifications(
                        user.id,
                        newMembers,
                        input.users,
                        input.id,
                        'team'
                    )
                } catch (e) {
                    console.error(e)
                }
                input.users = newMembers
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
                `${env.CKAN_URL}/api/action/organization_show?id=${input.id}&include_users=True&include_extras=true`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${user.apikey}`,
                    },
                }
            )
            const team: CkanResponse<
                WriOrganization & {
                    groups: Organization[]
                    extras: { key: string; value: string }[]
                }
            > = await teamRes.json()
            return {
                ...team.result,
                parent: team.result.groups[0]?.name ?? null,
                visibility:
                    team.result.extras.find(
                        (extra) => extra.key === 'visibility'
                    )?.value ?? 'public',
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
                `${env.CKAN_URL}/api/action/member_list?id=${input.id}${
                    input.capacity ? `&capacity=${input.capacity}` : ''
                }&object_type=user`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${user.apikey}`,
                    },
                }
            )
            const membersList: CkanResponse<string[][]> =
                await membersListRes.json()
            return membersList.result
        }),
    createTeam: protectedProcedure
        .input(TeamSchema)
        .mutation(async ({ ctx, input }) => {
            console.log('INPUT TEAM', input)
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
                    extras: [
                        {
                            key: 'visibility',
                            value: input.visibility.value,
                        },
                    ],
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
            const allGroups = (await getAllOrganizations({
                apiKey: ctx?.session?.user.apikey ?? '',
            }))!

            const teamDetails = allGroups.reduce(
                (acc, org) => {
                    acc[org.id] = {
                        img_url: org.image_display_url ?? '',
                        description: org.description ?? '',
                        package_count: org.package_count!,
                        name: org.name,
                    }
                    return acc
                },
                {} as Record<string, GroupsmDetails>
            )

            for (const group in teamDetails) {
                const team = teamDetails[group]!
                const packagedetails = (await getAllDatasetFq({
                    apiKey: ctx?.session?.user.apikey ?? '',
                    fq: `organization:${team.name}+is_approved:true`,
                    query: { search: '', page: { start: 0, rows: 10000 } },
                }))!
                team.package_count = packagedetails.count
            }

            groupTree = groupTree.filter((x) => x.name === input.search)
            if (input.search) {
                groupTree = await searchHierarchy({
                    isSysadmin: true,
                    apiKey: ctx?.session?.user.apikey ?? '',
                    q: input.search,
                    group_type: 'organization',
                })

                if (input.tree) {
                    for (const gtree of groupTree) {
                        const findtree = findNameInTree(gtree, input.search)
                        if (findtree) {
                            groupTree = [findtree]
                            break
                        }
                    }
                }

                if (input.allTree) {
                    const filterTree = groupTree.flatMap((group) => {
                        const search = input.search.toLowerCase()
                        if (
                            group.name.toLowerCase().includes(search) ||
                            group.title?.toLowerCase().includes(search)
                        )
                            return [group]
                        const findtree = findAllNameInTree(group, input.search)
                        return findtree
                    })

                    groupTree = filterTree
                }
            } else {
                groupTree = await getGroups({
                    apiKey: ctx?.session?.user.apikey ?? '',
                    group_type: 'organization',
                })
            }

            const result = groupTree
            return {
                teams: result,
                teamsDetails: teamDetails,
                count: result.length,
            }
        }),
    getPossibleMembers: protectedProcedure
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
            if (!team.success && team.error) {
                if (team.error.message)
                    throw Error(replaceNames(team.error.message, true))
                throw Error(replaceNames(JSON.stringify(team.error), true))
            }
            const teamUsers = team?.result?.users?.map(
                (user) => user.name
            ) as string[]
            const usersRes = await fetch(
                `${env.CKAN_URL}/api/action/user_list?all_fields=True&limit=1000`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${user.apikey}`,
                    },
                }
            )
            const users: CkanResponse<User[]> = await usersRes.json()
            if (!users.success && users.error) {
                if (users.error.message)
                    throw Error(replaceNames(users.error.message, true))
                throw Error(replaceNames(JSON.stringify(users.error), true))
            }

            return users.result.filter(
                (user) => user.name && !teamUsers.includes(user.name)
            )
        }),
    getCurrentMembers: protectedProcedure
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
            if (!team.success && team.error) {
                if (team.error.message)
                    throw Error(replaceNames(team.error.message, true))
                throw Error(replaceNames(JSON.stringify(team.error), true))
            }

            return team.result.users
        }),
    list: publicProcedure.query(async ({ ctx, input }) => {
        const teamRes = await fetch(
            `${env.CKAN_URL}/api/action/organization_list?all_fields=True`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )
        const team: CkanResponse<Organization[]> = await teamRes.json()
        if (!team.success && team.error)
            throw Error(replaceNames(team.error.message))
        return {
            teams: team.result,
        }
    }),
    getNumberOfSubTeams: publicProcedure.query(async ({ ctx, input }) => {
        const teamRes = await fetch(
            `${env.CKAN_URL}/api/action/organization_list_wri?q=`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )
        const team: CkanResponse<GroupTree[]> = await teamRes.json()
        if (!team.success && team.error)
            throw Error(replaceNames(team.error.message))
        const numOfSubtopics = flattenTree(team.result)
        return numOfSubtopics
    }),
    removeMember: protectedProcedure
        .input(z.object({ id: z.string(), username: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const user = ctx.session.user
            const teamRes = await fetch(
                `${env.CKAN_URL}/api/action/member_delete`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${user.apikey}`,
                    },
                    body: JSON.stringify({
                        id: input.id,
                        object: input.username,
                        object_type: 'user',
                    }),
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
            return team.result
        }),
})
