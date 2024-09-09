import { z } from 'zod'
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from '@/server/api/trpc'
import { env } from '@/env.mjs'
import {
    getGroups,
    getGroup,
    searchHierarchy,
    getUserGroups,
    findAllNameInTree,
    getAllDatasetFq,
} from '@/utils/apiUtils'
import { searchSchema } from '@/schema/search.schema'
import type {
    FolloweeList,
    GroupTree,
    GroupsmDetails,
} from '@/schema/ckan.schema'
import { searchArrayForKeyword } from '@/utils/general'
import type { CkanResponse, User } from '@/schema/ckan.schema'
import type { Group } from '@portaljs/ckan'
import Topic, { TopicHierarchy } from '@/interfaces/topic.interface'

import { TopicSchema } from '@/schema/topic.schema'
import { replaceNames } from '@/utils/replaceNames'
import { findNameInTree, sendMemberNotifications } from '@/utils/apiUtils'

export const TopicRouter = createTRPCRouter({
    getUsersTopics: protectedProcedure
        .input(searchSchema)
        .query(async ({ input, ctx }) => {
            let groupTree: GroupTree[] = []
            const allGroups = (await getUserGroups({
                apiKey: ctx.session.user.apikey,
                userId: ctx.session.user.id,
            }))!
            const topic2Image = allGroups.reduce(
                (acc, org) => {
                    acc[org.id] = org.image_display_url!
                    return acc
                },
                {} as Record<string, string>
            )
            if (input.search) {
                groupTree = await searchHierarchy({
                    isSysadmin: ctx.session.user.sysadmin,
                    apiKey: ctx.session.user.apikey,
                    q: input.search,
                    group_type: 'group',
                })
            } else {
                if (ctx.session.user.sysadmin) {
                    groupTree = await getGroups({
                        apiKey: ctx.session.user.apikey,
                    })
                } else {
                    groupTree = await searchHierarchy({
                        isSysadmin: ctx.session.user.sysadmin,
                        apiKey: ctx.session.user.apikey,
                        group_type: 'group',
                    })
                }
            }

            const result = groupTree
            return {
                topics: input.pageEnabled
                    ? result.slice(
                          input.page.start,
                          input.page.start + input.page.rows
                      )
                    : result,
                topic2Image: topic2Image,
                count: result.length,
            }
        }),
    getTopicsHierarchy: protectedProcedure.query(async ({ ctx }) => {
        const user = ctx.session.user
        const topicHierarchyRes = await fetch(
            `${env.CKAN_URL}/api/action/group_tree`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${user.apikey}`,
                },
            }
        )
        let userTopics = null
        if (!user.sysadmin) {
            const userTopicsRes = await fetch(
                `${env.CKAN_URL}/api/action/group_list_authz`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${user.apikey}`,
                    },
                }
            )
            const _userTopics: CkanResponse<Group[]> =
                await userTopicsRes.json()
            if (!_userTopics.success && _userTopics.error)
                throw Error(replaceNames(_userTopics.error.message))
            userTopics = _userTopics.result.map((topic) => topic.name)
        }
        const tree: CkanResponse<TopicHierarchy[]> =
            await topicHierarchyRes.json()
        if (!tree.success && tree.error)
            throw Error(replaceNames(tree.error.message))
        return { hierarchy: tree.result, userTopics }
    }),
    getAllTopics: protectedProcedure.query(async ({ ctx }) => {
        const user = ctx.session.user
        const topicRes = await fetch(
            user.sysadmin
                ? `${env.CKAN_URL}/api/action/group_list?all_fields=True`
                : `${env.CKAN_URL}/api/action/group_list_authz?all_fields=True`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${user.apikey}`,
                },
            }
        )
        const topics: CkanResponse<Group[]> = await topicRes.json()
        if (!topics.success && topics.error)
            throw Error(replaceNames(topics.error.message))
        return topics.result.filter((topic) => topic.state === 'active')
    }),
    editTopic: protectedProcedure
        .input(TopicSchema)
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
                        'topic'
                    )
                } catch (e) {
                    console.error(e)
                }
                input.users = newMembers
                const body = JSON.stringify({
                    ...input,
                    groups:
                        input.parent && input.parent.value !== ''
                            ? [{ name: input.parent.value }]
                            : [],
                })
                const topicRes = await fetch(
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
                const topic: CkanResponse<Group> = await topicRes.json()
                if (!topic.success && topic.error) {
                    if (topic.error.message)
                        throw Error(replaceNames(topic.error.message))
                    throw Error(replaceNames(JSON.stringify(topic.error)))
                }
                return topic.result
            } catch (e) {
                let error =
                    'Something went wrong please contact the system administrator'
                if (e instanceof Error) error = e.message
                throw Error(replaceNames(error))
            }
        }),
    getTopic: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const user = ctx.session.user
            const topicRes = await fetch(
                `${env.CKAN_URL}/api/action/group_show?id=${input.id}&include_users=True`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${user.apikey}`,
                    },
                }
            )
            const topic: CkanResponse<Topic & { groups: Topic[] }> =
                await topicRes.json()
            if (!topic.success && topic.error)
                throw Error(replaceNames(topic.error.message))
            return {
                ...topic.result,
                parent: topic.result.groups[0]?.name ?? null,
            }
        }),
    deleteTopic: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const user = ctx.session.user
            const topicRes = await fetch(
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
            const topic: CkanResponse<Topic> = await topicRes.json()
            if (!topic.success && topic.error) {
                if (topic.error.message)
                    throw Error(replaceNames(topic.error.message))
                throw Error(replaceNames(JSON.stringify(topic.error)))
            }
            return {
                ...topic.result,
            }
        }),
    getTopicUsers: protectedProcedure
        .input(z.object({ id: z.string(), capacity: z.string() }))
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
    createTopic: protectedProcedure
        .input(TopicSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                const user = ctx.session.user
                const body = JSON.stringify({
                    ...input,
                    groups:
                        input.parent && input.parent.value !== ''
                            ? [{ name: input.parent.value }]
                            : [],
                })
                const topicRes = await fetch(
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
                const topic: CkanResponse<Group> = await topicRes.json()
                if (!topic.success && topic.error) {
                    if (topic.error.message)
                        throw Error(replaceNames(topic.error.message))
                    throw Error(replaceNames(JSON.stringify(topic.error)))
                }
                return topic.result
            } catch (e) {
                let error =
                    'Something went wrong please contact the system administrator'
                if (e instanceof Error) error = e.message
                throw Error(replaceNames(error))
            }
        }),
    deleteDashBoardTopic: protectedProcedure
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
    getGeneralTopics: publicProcedure
        .input(searchSchema)
        .query(async ({ input, ctx }) => {
            let groupTree: GroupTree[] = []
            const allGroups = (await getUserGroups({
                apiKey: ctx?.session?.user.apikey ?? '',
                userId: '',
            }))!
            const topicDetails = allGroups.reduce(
                (acc, org) => {
                    acc[org.id] = {
                        img_url: org.image_display_url,
                        description: org.description,
                        package_count: org.package_count,
                        name: org.name,
                    }
                    return acc
                },
                {} as Record<string, GroupsmDetails>
            )

            for (const group in topicDetails) {
                const topic = topicDetails[group]!
                const packagedetails = (await getAllDatasetFq({
                    apiKey: ctx?.session?.user.apikey ?? '',
                    fq: `groups:${topic.name}+is_approved:true`,
                    query: { search: '', page: { start: 0, rows: 10000 } },
                }))!
                topic.package_count = packagedetails.count
            }

            if (input.search) {
                groupTree = await searchHierarchy({
                    isSysadmin: true,
                    apiKey: ctx?.session?.user.apikey ?? '',
                    q: input.search,
                    group_type: 'group',
                })
                groupTree = groupTree.filter((x) => x.name === input.search)
                if (input.tree) {
                    let groupFetchTree = groupTree[0] as GroupTree
                    const findTree = findNameInTree(
                        groupFetchTree,
                        input.search
                    )
                    if (findTree) {
                        groupFetchTree = findTree
                    }
                    groupTree = [groupFetchTree]
                }
                if (input.allTree) {
                    const filterTree = groupTree.flatMap((group) => {
                        const search = input.search.toLowerCase()
                        if (
                            group.name.toLowerCase().includes(search) ||
                            group.title?.toLowerCase().includes(search)
                        )
                            return [group]
                        const findtree = findAllNameInTree(group, search)
                        return findtree
                    })
                    groupTree = filterTree
                }
            } else {
                groupTree = await getGroups({
                    apiKey: ctx?.session?.user.apikey ?? '',
                })
            }

            const result = groupTree
            return {
                topics: result,
                topicDetails: topicDetails,
                count: result.length,
            }
        }),
    getTopicV2: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const user = ctx.session.user
            const topicRes = await fetch(
                `${env.CKAN_URL}/api/action/group_show?id=${input.id}&include_users=True`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${user.apikey}`,
                    },
                }
            )
            const topic: CkanResponse<Group> = await topicRes.json()
            if (!topic.success && topic.error)
                throw Error(replaceNames(topic.error.message))
            return {
                topic: topic.result,
            }
        }),

    getFollowedTopics: protectedProcedure.query(async ({ ctx }) => {
        const response = await fetch(
            `${env.CKAN_URL}/api/3/action/followee_list?id=${ctx.session.user.id}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${ctx.session.user.apikey}`,
                },
            }
        )
        const data = (await response.json()) as CkanResponse<FolloweeList[]>
        if (!data.success && data.error) throw Error(data.error.message)
        const result = data.result.reduce((acc, item) => {
            if (item.type === 'group') {
                const t = item.dict as Group
                acc.push(t)
            }
            return acc
        }, [] as Group[])
        return result
    }),
    getPossibleMembers: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const user = ctx.session.user
            const topicRes = await fetch(
                `${env.CKAN_URL}/api/action/group_show?id=${input.id}&include_users=True`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${user.apikey}`,
                    },
                }
            )
            const topic: CkanResponse<Topic & { groups: Topic[] }> =
                await topicRes.json()
            if (!topic.success && topic.error) {
                if (topic.error.message)
                    throw Error(replaceNames(topic.error.message))
                throw Error(replaceNames(JSON.stringify(topic.error)))
            }
            const topicUsers = topic?.result?.users?.map(
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
                    throw Error(replaceNames(users.error.message))
                throw Error(replaceNames(JSON.stringify(users.error)))
            }

            return users.result.filter(
                (user) => user.name && !topicUsers.includes(user.name)
            )
        }),
    getCurrentMembers: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const user = ctx.session.user
            const topicRes = await fetch(
                `${env.CKAN_URL}/api/action/group_show?id=${input.id}&include_users=True`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${user.apikey}`,
                    },
                }
            )
            const topic: CkanResponse<Topic & { groups: Topic[] }> =
                await topicRes.json()
            if (!topic.success && topic.error) {
                if (topic.error.message)
                    throw Error(replaceNames(topic.error.message, true))
                throw Error(replaceNames(JSON.stringify(topic.error), true))
            }

            return topic.result.users
        }),
    removeMember: protectedProcedure
        .input(z.object({ id: z.string(), username: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const user = ctx.session.user
            const topicRes = await fetch(
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
            const topic: CkanResponse<Topic & { groups: Topic[] }> =
                await topicRes.json()
            if (!topic.success && topic.error) {
                if (topic.error.message)
                    throw Error(replaceNames(topic.error.message, true))
                throw Error(replaceNames(JSON.stringify(topic.error), true))
            }
            return topic.result
        }),
})
