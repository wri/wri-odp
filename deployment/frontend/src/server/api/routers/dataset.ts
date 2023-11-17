import { z } from 'zod'
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from '@/server/api/trpc'
import { env } from '@/env.mjs'
import {
    getUserOrganizations,
    getAllDatasetFq,
    getUserGroups,
} from '@/utils/apiUtils'
import { searchSchema } from '@/schema/search.schema'
import type { CkanResponse } from '@/schema/ckan.schema'
import { DatasetSchema } from '@/schema/dataset.schema'
import type { Dataset } from '@/interfaces/dataset.interface'
import type { License } from '@/interfaces/licenses.interface'

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
                    open_in: input.open_in ? { ...input.open_in } : '',
                    language: input.language?.value ?? '',
                    owner_org: input.team ? input.team.value : '',
                    update_frequency: input.update_frequency?.value ?? '',
                    featured_image:
                        input.featured_image && input.featured_dataset
                            ? `${env.CKAN_URL}/uploads/group/${input.featured_image}`
                            : null,
                    visibility_type: input.visibility_type?.value ?? '',
                    resources: input.resources.map((resource) => ({
                        ...resource,
                        format: resource.format ?? '',
                        id: resource.resourceId,
                        url_type: resource.type,
                        schema: resource.dataDictionary
                            ? { schema: resource.dataDictionary }
                            : '{}',
                        dataDictionary: null,
                        url: resource.url ?? resource.name,
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
                    if (dataset.error.message)
                        throw Error(dataset.error.message)
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
    getAllDataset: publicProcedure
        .input(searchSchema)
        .query(async ({ input, ctx }) => {
            const isUserSearch = input._isUserSearch

            let fq = ''
            let orgsFq = ''
            if (isUserSearch && ctx.session) {
                const organizations = await getUserOrganizations({
                    userId: ctx.session?.user.id,
                    apiKey: ctx.session?.user.apikey,
                })
                orgsFq = `organization:(${organizations
                    ?.map((org) => org.name)
                    .join(' OR ')})`
            }

            const fqArray = []
            if (input.fq) {
                let temporalCoverageFqList = []
                for (const key of Object.keys(input.fq)) {
                    if (key === 'organization') {
                        orgsFq = `organization:(${input.fq[key]})`
                        continue
                    }
                    if (
                        [
                            'temporal_coverage_start',
                            'temporal_coverage_end',
                        ].includes(key)
                    ) {
                        /*
                         * Temporal coverage has to behave as a range
                         * so it's handled differently
                         */
                        temporalCoverageFqList.push(`${key}:(${input.fq[key]})`)
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

                if (temporalCoverageFqList.length)
                    fq += `+(${temporalCoverageFqList
                        .map((f) => `(${f})`)
                        .join(' OR ')})`
            } else {
                fq = orgsFq
            }

            const dataset = (await getAllDatasetFq({
                apiKey: ctx.session?.user.apikey ?? '',
                fq: fq,
                query: input,
                facetFields: input.facetFields,
                sortBy: input.sortBy,
            }))!

            return {
                datasets: dataset.datasets,
                count: dataset.count,
                searchFacets: dataset.searchFacets,
            }
        }),
    getOneDataset: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            const user = ctx.session?.user
            const datasetRes = await fetch(
                `${env.CKAN_URL}/api/action/package_show?id=${input.id}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${user?.apikey ?? ''}`,
                    },
                }
            )
            const dataset: CkanResponse<Dataset> = await datasetRes.json()
            if (!dataset.success && dataset.error) {
                if (dataset.error.message) throw Error(dataset.error.message)
                throw Error(JSON.stringify(dataset.error))
            }
            return dataset.result
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
    getLicenses: protectedProcedure.query(async ({ ctx }) => {
        const user = ctx.session.user
        const licensesRes = await fetch(
            `${env.CKAN_URL}/api/action/license_list`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${user.apikey}`,
                },
            }
        )
        const licenses: CkanResponse<License[]> = await licensesRes.json()
        if (!licenses.success && licenses.error) {
            if (licenses.error.message) throw Error(licenses.error.message)
            throw Error(JSON.stringify(licenses.error))
        }
        return licenses.result
    }),
    getFormats: protectedProcedure
        .input(z.object({ q: z.string() }))
        .query(async ({ ctx, input }) => {
            const user = ctx.session.user
            const formatRes = await fetch(
                `${env.CKAN_URL}/api/action/format_autocomplete?q=${input.q}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${user.apikey}`,
                    },
                }
            )
            const formats: CkanResponse<string[]> = await formatRes.json()
            return formats.result ?? []
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
    deleteDataset: protectedProcedure
        .input(z.string())
        .mutation(async ({ input, ctx }) => {
            const response = await fetch(
                `${env.CKAN_URL}/api/3/action/package_delete`,
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
            if (!data.success && data.error) throw Error(data.error.message)
            return data
        }),
})
