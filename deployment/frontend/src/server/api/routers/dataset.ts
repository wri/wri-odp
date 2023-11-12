import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { env } from '@/env.mjs'
import { getUserOrganizations, getAllDatasetFq } from '@/utils/apiUtils'
import { searchSchema } from '@/schema/search.schema'
import { DatasetSchema } from '@/schema/dataset.schema'
import { Dataset } from '@portaljs/ckan'
import { CkanResponse } from '@/schema/ckan.schema'

export const DatasetRouter = createTRPCRouter({
    createDataset: protectedProcedure
        .input(DatasetSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                const user = ctx.session.user
                const body = JSON.stringify({
                    ...input,
                    tags: input.tags
                        ? input.tags.map((tag) => ({ name: tag }))
                        : [],
                    groups: input.topics
                        ? input.topics.map((topic) => ({ name: topic }))
                        : [],
                    language: input.language?.value ?? '',
                    owner_org: input.team.value,
                    update_frequency: input.update_frequency?.value ?? '',
                    visibility_type: input.visibility_type?.value ?? '',
                    resources: input.resources.map((resource) => ({
                        ...resource,
                        format: resource.format?.value ?? '',
                        id: resource.resourceId,
                        url_type: resource.type,
                        url:
                            resource.type === 'upload'
                                ? `${env.CKAN_URL}/dataset/${input.id}/resource/${resource.resourceId}/${resource.name}`
                                : resource.url,
                    })),
                    temporal_coverage:
                        input.temporalCoverageStart && input.temporalCoverageEnd
                            ? `[${input.temporalCoverageStart},${input.temporalCoverageEnd}]`
                            : null,
                })
                const datasetRes = await fetch(
                    `${env.CKAN_URL}/api/action/package_create`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `${user.apikey}`,
                        },
                        body,
                    }
                )
                const dataset: CkanResponse<Dataset> = await datasetRes.json()
                if (!dataset.success && dataset.error) {
                    if (dataset.error.message) throw Error(dataset.error.message)
                    throw Error(JSON.stringify(dataset.error))
                }
                return dataset.result
            } catch (e) {
                let error =
                    'Something went wrong please contact the system administrator'
                if (e instanceof Error) error = e.message
                throw Error(error)
            }
        }),
    getAllDataset: protectedProcedure
        .input(searchSchema)
        .query(async ({ input, ctx }) => {
            const organizations = await getUserOrganizations({
                userId: ctx.session.user.id,
                apiKey: ctx.session.user.apikey,
            })
            let orgsFq = `organization:(${organizations
                ?.map((org) => org.name)
                .join(' OR ')})`
            const fq = []
            if (input.fq) {
                for (const key of Object.keys(input.fq)) {
                    if (key === 'organization') {
                        orgsFq = `organization:(${input.fq[key]})`
                        continue
                    }
                    fq.push(`${key}:(${input.fq[key]})`)
                }
                const filter = fq.join('+')
                if (filter) orgsFq = `${orgsFq}+${filter}`
            }
            const dataset = (await getAllDatasetFq({
                apiKey: ctx.session.user.apikey,
                fq: orgsFq,
                query: input,
            }))!
            return {
                datasets: dataset.datasets,
                count: dataset.count,
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
