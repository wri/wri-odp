import { z } from 'zod'
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from '@/server/api/trpc'
import { env } from '@/env.mjs'
import {
    getAllDatasetFq,
    getOneDataset,
    getAllUsers,
    upsertCollaborator,
    deleteCollaborator,
    getRecipient,
    createNotification,
    sendIssueOrCommentNotigication
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
import {
    DatasetFormType,
    DatasetSchema,
    ResourceFormType,
    ResourceSchema,
} from '@/schema/dataset.schema'
import type { Dataset, Resource } from '@/interfaces/dataset.interface'
import type { License } from '@/interfaces/licenses.interface'
import { isValidUrl } from '@/utils/isValidUrl'
import {
    convertFormToLayerObj,
    convertLayerObjToForm,
    getApiSpecFromRawObj,
    getRawObjFromApiSpec,
} from '@/components/dashboard/datasets/admin/datafiles/sections/BuildALayer/convertObjects'
import { APILayerSpec } from '@/interfaces/layer.interface'
import {
    RwLayerResp,
    RwResponse,
    isRwError,
    RwErrorResponse,
} from '@/interfaces/rw.interface'
import { sendMemberNotifications } from '@/utils/apiUtils'
import { TRPCError } from '@trpc/server'
import { CommentSchema, IssueSchema } from '@/schema/issue.schema'
import { throws } from 'assert'

async function createDatasetRw(dataset: DatasetFormType) {
    const rwDataset: Record<string, any> = {
        name: dataset.title ?? '',
        connectorType: dataset.connectorType,
        provider: dataset.provider,
        published: false,
        env: 'staging',
        application: ['data-explorer'],
    }
    if (dataset.provider === 'gee') {
        rwDataset.tableName = dataset.tableName
    } else {
        rwDataset.connectorUrl = dataset.connectorUrl
    }
    const body = JSON.stringify({ dataset: rwDataset })
    const datasetRwRes = await fetch(
        'https://api.resourcewatch.org/v1/dataset',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${env.RW_API_KEY}`,
            },
            body,
        }
    )
    const datasetRw: { data: { id: string; attributes: APILayerSpec } } =
        await datasetRwRes.json()
    return datasetRw
}

async function createLayerRw(r: ResourceFormType, datasetRwId: string) {
    if (!r.layerObj && !r.layerObjRaw) return r
    const body = r.layerObj
        ? JSON.stringify(convertFormToLayerObj(r.layerObj))
        : JSON.stringify({
              ...getApiSpecFromRawObj(r.layerObjRaw),
          })
    const layerRwRes = await fetch(
        `https://api.resourcewatch.org/v1/dataset/${datasetRwId}/layer`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${env.RW_API_KEY}`,
            },
            body,
        }
    )
    const layerRw: any = await layerRwRes.json()
    const url = `https://api.resourcewatch.org/v1/dataset/${layerRw.data.attributes.dataset}/layer/${layerRw.data.id}`
    const name = layerRw.data.id
    const title = layerRw.data.attributes.name
    const description = layerRw.data.attributes.description
    r.url = url
    r.name = name
    r.title = title
    r.description = description
    r.rw_id = layerRw.data.id
    r.format = "Layer"
    return r
}

