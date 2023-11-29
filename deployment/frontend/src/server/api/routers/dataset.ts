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
    getOneDataset,
    getAllUsers,
    upsertCollaborator,
} from '@/utils/apiUtils'
import { searchSchema } from '@/schema/search.schema'
import type {
    CkanResponse,
    Collaborator,
    Issue,
    WriDataset,
    WriUser,
    FolloweeList,
} from '@/schema/ckan.schema'
import { DatasetSchema, ResourceSchema } from '@/schema/dataset.schema'
import type { Dataset, Resource } from '@/interfaces/dataset.interface'
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
                    license_id: input.license_id?.value ?? '',
                    owner_org: input.team ? input.team.value : '',
                    collaborators: null,
                    update_frequency: input.update_frequency?.value ?? '',
                    featured_image:
                        input.featured_image && input.featured_dataset
                            ? `${env.CKAN_URL}/uploads/group/${input.featured_image}`
                            : null,
                    visibility_type: input.visibility_type?.value ?? '',
                    resources: input.resources
                        .filter((resource) => resource.type !== 'empty')
                        .map((resource) => ({
                            ...resource,
                            format: resource.format ?? '',
                            id: resource.resourceId,
                            url_type: resource.type,
                            schema: resource.schema
                                ? { value: resource.schema }
                                : '{}',
                            url: resource.url ?? resource.name,
                        })),
                    spatial:
                        input.spatial && input.spatial_address
                            ? null
                            : JSON.stringify(input.spatial)
                            ? JSON.stringify(input.spatial)
                            : null,
                    spatial_address: input.spatial_address
                        ? input.spatial_address
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
    editDataset: protectedProcedure
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
                    license_id: input.license_id?.value ?? '',
                    owner_org: input.team ? input.team.value : '',
                    collaborators: null,
                    update_frequency: input.update_frequency?.value ?? '',
                    featured_image:
                        input.featured_image && input.featured_dataset
                            ? `${env.CKAN_URL}/uploads/group/${input.featured_image}`
                            : null,
                    visibility_type: input.visibility_type?.value ?? '',
                    resources: input.resources
                        .filter((resource) => resource.type !== 'empty')
                        .map((resource) => ({
                            ...resource,
                            format: resource.format ?? '',
                            id: resource.resourceId,
                            new: false,
                            url_type: resource.type,
                            schema: resource.schema
                                ? { value: resource.schema }
                                : '{}',
                            url: resource.url ?? resource.name,
                        })),
                    spatial:
                        input.spatial && input.spatial_address
                            ? null
                            : JSON.stringify(input.spatial)
                            ? JSON.stringify(input.spatial)
                            : null,
                    spatial_address: input.spatial_address
                        ? input.spatial_address
                        : null,
                })
                const datasetRes = await fetch(
                    `${env.CKAN_URL}/api/action/package_patch`,
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
                const collaborators = await Promise.all(
                    (input.collaborators ?? []).map(async (collaborator) => {
                        return await upsertCollaborator(
                            {
                                package_id: collaborator.package_id,
                                user_id: collaborator.user.value,
                                capacity: collaborator.capacity.value,
                            },
                            ctx.session
                        )
                    })
                )
                return { ...dataset.result, collaborators }
            } catch (e) {
                let error =
                    'Something went wrong please contact the system administrator'
                if (e instanceof Error) error = e.message
                throw Error(error)
            }
        }),
    editResource: protectedProcedure
        .input(ResourceSchema)
        .mutation(async ({ ctx, input }) => {
            console.log('Input', input)
            try {
                const user = ctx.session.user
                const body = JSON.stringify({
                    ...input,
                    format: input.format ?? '',
                    new: false,
                    url_type: input.type,
                    schema: input.schema ? { value: input.schema } : '{}',
                    url: input.url ?? input.name,
                })
                const resourceRes = await fetch(
                    `${env.CKAN_URL}/api/action/resource_patch`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `${user.apikey}`,
                        },
                        body,
                    }
                )
                const resource: CkanResponse<Resource> =
                    await resourceRes.json()
                if (!resource.success && resource.error) {
                    if (resource.error.message)
                        throw Error(resource.error.message)
                    throw Error(JSON.stringify(resource.error))
                }

                return resource.result
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
            let fq = `" "`
            let orgsFq = ''

            const fqArray = []
            if (input.fq) {
                let temporalCoverageFqList = []
                for (const key of Object.keys(input.fq)) {
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
                        .join(' AND ')})`
            }

            const dataset = (await getAllDatasetFq({
                apiKey: ctx.session?.user.apikey ?? '',
                fq: fq,
                query: input,
                facetFields: input.facetFields,
                sortBy: input.sortBy,
                extLocationQ: input.extLocationQ,
                extAddressQ: input.extAddressQ
            }))!

            return {
                datasets: dataset.datasets,
                count: dataset.count,
                searchFacets: dataset.searchFacets,
            }
        }),
    getDatasetCollaborators: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            const user = ctx.session?.user
            const collaboratorsRes = await fetch(
                `${env.CKAN_URL}/api/action/package_collaborator_list?id=${input.id}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${user?.apikey ?? ''}`,
                    },
                }
            )
            const collaborators: CkanResponse<Collaborator[]> =
                await collaboratorsRes.json()
            console.log('Collaborators', collaborators)
            if (!collaborators.success && collaborators.error) {
                if (collaborators.error.message)
                    throw Error(collaborators.error.message)
                throw Error(JSON.stringify(collaborators.error))
            }
            const collaboratorsWithDetails = await Promise.all(
                collaborators.result.map(async (collaborator) => {
                    const userRes = await fetch(
                        `${env.CKAN_URL}/api/action/user_show?id=${collaborator.user_id}`,
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: env.SYS_ADMIN_API_KEY,
                            },
                        }
                    )
                    const user: CkanResponse<WriUser> = await userRes.json()
                    if (!user.success && user.error) {
                        if (user.error.message) throw Error(user.error.message)
                        throw Error(JSON.stringify(user.error))
                    }
                    return { ...collaborator, ...user.result }
                })
            )
            return collaboratorsWithDetails
        }),
    getDatasetIssues: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            const user = ctx.session?.user
            const issuesRes = await fetch(
                `${env.CKAN_URL}/api/action/issue_search?dataset_id=${input.id}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${user?.apikey ?? ''}`,
                    },
                }
            )
            const issues: CkanResponse<{ count: number; results: Issue[] }> =
                await issuesRes.json()
            console.log('Issues', issues)
            if (!issues.success && issues.error) {
                if (issues.error.message) throw Error(issues.error.message)
                throw Error(JSON.stringify(issues.error))
            }
            const issuesWithDetails = await Promise.all(
                issues.result.results.map(async (issue) => {
                    console.log('Issue', issue)
                    const detailsRes = await fetch(
                        `${env.CKAN_URL}/api/action/issue_show?dataset_id=${input.id}&issue_number=${issue.number}`,
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `${user?.apikey ?? ''}`,
                            },
                        }
                    )
                    const details: CkanResponse<Issue> = await detailsRes.json()
                    console.log('Details', details)
                    if (!details.success && details.error) {
                        if (details.error.message)
                            throw Error(details.error.message)
                        throw Error(JSON.stringify(details.error))
                    }
                    return { ...issue, ...details.result }
                })
            )
            return issuesWithDetails
        }),
    getOneDataset: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            return getOneDataset(input.id, ctx.session)
        }),
    getPossibleCollaborators: protectedProcedure.query(async () => {
        const apiKey = env.SYS_ADMIN_API_KEY
        return getAllUsers({ apiKey })
    }),
    removeCollaborator: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                user_id: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const response = await fetch(
                `${env.CKAN_URL}/api/3/action/package_collaborator_delete`,
                {
                    method: 'POST',
                    body: JSON.stringify(input),
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
                fq: `visibility_type:draft`,
                query: input,
            }))!
            return {
                datasets: dataset.datasets,
                count: dataset.count,
            }
        }),
    getFavoriteDataset: protectedProcedure.query(async ({ ctx }) => {
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
            if (item.type === 'dataset') {
                const t = item.dict as WriDataset
                acc.push(t)
            }
            return acc
        }, [] as WriDataset[])

        return {
            datasets: result,
            count: result?.length,
        }
    }),
    getFeaturedDatasets: publicProcedure
        .input(searchSchema)
        .query(async ({ input, ctx }) => {
            const dataset = (await getAllDatasetFq({
                apiKey: ctx?.session?.user.apikey ?? '',
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
