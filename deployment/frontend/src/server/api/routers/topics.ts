import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { env } from '@/env.mjs'
import { CkanResponse } from '@/schema/ckan.schema'
import { Group } from '@portaljs/ckan'
import { TopicSchema } from '@/schema/topic.schema'
import { z } from 'zod'
import Topic from '@/interfaces/topic.interface'
export const topicRouter = createTRPCRouter({
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
                if (!topic.success && topic.error) throw Error(topic.error.message)
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
                `${env.CKAN_URL}/api/action/topic_show?id=${input.id}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${user.apikey}`,
                    },
                }
            )
            const topic: CkanResponse<
                Topic & { groups: Topic[] }
            > = await topicRes.json()
            if (!topic.success && topic.error) throw Error(topic.error.message)
            return {
                ...topic.result,
                parent: topic.result.groups[0]?.name ?? null,
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
                if (!topic.success && topic.error) throw Error(topic.error.message)
                return topic.result
            } catch (e) {
                let error =
                    'Something went wrong please contact the system administrator'
                if (e instanceof Error) error = e.message
                throw Error(error)
            }
        }),
})
