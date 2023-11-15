import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { env } from '@/env.mjs'
import { CkanResponse } from '@/schema/ckan.schema'

export const tagsRouter = createTRPCRouter({
    getAllTags: protectedProcedure.query(async ({ ctx }) => {
        const user = ctx.session.user
        const tagsRes = await fetch(
            `${env.CKAN_URL}/api/action/tag_list`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${user.apikey}`,
                },
            }
        )
        const tags: CkanResponse<string[]> = await tagsRes.json()
        return tags.result
    }),
})
