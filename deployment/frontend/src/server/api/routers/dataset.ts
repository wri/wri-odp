import { z } from 'zod'
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from '@/server/api/trpc'
import { env } from '@/env.mjs'
import { getUserOrganizations, getAllDatasetFq } from '@/utils/apiUtils'
import { searchSchema } from '@/schema/search.schema'

export const DatasetRouter = createTRPCRouter({
    getAllDataset: protectedProcedure
        .input(searchSchema)
        .query(async ({ input, ctx }) => {
            const isUserSearch = input._isUserSearch

            let fq = ''
            let orgsFq = ''
            if (isUserSearch) {
                const organizations = await getUserOrganizations({
                    userId: ctx.session.user.id,
                    apiKey: ctx.session.user.apikey,
                })
                orgsFq = `organization:(${organizations
                    ?.map((org) => org.name)
                    .join(' OR ')})`
            }

            const fqArray = []
            if (input.fq) {
                for (const key of Object.keys(input.fq)) {
                    if (key === 'organization') {
                        orgsFq = `organization:(${input.fq[key]})`
                        continue
                    }
                    fqArray.push(`${key}:(${input.fq[key]})`)
                }
                const filter = fqArray.join('+')

                if (filter && orgsFq) fq = `${orgsFq}+${filter}`
                else if (filter) {
                    fq = filter
                } else {
                    fq = orgsFq
                }
            } else {
                fq = orgsFq
            }

            const dataset = (await getAllDatasetFq({
                apiKey: ctx.session.user.apikey,
                fq: fq,
                query: input,
                facetFields: input.facetFields,
                sortBy: input.sortBy
            }))!

            return {
                datasets: dataset.datasets,
                count: dataset.count,
                searchFacets: dataset.searchFacets,
            }
        }),
    getMyDataset: protectedProcedure
        .input(searchSchema)
        .query(async ({ input, ctx }) => {
            const dataset = (await getAllDatasetFq({
                apiKey: ctx.session.user.apikey,
                fq: `creator_user_id:${ctx.session.user.id}`,
                query: input,
            }))!
            return {
                datasets: dataset.datasets,
                count: dataset.count,
            }
        }),
    getFavoriteDataset: protectedProcedure
        .input(searchSchema)
        .query(async ({ input, ctx }) => {
            const dataset = (await getAllDatasetFq({
                apiKey: ctx.session.user.apikey,
                fq: `featured_dataset:true`,
                query: input,
            }))!
            return {
                datasets: dataset.datasets,
                count: dataset.count,
            }
        }),
    getDraftDataset: protectedProcedure
        .input(searchSchema)
        .query(async ({ input, ctx }) => {
            const dataset = (await getAllDatasetFq({
                apiKey: ctx.session.user.apikey,
                fq: `state:draft`,
                query: input,
            }))!
            return {
                datasets: dataset.datasets,
                count: dataset.count,
            }
        }),
})
