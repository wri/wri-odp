import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { env } from '@/env.mjs'
import { getGroups, getGroup, searchHierarchy, getUserGroups } from '@/utils/apiUtils'
import { searchSchema } from '@/schema/search.schema'
import type { GroupTree } from '@/schema/ckan.schema'
import { searchArrayForKeyword } from '@/utils/general'
import type { CkanResponse } from '@/schema/ckan.schema'
import type { Group } from '@portaljs/ckan'
import Topic, { TopicHierarchy } from '@/interfaces/topic.interface'

import { TopicSchema } from '@/schema/topic.schema'
import { replaceNames } from '@/utils/replaceNames'

export const TopicRouter = createTRPCRouter({
    getUsersTopics: protectedProcedure
        .input(searchSchema)
        .query(async ({ input, ctx }) => {
            let groupTree: GroupTree[] = []
            const allGroups = (await getUserGroups({ apiKey: ctx.session.user.apikey, userId: ctx.session.user.id }))!
            const topic2Image = allGroups.reduce((acc, org) => {
                acc[org.id] = org.image_display_url!
                return acc
            }
                , {} as Record<string, string>)
            if (input.search) {
                groupTree = await searchHierarchy({ isSysadmin: ctx.session.user.sysadmin, apiKey: ctx.session.user.apikey, q: input.search, group_type: 'group' })
            }
            else {
                if (ctx.session.user.sysadmin) {
                    groupTree = await getGroups({
                        apiKey: ctx.session.user.apikey,
                    })
                }
                else {
                    groupTree = await searchHierarchy({ isSysadmin: ctx.session.user.sysadmin, apiKey: ctx.session.user.apikey, group_type: 'group' })
                }
            }

            const result = groupTree
            return {
                topics: result.slice(
                    input.page.start,
                    input.page.start + input.page.rows
                ),
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
            const _userTopics: CkanResponse<Group[]> = await userTopicsRes.json()
            if (!_userTopics.success && _userTopics.error) throw Error(replaceNames(_userTopics.error.message))
            userTopics = _userTopics.result.map((topic) => topic.name)
        }
        const tree: CkanResponse<TopicHierarchy[]> =
            await topicHierarchyRes.json()
        if (!tree.success && tree.error) throw Error(replaceNames(tree.error.message))
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
        if (!topics.success && topics.error) throw Error(replaceNames(topics.error.message))
        return topics.result.filter((topic) => topic.state === 'active')
    }),
    editTopic: protectedProcedure
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
                    if (topic.error.message) throw Error(replaceNames(topic.error.message))
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
            if (!topic.success && topic.error) throw Error(replaceNames(topic.error.message))
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
                if (topic.error.message) throw Error(replaceNames(topic.error.message))
                throw Error(replaceNames(JSON.stringify(topic.error)))
            }
            console.log(topic)
            return {
                ...topic.result,
            }
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
                    if (topic.error.message) throw Error(replaceNames(topic.error.message))
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
            if (!data.success && data.error) throw Error(replaceNames(data.error.message))
            return data
        }),
})
