import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { env } from '@/env.mjs'
import { CkanResponse } from '@/schema/ckan.schema'
import { Group } from '@portaljs/ckan'
import { TopicSchema } from '@/schema/topic.schema'
import { z } from 'zod'
export const topicRouter = createTRPCRouter({
    editTopic: protectedProcedure
        .input(TopicSchema)
        .mutation(async ({ ctx, input }) => {
            const user = ctx.session.user
            const topicRes = await fetch(
                `${env.CKAN_URL}/api/action/group_update`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${user.apikey}`,
                    },
                    body: JSON.stringify(input),
                }
            )
            const topic: CkanResponse<Group> = await topicRes.json()
            return topic
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
                        Authorization: `Bearer ${user.apikey}`,
                    },
                }
            )
            const topic: CkanResponse<Group> = await topicRes.json()
            return topic
        }),
    createTopic: protectedProcedure
        .input(TopicSchema)
        .mutation(async ({ ctx, input }) => {
            const user = ctx.session.user
            const topicRes = await fetch(
                `${env.CKAN_URL}/api/action/group_create`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${user.apikey}`,
                    },
                    body: JSON.stringify(input),
                }
            )
            const topic: CkanResponse<Group> = await topicRes.json()
            return topic
        }),
})