async function editLayerRw(r: ResourceFormType) {
    if ((!r.layerObj && !r.layerObjRaw) || !r.rw_id) return r
    try {
        if ((r.layerObj || r.layerObjRaw) && r.url) {
            const body = r.layerObj
                ? JSON.stringify(convertFormToLayerObj(r.layerObj))
                : JSON.stringify(getApiSpecFromRawObj(r.layerObjRaw))
            const layerRwRes = await fetch(r.url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${env.RW_API_KEY}`,
                },
                body,
            })
            const layerRw: RwResponse = await layerRwRes.json()
            if (isRwError(layerRw))
                throw Error(
                    `Error creating resource at the Resource Watch API - (${JSON.stringify(
                        layerRw.errors
                    )})`
                )
            const title = layerRw.data.attributes.name
            const description = layerRw.data.attributes.description
            r.title = title
            r.description = description
            r.format = "Layer"
            return r
        }
    } catch (e) {
        let error =
            'Something went wrong when we tried to create some resources in the Resource Watch API please contact the system administrator'
        if (e instanceof Error) error = e.message
        throw Error(error)
    }
    return r
}

async function getLayerRw(layerUrl: string) {
    const layerRwRes = await fetch(layerUrl, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.RW_API_KEY}`,
        },
    })
    const layerRw: RwLayerResp | RwErrorResponse = await layerRwRes.json()
    if (isRwError(layerRw))
        throw Error(
            `Error creating resource at the Resource Watch API - (${JSON.stringify(
                layerRw.errors
            )})`
        )
    return { ...layerRw.data.attributes, id: layerRw.data.id }
}

