import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { env } from '@/env.mjs'
import { getGroups, getGroup } from '@/utils/apiUtils'
import { searchSchema } from '@/schema/search.schema'
import type { GroupTree } from '@/schema/ckan.schema'
import { searchArrayForKeyword } from '@/utils/general'
import { CkanResponse } from '@/schema/ckan.schema'
import { Group } from '@portaljs/ckan'
import Topic, { TopicHierarchy } from '@/interfaces/topic.interface'

import { TopicSchema } from '@/schema/topic.schema'

export const TopicRouter = createTRPCRouter({
    getUsersTopics: protectedProcedure
        .input(searchSchema)
        .query(async ({ input, ctx }) => {
            const groupTree = await getGroups({
                apiKey: ctx.session.user.apikey,
            })
            const groupDetails = await Promise.all(
                groupTree.map(async (group) => {
                    const groupDetails = await getGroup({
                        apiKey: ctx.session.user.apikey,
                        id: group.id,
                    })
                    const rgroup = {
                        ...group,
                        image_display_url: groupDetails?.image_display_url,
                    }
                    rgroup.children.map(async (child) => {
                        const childDetails = await getGroup({
                            apiKey: ctx.session.user.apikey,
                            id: child.id,
                        })
                        child.image_display_url =
                            childDetails?.image_display_url
                        return child
                    })
                    return group
                })
            )
            let result = groupDetails
            if (input.search) {
                result = searchArrayForKeyword<GroupTree>(
                    groupDetails,
                    input.search
                )
            }
            return {
                topics: result.slice(
                    input.page.start,
                    input.page.start + input.page.rows
                ),
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
        const tree: CkanResponse<TopicHierarchy[]> =
            await topicHierarchyRes.json()
        if (!tree.success && tree.error) throw Error(tree.error.message)
        return tree.result
    }),
    getAllTopics: protectedProcedure.query(async ({ ctx }) => {
        const user = ctx.session.user
        const topicRes = await fetch(
            `${env.CKAN_URL}/api/action/group_list?all_fields=True`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${user.apikey}`,
                },
            }
        )
        const topics: CkanResponse<Group[]> = await topicRes.json()
        if (!topics.success && topics.error) throw Error(topics.error.message)
        return topics.result
    }),
    editTopic: protectedProcedure
        .input(TopicSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                const user = ctx.session.user
                const body = JSON.stringify({
                    ...input,
                    groups: input.parent ? [{ name: input.parent }] : [],
                })
                const topicRes = await fetch(
                    `${env.CKAN_URL}/api/action/group_update`,
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
                    if (topic.error.message) throw Error(topic.error.message)
                    throw Error(JSON.stringify(topic.error))
                }
                return topic.result
            } catch (e) {
                let error =
                    'Something went wrong please contact the system administrator'
                if (e instanceof Error) error = e.message
                throw Error(error)
            }
        }),
    getTopic: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const user = ctx.session.user
            const topicRes = await fetch(
                `${env.CKAN_URL}/api/action/group_show?id=${input.id}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${user.apikey}`,
                    },
                }
            )
            const topic: CkanResponse<Topic & { groups: Topic[] }> =
                await topicRes.json()
            if (!topic.success && topic.error) throw Error(topic.error.message)
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
                if (topic.error.message) throw Error(topic.error.message)
                throw Error(JSON.stringify(topic.error))
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
                    groups: input.parent ? [{ name: input.parent }] : [],
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
                    if (topic.error.message) throw Error(topic.error.message)
                    throw Error(JSON.stringify(topic.error))
                }
                return topic.result
            } catch (e) {
                let error =
                    'Something went wrong please contact the system administrator'
                if (e instanceof Error) error = e.message
                throw Error(error)
            }
        }),
    deleteDashBoardTopic: protectedProcedure
        .input(z.string())
        .mutation(async ({ input, ctx }) => {
            const response = await fetch(`${env.CKAN_URL}/api/3/action/group_delete`, {
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

});