async function fetchDatasetCollabIds(
    datasetId: string,
    userApiKey: string
) {
    const res  = await  fetch(
        `${env.CKAN_URL}/api/3/action/package_collaborator_list?id=${datasetId}`,
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${userApiKey ?? ''}`,
            },
        }
    )
    const collaborators = (await res.json()) as CkanResponse<Collaborator[]>
    if (!collaborators.success && collaborators.error) {
        if (res.status === 403)
            throw new TRPCError({
                code: 'FORBIDDEN',
                message: 'You are not authorized to perform this action',
            })
        if (collaborators.error.message)
            throw new TRPCError({code: 'BAD_REQUEST', message: collaborators.error.message})
        throw new TRPCError({code: 'BAD_REQUEST', message: JSON.stringify(collaborators.error)})
    }

    return collaborators.result.map((collaborator) => collaborator.user_id)
    
}

export async function fetchDatasetCollaborators(
    datasetId: string,
    userApiKey: string,
    sysAdminApiKey: string
) {
    const collaboratorsRes = await fetch(
        `${env.CKAN_URL}/api/3/action/package_collaborator_list?id=${datasetId}`,
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${userApiKey ?? ''}`,
            },
        }
    )
    const collaborators: CkanResponse<Collaborator[]> =
        await collaboratorsRes.json()
    if (!collaborators.success && collaborators.error) {
        if (collaboratorsRes.status === 403)
            throw new TRPCError({
                code: 'FORBIDDEN',
                message: 'You are not authorized to perform this action',
            })
        if (collaborators.error.message)
            throw new TRPCError({code: 'BAD_REQUEST', message: collaborators.error.message})
        throw new TRPCError({code: 'BAD_REQUEST', message: JSON.stringify(collaborators.error)})
    }

    const collaboratorsWithDetails = await Promise.all(
        collaborators.result.map(async (collaborator) => {
            const userRes = await fetch(
                `${env.CKAN_URL}/api/action/user_show?id=${collaborator.user_id}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: sysAdminApiKey,
                    },
                }
            )
            const user = await userRes.json()
            if (!user.success && user.error) {
                if (user.error.message) throw Error(user.error.message)
                throw Error(JSON.stringify(user.error))
            }
            return { ...collaborator, ...user.result }
        })
    )

    return collaboratorsWithDetails
}

export const DatasetRouter = createTRPCRouter({
    createDataset: protectedProcedure
        .input(DatasetSchema)
        .mutation(async ({ ctx, input }) => {
            let resources = input.resources
            let datasetRw: null | any = null
            if (input.rw_dataset) {
                try {
                    datasetRw = await createDatasetRw(input)
                    resources = await Promise.all(
                        resources.map(async (r) =>
                            datasetRw
                                ? await createLayerRw(r, datasetRw.data.id)
                                : r
                        )
                    )
                } catch (e) {
                    let error =
                        'Something went wrong when we tried to create some resources in the Resource Watch API please contact the system administrator'
                    if (e instanceof Error) error = e.message
                    throw Error(error)
                }
            }
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
                    rw_id: datasetRw ? datasetRw.data.id : '',
                    update_frequency: input.update_frequency?.value ?? '',
                    featured_image:
                        input.featured_image && input.featured_dataset
                            ? `${env.CKAN_URL}/uploads/group/${input.featured_image}`
                            : null,
                    visibility_type: input.visibility_type?.value ?? '',
                    resources: resources
                        .filter((resource) => resource.type !== 'empty')
                        .map((resource) => ({
                            ...resource,
                            format: resource.format ?? '',
                            id: resource.resourceId,
                            url_type: resource.type,
                            layerObjRaw: null,
                            layerObj: null,
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
            const user = ctx.session.user
            const existingCollaboratorsDetails =
                await fetchDatasetCollaborators(
                    input.id ?? '',
                    ctx.session.user.apikey,
                    env.SYS_ADMIN_API_KEY
                )
            const newCollaborators = input.collaborators.map(
                (collaborator) => ({
                    name: collaborator.user.label.toLowerCase(),
                    capacity: collaborator.capacity.label.toLowerCase(),
                })
            )
            const existingCollaborators = existingCollaboratorsDetails.map(
                (existingCollaborator) => ({
                    name: existingCollaborator.name,
                    capacity: existingCollaborator.capacity,
                })
            )

            try {
                sendMemberNotifications(
                    user.id,
                    newCollaborators,
                    existingCollaborators,
                    input.id ?? '',
                    'dataset'
                )
            } catch (e) {
                console.log(e)
            }
            const resourcesWithoutLayer = input.resources.filter(
                (r) => !r.layerObj && !r.layerObjRaw
            )
            let rw_id = input.rw_id ?? null
            if (!input.rw_id && input.rw_dataset) {
                const datasetRw = await createDatasetRw(input)
                rw_id = datasetRw.data.id
            }
            const resourcesToEditLayer = input.rw_id
                ? await Promise.all(
                      input.resources
                          .filter(
                              (r) => (r.layerObj || r.layerObjRaw) && r.rw_id
                          )
                          .map(async (r) => {
                              return await editLayerRw(r)
                          })
                  )
                : []
            const resourcesToCreateLayer =
                rw_id !== null
                    ? await Promise.all(
                          input.resources
                              .filter(
                                  (r) =>
                                      (r.layerObj || r.layerObjRaw) && !r.rw_id
                              )
                              .map(async (r) => {
                                  return await createLayerRw(r, rw_id ?? '')
                              })
                      )
                    : []
            const resources = [
                ...resourcesWithoutLayer,
                ...resourcesToEditLayer,
                ...resourcesToCreateLayer,
            ]

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
                    rw_id: rw_id ?? '',
                    owner_org: input.team ? input.team.value : '',
                    collaborators: null,
                    update_frequency: input.update_frequency?.value ?? '',
                    featured_image:
                        input.featured_image && input.featured_dataset
                            ? !isValidUrl(input.featured_image)
                                ? `${env.CKAN_URL}/uploads/group/${input.featured_image}`
                                : input.featured_image
                            : null,
                    visibility_type: input.visibility_type?.value ?? '',
                    resources: resources
                        .filter((resource) => resource.type !== 'empty')
                        .map((resource) => ({
                            ...resource,
                            format: resource.format ?? '',
                            id: resource.resourceId,
                            new: false,
                            layerObjRaw: null,
                            layerObj: null,
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
                try {
                    await Promise.all(
                        existingCollaborators
                            .filter(
                                (existingCollaborator) =>
                                    !newCollaborators.some(
                                        (newCollaborator) =>
                                            newCollaborator.name ===
                                            existingCollaborator.name
                                    )
                            )
                            .map((existingCollaborator) =>
                                deleteCollaborator(
                                    {
                                        package_id: input.id ?? '',
                                        user_id: existingCollaborator.name,
                                    },
                                    ctx.session
                                )
                            )
                    )
                } catch (e) {
                    console.log(e)
                }
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
            try {
                if ((input.layerObj || input.layerObjRaw) && input.url) {
                    return await editLayerRw(input)
                }
            } catch (e) {
                let error =
                    'Something went wrong when we tried to create some resources in the Resource Watch API please contact the system administrator'
                if (e instanceof Error) error = e.message
                throw Error(error)
            }
            try {
                const user = ctx.session.user
                const body = JSON.stringify({
                    ...input,
                    format: input.format ?? '',
                    new: false,
                    url_type: input.type,
                    layerObjRaw: null,
                    layerObj: null,
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
                extAddressQ: input.extAddressQ,
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
            return fetchDatasetCollaborators(
                input.id,
                user?.apikey ?? '',
                env.SYS_ADMIN_API_KEY
            )
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
            if (!issues.success && issues.error) {
                if (issues.error.message) throw Error(issues.error.message)
                throw Error(JSON.stringify(issues.error))
            }
            const issuesWithDetails = await Promise.all(
                issues.result.results.map(async (issue) => {
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
            const dataset = await getOneDataset(input.id, ctx.session)
            const resources = await Promise.all(
                dataset.resources.map(async (r) => {
                    if (r.url_type === 'upload' || r.url_type === 'link')
                        return r
                    if (!r.url) return r
                    const layerObj = await getLayerRw(r.url)
                    if (r.url_type === 'layer')
                        return {
                            ...r,
                            layerObj: convertLayerObjToForm(layerObj),
                        }
                    if (r.url_type === 'layer-raw')
                        return {
                            ...r,
                            layerObjRaw: getRawObjFromApiSpec(layerObj),
                        }
                    return r
                })
            )
            return { ...dataset, resources }
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

        const dataDetails = await Promise.all(
            result.map(async (item) => {
                const response = await fetch(
                    `${env.CKAN_URL}/api/3/action/package_show?id=${item.id}`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `${ctx.session.user.apikey}`,
                        },
                    }
                )
                const data = (await response.json()) as CkanResponse<WriDataset>
                if (!data.success && data.error) throw Error(data.error.message)
                return data.result
            })
        )

        return {
            datasets: dataDetails,
            count: dataDetails?.length,
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

    followDataset: protectedProcedure
        .input(z.string())
        .mutation(async ({ input, ctx }) => {
            const response = await fetch(
                `${env.CKAN_URL}/api/3/action/follow_dataset`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        id: input,
                    }),
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
    unFollowDataset: protectedProcedure
        .input(z.string())
        .mutation(async ({ input, ctx }) => {
            const response = await fetch(
                `${env.CKAN_URL}/api/3/action/unfollow_dataset`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        id: input,
                    }),
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
    isFavoriteDataset: protectedProcedure
        .input(z.string())
        .query(async ({ input, ctx }) => {
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

            return result.some((dataset) => dataset.id === input)
        }),
    createIssueComment: protectedProcedure
        .input(CommentSchema)
        .mutation(async ({ input, ctx }) => {
            const response = await fetch(`${env.CKAN_URL}/api/3/action/issue_comment_create`,
                {
                    method: "POST",
                    body: JSON.stringify(input),
                    headers: {
                        Authorization: ctx.session.user.apikey,
                        'Content-Type': 'application/json',
                    },
                })
            
            const data = (await response.json()) as CkanResponse<null>
            if (!data.success && data.error) throw Error(data.error.message)

            try {
                const collab =  await fetchDatasetCollabIds(
                    input.dataset_id,
                    ctx.session.user.apikey,
                )
                console.log("COLLAB IDS: ", collab)
                await sendIssueOrCommentNotigication({
                    owner_org: input.owner_org,
                    creator_id: input.creator_id,
                    collaborator_id: collab,
                    dataset_id: input.dataset_id,
                    session: ctx.session,
                    title: input.issuetitle,
                    action: "commented"
                })
            }
            catch (error) {
                console.log(error)
                throw Error("Error in sending issue /comment notification")
            }
            return data
        }),
    
    closeOpenIssue: protectedProcedure
        .input(CommentSchema)
        .mutation(async ({ input, ctx }) => {
            const response = await fetch(`${env.CKAN_URL}/api/3/action/issue_update`, {
                method: "POST",
                body: JSON.stringify(input),
                headers: {
                    Authorization: ctx.session.user.apikey,
                    'Content-Type': 'application/json',
                },
            })

            const data = (await response.json()) as CkanResponse<null>
            if (!data.success && data.error) throw Error(data.error.message)

            const responseComment = await fetch(`${env.CKAN_URL}/api/3/action/issue_comment_create`,
                {
                    method: "POST",
                    body: JSON.stringify(input),
                    headers: {
                        Authorization: ctx.session.user.apikey,
                        'Content-Type': 'application/json',
                    },
                })
            
            const dataComment = (await responseComment.json()) as CkanResponse<null>
            if (!dataComment.success && dataComment.error) throw Error(dataComment.error.message)

            try {
                const collab =  await fetchDatasetCollabIds(
                    input.dataset_id,
                    ctx.session.user.apikey,
                )
                await sendIssueOrCommentNotigication({
                    owner_org: input.owner_org,
                    creator_id: input.creator_id,
                    collaborator_id: collab,
                    dataset_id: input.dataset_id,
                    session: ctx.session,
                    title: input.issuetitle,
                    action: input.status!
                })
            }
            catch (error) {
                console.log(error)
                throw Error("Error in sending issue /comment notification")
            }
            return input.status
        }),
    
    deleteIssue: protectedProcedure
        .input(CommentSchema)
        .mutation(async ({ input, ctx }) => {
            const response = await fetch(`${env.CKAN_URL}/api/3/action/issue_delete`,
                    {
                        method: "POST",
                        body: JSON.stringify(input),
                        headers: {
                            Authorization: ctx.session.user.apikey,
                            'Content-Type': 'application/json',
                        },
                })
            
            
            const data = (await response.json()) as CkanResponse<null>
            if (!data.success && data.error) throw Error(data.error.message)
            try {
                 // get dataset collaborators id
                const collab =  await fetchDatasetCollabIds(
                    input.dataset_id,
                    ctx.session.user.apikey,
                )
                await sendIssueOrCommentNotigication({
                    owner_org: input.owner_org,
                    creator_id: input.creator_id,
                    collaborator_id: collab,
                    dataset_id: input.dataset_id,
                    session: ctx.session,
                    title: input.issuetitle,
                    action: "deleted"
                })
            }
            catch (error) {
                console.log(error)
                throw Error("Error in sending issue /comment notification")
            }
            return input.issue_number
        }),
    createIssue: protectedProcedure
        .input(IssueSchema)
        .mutation(async ({ input, ctx }) => {
            const response = await fetch(`${env.CKAN_URL}/api/3/action/issue_create`,
                    {
                        method: "POST",
                        body: JSON.stringify(input),
                        headers: {
                            Authorization: ctx.session.user.apikey,
                            'Content-Type': 'application/json',
                        },
                })
            
            
            const data = (await response.json()) as CkanResponse<null>
            if (!data.success && data.error) throw Error(JSON.stringify(data.error))

            try {
                const collab =  await fetchDatasetCollabIds(
                    input.dataset_id,
                    ctx.session.user.apikey,
                )
                await sendIssueOrCommentNotigication({
                    owner_org: input.owner_org,
                    creator_id: input.creator_id,
                    collaborator_id: collab,
                    dataset_id: input.dataset_id,
                    session: ctx.session,
                    title: input.title,
                    action: "created"
                })
            }
            catch (error) {
                console.log(error)
                throw Error("Error in sending issue /comment notification")
            }
            return data
        }),
    
})
