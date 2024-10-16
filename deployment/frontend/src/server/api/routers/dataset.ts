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
    sendIssueOrCommentNotigication,
    getResourceViews,
    createResourceView,
    updateResourceView,
    deleteResourceView,
    getUser,
    sendGroupNotification,
    getOnePendingDataset,
    getUserOrganizations,
    getResourceView,
    updateDatasetHasChartsFlag,
    getDatasetDetails,
    getOrgDetails,
    filterDatasetFields,
    patchDataset,
    fetchDatasetCollabIds,
    approvePendingDataset,
    getDatasetReleaseNotes,
} from '@/utils/apiUtils'
import { searchSchema } from '@/schema/search.schema'
import type {
    CkanResponse,
    Collaborator,
    Issue,
    WriDataset,
    FolloweeList,
    PendingDataset,
    WriOrganization,
    OpenIn,
    User,
} from '@/schema/ckan.schema'
import {
    DatasetFormType,
    DatasetSchema,
    DatasetSchemaForEdit,
    ResourceFormType,
    ResourceSchema,
} from '@/schema/dataset.schema'
import type { Dataset, Resource } from '@/interfaces/dataset.interface'
import type { License } from '@/interfaces/licenses.interface'
import { isValidUrl } from '@/utils/isValidUrl'
import { cleanUrl } from '@/utils/cleanUrl'
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
    isRwLayerResp,
    RwErrorResponse,
} from '@/interfaces/rw.interface'
import { sendMemberNotifications } from '@/utils/apiUtils'
import { TRPCError } from '@trpc/server'
import { CommentSchema, IssueSchema } from '@/schema/issue.schema'
import { throws } from 'assert'
import {
    createViewFormSchema,
    editViewFormSchema,
    viewFormSchema,
} from '@/schema/view.schema'

import { Organization } from '@portaljs/ckan'

export async function getLayerRw(layerUrl: string) {
    const layerRwRes = await fetch(layerUrl, {
        headers: {
            'Content-Type': 'application/json',
        },
    })
    const layerRw: RwLayerResp | RwErrorResponse = await layerRwRes.json()
    if (isRwError(layerRw))
        throw Error(
            `Error reading resource at the Resource Watch API - (${JSON.stringify(
                layerRw.errors
            )})`
        )
    return { ...layerRw.data.attributes, id: layerRw.data.id }
}

export async function fetchDatasetCollaborators(
    datasetId: string,
    userApiKey: string,
    sysAdminApiKey: string
) {
    const collaboratorsRes = await fetch(
        `${env.CKAN_URL}/api/3/action/package_collaborator_list_wri?id=${datasetId}`,
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${sysAdminApiKey}`,
            },
        }
    )
    const collaborators: CkanResponse<any[]> = await collaboratorsRes.json()
    if (!collaborators.success && collaborators.error) {
        if (collaboratorsRes.status === 403)
            throw new TRPCError({
                code: 'FORBIDDEN',
                message: 'You are not authorized to perform this action',
            })
        if (collaborators.error.message)
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: collaborators.error.message,
            })
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: JSON.stringify(collaborators.error),
        })
    }

    // const result = collaborators.result.map((collaborator) => {
    //     const user = collaborator.user
    //     delete collaborator.user
    //     return {
    //         ...collaborator,
    //         ...user
    //     }
    //  })

    //@ts-ignore
    return collaborators.result
}

export const DatasetRouter = createTRPCRouter({
    createDataset: protectedProcedure
        .input(DatasetSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                const user = ctx.session.user
                const body = {
                    ...input,
                    draft: true,
                    is_approved: false,
                    approval_status: 'pending',
                    tags: input.tags
                        ? input.tags.map((tag) => ({ name: tag }))
                        : [],
                    groups: input.topics
                        ? input.topics.map((topic) => ({ name: topic }))
                        : [],
                    open_in: JSON.stringify(input.open_in) ?? '',
                    language: input.language?.value ?? '',
                    license_id: input.license_id?.value ?? '',
                    license_title: input.license_id?.label ?? '',
                    owner_org: input.team ? input.team.value : '',
                    collaborators: null,
                    rw_id: '',
                    update_frequency: input.update_frequency?.value ?? '',
                    featured_image:
                        input.featured_image && input.featured_dataset
                            ? !isValidUrl(cleanUrl(input.featured_image))
                                ? cleanUrl(
                                      `${env.NEXT_PUBLIC_CKAN_URL}/uploads/group/${input.featured_image}`
                                  )
                                : input.featured_image
                            : null,
                    visibility_type: input.visibility_type?.value ?? '',
                    authors: input.authors.map((author) => ({
                        name: author.name,
                        email: author.email,
                    })),
                    maintainers: input.maintainers.map((maintainer) => ({
                        name: maintainer.name,
                        email: maintainer.email,
                    })),
                    resources: input.resources
                        .filter(
                            (resource) =>
                                resource.type !== 'empty-file' &&
                                resource.type !== 'empty-layer'
                        )
                        .map((resource) => {
                            let description = ''
                            let title = ''
                            if (resource.layerObjRaw) {
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                const layerRaw = getApiSpecFromRawObj(
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                                    resource.layerObjRaw
                                )

                                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                                description =
                                    resource.description != ''
                                        ? resource.description
                                        : layerRaw.description
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                                title =
                                    resource.name != ''
                                        ? resource.name
                                        : layerRaw.name
                            }
                            if (resource.layerObj || resource.layerObjRaw) {
                                return {
                                    ...resource,
                                    connectorType: input.connectorType ?? '',
                                    connectorUrl: input.connectorUrl ?? '',
                                    provider: input.provider ?? '',
                                    tableName: input.tableName ?? '',
                                    format: resource.format
                                        ? resource.format
                                        : resource.layerObj ||
                                          resource.layerObjRaw
                                        ? 'Layer'
                                        : '',
                                    layer: resource.layerObj
                                        ? convertFormToLayerObj(
                                              resource.layerObj
                                          )
                                        : resource.layerObjRaw
                                        ? getApiSpecFromRawObj(
                                              resource.layerObjRaw as Record<
                                                  string,
                                                  any
                                              >
                                          )
                                        : null,
                                    layerObj: resource.layerObj
                                        ? convertFormToLayerObj(
                                              resource.layerObj
                                          )
                                        : null,
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                    layerObjRaw: resource.layerObjRaw
                                        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                                          getApiSpecFromRawObj(
                                              resource.layerObjRaw
                                          )
                                        : null,
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                                    description:
                                        resource.layerObj?.description ??
                                        description ??
                                        '',
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                    title:
                                        resource.layerObj?.name ?? title ?? '',
                                    id: resource.resourceId,
                                    url_type: resource.type,
                                    // schema: resource.schema
                                    //     ? { value: resource.schema }
                                    //     : '{}',
                                    url: resource.url ?? resource.name,
                                }
                            } else {
                                return {
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
                                }
                            }
                        }),
                    spatial:
                        input.spatial && input.spatial_address
                            ? null
                            : JSON.stringify(input.spatial)
                            ? JSON.stringify(input.spatial)
                            : null,

                    spatial_address: input.spatial_address
                        ? input.spatial_address
                        : null,
                }

                const datasetRes = await fetch(
                    `${env.CKAN_URL}/api/action/package_create`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `${user.apikey}`,
                        },
                        body: JSON.stringify(body),
                    }
                )
                const dataset: CkanResponse<Dataset> = await datasetRes.json()
                if (!dataset.success && dataset.error) {
                    if (dataset.error.message)
                        throw Error(dataset.error.message)
                    throw Error(
                        JSON.stringify(dataset.error).concat(' datastet create')
                    )
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
        .input(DatasetSchemaForEdit)
        .mutation(async ({ ctx, input }) => {
            const user = ctx.session.user
            const existingCollaboratorsDetails =
                await fetchDatasetCollaborators(
                    input.id ?? '',
                    ctx.session.user.apikey,
                    env.SYS_ADMIN_API_KEY
                )
            const newCollaborators = input.collaborators?.map(
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
                if (input.collaborators) {
                    await sendMemberNotifications(
                        user.id,
                        newCollaborators as unknown as User[],
                        existingCollaborators as unknown as User[],
                        input.id ?? '',
                        'dataset'
                    )
                }
            } catch (e) {
                console.error(e)
            }

            const inputKeys = Object.keys(input)
            const isUpdate = !(
                inputKeys.length == 2 && inputKeys.includes('collaborators')
            )

            const pendingResponse = await fetch(
                `${env.CKAN_URL}/api/3/action/pending_dataset_show?package_id=${input.id}`,
                {
                    headers: {
                        Authorization: ctx.session.user.apikey,
                        'Content-Type': 'application/json',
                    },
                }
            )
            const pendingData =
                (await pendingResponse.json()) as CkanResponse<PendingDataset | null>
            if (!pendingData.success && pendingData.error) {
                const error = JSON.stringify(pendingData.error).toLowerCase()
                if (!error.includes('not found')) {
                    throw Error(JSON.stringify(pendingData.error))
                }
            }

            let prevDataset: WriDataset | null = null

            if (pendingData.result) {
                prevDataset = pendingData.result.package_data
            } else {
                prevDataset = await getDatasetDetails({
                    id: input.id ?? '',
                    session: ctx.session,
                })
            }

            let datasetDetails = await getDatasetDetails({
                id: input.id ?? '',
                session: ctx.session,
            })

            const rw_id = input.rw_id ?? null

            let org: WriOrganization | null = null
            if (input.team && input.team?.value && isUpdate) {
                org = (await getOrgDetails({
                    orgId: input.team.value,
                    apiKey: ctx.session.user.apikey,
                }))!

                org = {
                    id: org.id,
                    name: org.name,
                    title: org.title,
                    type: org.type,
                    description: org.description,
                    image_url: org.image_url,
                    created: org.created,
                    approval_status: org.approval_status,
                    is_organization: org.is_organization,
                    state: org.state,
                }
            }

            try {
                if (isUpdate) {
                    const user = ctx.session.user
                    const body = {
                        ...prevDataset,
                        ...input,
                        draft: true,
                        approval_status: 'pending',
                        tags: input.tags
                            ? input.tags.map((tag) => {
                                  const ptag = datasetDetails?.tags?.find(
                                      (x) => x.name === tag
                                  )
                                  return {
                                      ...ptag,
                                      name: tag,
                                  }
                              })
                            : [],
                        groups: input.topics
                            ? input.topics.map((topic) => {
                                  const pgroups = datasetDetails?.groups?.find(
                                      (x) => x.name === topic
                                  )
                                  return {
                                      ...pgroups,
                                      name: topic,
                                  }
                              })
                            : [],
                        open_in: JSON.stringify(input.open_in) ?? '',
                        language: input.language?.value ?? '',
                        license_id: input.license_id?.value ?? '',
                        license_title: input.license_id?.label ?? '',
                        rw_id: rw_id ?? '',
                        owner_org: input.team
                            ? datasetDetails.organization?.name ===
                              input.team.value
                                ? datasetDetails.owner_org
                                : input.team.value
                            : '',
                        organization: org,
                        collaborators: null,
                        update_frequency: input.update_frequency?.value ?? '',
                        featured_image:
                            input.featured_image && input.featured_dataset
                                ? !isValidUrl(cleanUrl(input.featured_image))
                                    ? cleanUrl(
                                          `${env.NEXT_PUBLIC_CKAN_URL}/uploads/group/${input.featured_image}`
                                      )
                                    : input.featured_image
                                : null,
                        visibility_type: input.visibility_type?.value ?? '',
                        authors: input.authors?.map((author) => ({
                            name: author.name,
                            email: author.email,
                        })),
                        maintainers: input.maintainers?.map((maintainer) => ({
                            name: maintainer.name,
                            email: maintainer.email,
                        })),
                        resources: input.resources
                            ?.filter(
                                (resource) =>
                                    resource.type !== 'empty-file' &&
                                    resource.type !== 'empty-layer'
                            )
                            .map((resource) => {
                                const rr = prevDataset?.resources.find(
                                    (r) => r.id === resource.id
                                )
                                let description = ''
                                let title = ''
                                if (resource.layerObjRaw) {
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                    const layerRaw = getApiSpecFromRawObj(
                                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                                        resource.layerObjRaw
                                    )
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                                    description =
                                        resource.description != ''
                                            ? resource.description
                                            : layerRaw.description
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                                    title =
                                        resource.title != ''
                                            ? resource.title
                                            : layerRaw.name
                                }
                                if (resource.layerObj || resource.layerObjRaw) {
                                    return {
                                        ...rr,
                                        ...resource,
                                        connectorType:
                                            input.connectorType ??
                                            rr?.connectorType ??
                                            '',
                                        connectorUrl:
                                            input.connectorUrl ??
                                            rr?.connectorUrl ??
                                            '',
                                        provider:
                                            input.provider ??
                                            rr?.provider ??
                                            '',
                                        tableName:
                                            input.tableName ??
                                            rr?.tableName ??
                                            '',
                                        layer: resource.layerObj
                                            ? convertFormToLayerObj(
                                                  resource.layerObj
                                              )
                                            : resource.layerObjRaw
                                            ? getApiSpecFromRawObj(
                                                  resource.layerObjRaw as Record<
                                                      string,
                                                      any
                                                  >
                                              )
                                            : null,
                                        package_id: input.id ?? '',
                                        format: resource.format
                                            ? resource.format
                                            : resource.layerObj ||
                                              resource.layerObjRaw
                                            ? 'Layer'
                                            : '',
                                        id: resource.resourceId,
                                        datastore_active:
                                            resource.datastore_active === true
                                                ? true
                                                : null,
                                        new: false,
                                        layerObj: resource.layerObj
                                            ? convertFormToLayerObj(
                                                  resource.layerObj
                                              )
                                            : null,
                                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                        layerObjRaw: resource.layerObjRaw
                                            ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                                              getApiSpecFromRawObj(
                                                  resource.layerObjRaw
                                              )
                                            : null,
                                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                                        description:
                                            resource.type === 'layer-raw'
                                                ? description
                                                : resource.layerObj
                                                      ?.description ?? '',
                                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                        title:
                                            resource.type === 'layer-raw'
                                                ? title
                                                : resource.layerObj?.name ?? '',
                                        url_type: resource.type,
                                        // schema: resource.schema
                                        //     ? { value: resource.schema }
                                        //     : '{}',
                                        url: resource.url ?? resource.name,
                                        created:
                                            rr?.created ??
                                            new Date()
                                                .toISOString()
                                                .replace('Z', ''),
                                        metadata_modified: new Date()
                                            .toISOString()
                                            .replace('Z', ''),
                                    }
                                } else {
                                    return {
                                        ...rr,
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
                                        created:
                                            rr?.created ??
                                            new Date()
                                                .toISOString()
                                                .replace('Z', ''),
                                        metadata_modified: new Date()
                                            .toISOString()
                                            .replace('Z', ''),
                                    }
                                }
                            }),
                        spatial:
                            input.spatial && input.spatial_address
                                ? null
                                : JSON.stringify(input.spatial)
                                ? JSON.stringify(input.spatial)
                                : null,
                        spatial_address: input.spatial_address
                            ? input.spatial_address
                            : null,
                    }

                    const newBodyDataset = filterDatasetFields(
                        body
                    ) as WriDataset
                    // const metadaFilter = Object.keys(newBodyDataset)
                    //     .filter((x) => inputKeys.includes(x))
                    //     .map((x) => ({ [x]: newBodyDataset[x] }))

                    const responseData = {
                        ...prevDataset,
                        ...newBodyDataset,
                    }

                    // update main data to pending also
                    await patchDataset({
                        dataset: {
                            id: responseData.id,
                            approval_status: 'pending',
                            visibility_type:
                                responseData.visibility_type ?? 'draft',
                        },
                        session: ctx.session,
                    })

                    const response = await fetch(
                        `${env.CKAN_URL}/api/3/action/pending_dataset_update`,
                        {
                            method: 'POST',
                            body: JSON.stringify({
                                package_id: input.id,
                                package_data: responseData,
                            }),
                            headers: {
                                Authorization: ctx.session.user.apikey,
                                'Content-Type': 'application/json',
                            },
                        }
                    )

                    let data =
                        (await response.json()) as CkanResponse<PendingDataset>
                    if (!data.success && data.error) {
                        const error = JSON.stringify(data.error).toLowerCase()
                        if (!error.includes('not found')) {
                            throw Error(JSON.stringify(data.error))
                        } else {
                            const response = await fetch(
                                `${env.CKAN_URL}/api/3/action/pending_dataset_create`,
                                {
                                    method: 'POST',
                                    body: JSON.stringify({
                                        package_id: input.id,
                                        package_data: responseData,
                                    }),
                                    headers: {
                                        Authorization: ctx.session.user.apikey,
                                        'Content-Type': 'application/json',
                                    },
                                }
                            )
                            data =
                                (await response.json()) as CkanResponse<PendingDataset>
                            if (!data.success && data.error)
                                throw Error(data.error.message)

                            const pendingDataset = data.result.package_data
                            try {
                                // get dataset collaborators id
                                const collab = await fetchDatasetCollabIds(
                                    pendingDataset.id,
                                    ctx.session.user.apikey
                                )
                                if (
                                    !['private', 'draft'].includes(
                                        pendingDataset.visibility_type
                                    )
                                ) {
                                    await sendGroupNotification({
                                        owner_org: pendingDataset.owner_org
                                            ? pendingDataset.owner_org
                                            : null,
                                        creator_id:
                                            pendingDataset.creator_user_id,
                                        collaborator_id: collab,
                                        dataset_id: pendingDataset.id,
                                        session: ctx.session,
                                        action: 'pending_dataset',
                                    })
                                }
                            } catch (error) {
                                console.error(error)
                                throw Error(
                                    'Error in sending approval status notification'
                                )
                            }
                        }
                    }

                    prevDataset = data.result.package_data
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
                                    !newCollaborators?.some(
                                        (newCollaborator) =>
                                            newCollaborator.name ===
                                            existingCollaborator.name
                                    )
                            )
                            .map((existingCollaborator) =>
                                deleteCollaborator(
                                    {
                                        package_id: input.id ?? '',
                                        user_id:
                                            existingCollaborator?.name as string,
                                    },
                                    ctx.session
                                )
                            )
                    )
                } catch (e) {
                    console.error(e)
                }
                if (
                    ['draft', 'private'].includes(
                        input.visibility_type?.value ?? ''
                    )
                ) {
                    try {
                        await approvePendingDataset(input.id ?? '', ctx.session)
                    } catch (e) {
                        console.error(e)
                    }
                }

                return { ...prevDataset, collaborators }
            } catch (e) {
                let error =
                    'Something went wrong please contact the system administrator'
                if (e instanceof Error) error = e.message
                throw Error(error)
            }
        }),
    getResourceViews: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            const views = await getResourceViews({
                ...input,
                session: ctx.session,
            })

            return views
        }),
    getResourceView: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            const views = await getResourceView({
                ...input,
                session: ctx.session,
            })

            return views
        }),
    createResourceView: protectedProcedure
        .input(
            z.object({ view: createViewFormSchema, ckanDatasetId: z.string() })
        )
        .mutation(async ({ input, ctx }) => {
            const view = await createResourceView({
                view: input.view,
                session: ctx.session,
            }).then(async (res) => {
                await updateDatasetHasChartsFlag({
                    ckanDatasetId: input.ckanDatasetId,
                    session: ctx.session,
                })

                return res
            })
            return view
        }),
    updateResourceView: protectedProcedure
        .input(
            z.object({ view: editViewFormSchema, ckanDatasetId: z.string() })
        )
        .mutation(async ({ input, ctx }) => {
            const view = await updateResourceView({
                view: input.view,
                session: ctx.session,
            }).then(async (res) => {
                await updateDatasetHasChartsFlag({
                    ckanDatasetId: input.ckanDatasetId,
                    session: ctx.session,
                })

                return res
            })

            return view
        }),
    deleteResourceView: protectedProcedure
        .input(z.object({ id: z.string(), ckanDatasetId: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const view = await deleteResourceView({
                session: ctx.session,
                id: input.id,
            }).then(async (res) => {
                await updateDatasetHasChartsFlag({
                    ckanDatasetId: input.ckanDatasetId,
                    session: ctx.session,
                })

                return res
            })

            return view
        }),
    getAllDataset: publicProcedure
        .input(
            searchSchema.extend({
                removeUnecessaryDataInResources: z
                    .boolean()
                    .optional()
                    .default(false),
                showPendingDataset: z.boolean().optional().default(false),
            })
        )
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

            if (!fq.includes('is_approved') && !input.showPendingDataset) {
                fq += '+is_approved:true'
            }

            const dataset = (await getAllDatasetFq({
                apiKey: ctx.session?.user.apikey ?? '',
                fq: `${fq}${input.appendRawFq ?? ''}`,
                query: input,
                facetFields: input.facetFields,
                sortBy: input.sortBy,
                extLocationQ: input.extLocationQ,
                extAddressQ: input.extAddressQ,
                extGlobalQ: input.extGlobalQ,
            }))!

            const _datasets = input.removeUnecessaryDataInResources
                ? dataset.datasets.map((d) => ({
                      ...d,
                      resources: d.resources.map((r) => ({
                          datastore_active: r.datastore_active,
                          format: r.format,
                      })),
                  }))
                : dataset.datasets
            return {
                datasets: _datasets as unknown as WriDataset[],
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
                `${env.CKAN_URL}/api/action/issue_search_wri?dataset_id=${input.id}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${user?.apikey ?? ''}`,
                    },
                }
            )
            const issues: CkanResponse<Issue[]> = await issuesRes.json()
            if (!issues.success && issues.error) {
                if (issues.error.message) throw Error(issues.error.message)
                throw Error(JSON.stringify(issues.error))
            }

            return issues.result
        }),
    getOneDataset: publicProcedure
        .input(
            z.object({
                id: z.string(),
                includeViews: z.boolean().default(false).optional(),
                noLayer: z.boolean().optional(),
            })
        )
        .query(async ({ input, ctx }) => {
            const dataset = await getOneDataset(
                input.id,
                ctx.session,
                input.noLayer
            )
            return dataset
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
                fq: `creator_user_id:${ctx.session.user.id}+draft:false`,
                query: input,
            }))!
            const privateDataset = (await getAllDatasetFq({
                apiKey: ctx.session.user.apikey,
                fq: `creator_user_id:${ctx.session.user.id}+draft:true+visibility_type:private`,
                query: input,
            }))!

            const allMydataset = [
                ...dataset.datasets,
                ...privateDataset.datasets,
            ]
            const allMycount = dataset.count + privateDataset.count
            return {
                datasets: allMydataset,
                count: allMycount,
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
            `${env.CKAN_URL}/api/3/action/dataset_followee_list?id=${ctx.session.user.id}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${ctx.session.user.apikey}`,
                },
            }
        )
        const data = (await response.json()) as CkanResponse<WriDataset[]>
        if (!data.success && data.error) throw Error(data.error.message)

        return {
            datasets: data.result,
            count: data.result?.length,
        }
    }),
    getFeaturedDatasets: publicProcedure
        .input(
            searchSchema.extend({
                removeUnecessaryDataInResources: z
                    .boolean()
                    .optional()
                    .default(false),
            })
        )
        .query(async ({ input, ctx }) => {
            const dataset = (await getAllDatasetFq({
                apiKey: '',
                fq: `featured_dataset:true`,
                query: input,
            }))!
            //This allows us to send less data to the client
            const _datasets = input.removeUnecessaryDataInResources
                ? dataset.datasets.map((d) => ({
                      ...d,
                      resources: d.resources.map((r) => ({
                          datastore_active: r.datastore_active,
                          format: r.format,
                      })),
                  }))
                : dataset.datasets
            return {
                datasets: _datasets,
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
            console.log('DATA', data)
            if (!data.success && data.error) throw Error(data.error.message)

            const deleteResponse = await fetch(
                `${env.CKAN_URL}/api/3/action/pending_dataset_delete`,
                {
                    method: 'POST',
                    body: JSON.stringify({ package_id: input }),
                    headers: {
                        Authorization: ctx.session.user.apikey,
                        'Content-Type': 'application/json',
                    },
                }
            )

            const deleteData =
                (await deleteResponse.json()) as CkanResponse<null>
            console.log('DELETE DATA', deleteData)
            if (!deleteData.success && deleteData.error) {
                const error = JSON.stringify(deleteData.error).toLowerCase()
                if (!error.includes('not found')) {
                    throw Error(JSON.stringify(deleteData.error))
                }
            }
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
            const response = await fetch(
                `${env.CKAN_URL}/api/3/action/issue_comment_create`,
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

            try {
                const collab = await fetchDatasetCollabIds(
                    input.dataset_id,
                    ctx.session.user.apikey
                )
                await sendIssueOrCommentNotigication({
                    owner_org: input.owner_org,
                    creator_id: input.creator_id,
                    collaborator_id: collab,
                    dataset_id: input.dataset_id,
                    session: ctx.session,
                    title: input.issuetitle,
                    action: 'commented',
                })
            } catch (error) {
                console.error(error)
                throw Error('Error in sending issue /comment notification')
            }
            return data
        }),

    closeOpenIssue: protectedProcedure
        .input(CommentSchema)
        .mutation(async ({ input, ctx }) => {
            const response = await fetch(
                `${env.CKAN_URL}/api/3/action/issue_update`,
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

            const responseComment = await fetch(
                `${env.CKAN_URL}/api/3/action/issue_comment_create`,
                {
                    method: 'POST',
                    body: JSON.stringify(input),
                    headers: {
                        Authorization: ctx.session.user.apikey,
                        'Content-Type': 'application/json',
                    },
                }
            )

            const dataComment =
                (await responseComment.json()) as CkanResponse<null>
            if (!dataComment.success && dataComment.error)
                throw Error(dataComment.error.message)

            try {
                const collab = await fetchDatasetCollabIds(
                    input.dataset_id,
                    ctx.session.user.apikey
                )
                await sendIssueOrCommentNotigication({
                    owner_org: input.owner_org,
                    creator_id: input.creator_id,
                    collaborator_id: collab,
                    dataset_id: input.dataset_id,
                    session: ctx.session,
                    title: input.issuetitle,
                    action: input.status!,
                })
            } catch (error) {
                console.error(error)
                throw Error('Error in sending issue /comment notification')
            }
            return input.status
        }),
    createIssue: protectedProcedure
        .input(IssueSchema)
        .mutation(async ({ input, ctx }) => {
            const response = await fetch(
                `${env.CKAN_URL}/api/3/action/issue_create`,
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
            if (!data.success && data.error)
                throw Error(JSON.stringify(data.error))

            const mainDataset = await getDatasetDetails({
                id: input.dataset_id,
                session: ctx.session,
            })
            const rejectMainDataset = {
                ...mainDataset,
                approval_status: 'rejected',
            }

            await patchDataset({
                dataset: rejectMainDataset,
                session: ctx.session,
            })

            // fetch pending dataset
            const pendingDataset = await fetch(
                `${env.CKAN_URL}/api/3/action/pending_dataset_show?package_id=${input.dataset_id}`,
                {
                    headers: {
                        Authorization: ctx.session.user.apikey,
                        'Content-Type': 'application/json',
                    },
                }
            )

            const pendingData =
                (await pendingDataset.json()) as CkanResponse<PendingDataset>
            if (!pendingData.success && pendingData.error)
                throw Error(JSON.stringify(pendingData.error))

            const rejectedPendingDataset = {
                ...pendingData.result.package_data,
                approval_status: 'rejected',
            }

            const responsePending = await fetch(
                `${env.CKAN_URL}/api/3/action/pending_dataset_update`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        package_id: input.dataset_id,
                        package_data: rejectedPendingDataset,
                    }),
                    headers: {
                        Authorization: ctx.session.user.apikey,
                        'Content-Type': 'application/json',
                    },
                }
            )

            const dataPending =
                (await responsePending.json()) as CkanResponse<PendingDataset>
            if (!dataPending.success && dataPending.error)
                throw Error(JSON.stringify(dataPending.error))

            try {
                const collab = await fetchDatasetCollabIds(
                    input.dataset_id,
                    ctx.session.user.apikey
                )
                await sendIssueOrCommentNotigication({
                    owner_org: input.owner_org,
                    creator_id: input.creator_id,
                    collaborator_id: collab,
                    dataset_id: input.dataset_id,
                    session: ctx.session,
                    title: input.title,
                    action: 'created',
                })

                await sendGroupNotification({
                    owner_org: input.owner_org,
                    creator_id: input.creator_id,
                    collaborator_id: collab,
                    dataset_id: input.dataset_id,
                    session: ctx.session,
                    action: 'rejected_dataset',
                })
            } catch (error) {
                console.error(error)
                throw Error('Error in sending issue /approval notification')
            }
            return data
        }),
    getPendingDatasets: protectedProcedure
        .input(searchSchema)
        .query(async ({ input, ctx }) => {
            let fq =
                'approval_status:pending+visibility_type:(public OR internal)'

            if (input._isUserSearch) {
                fq = `visibility_type:(public OR internal)+approval_status:(pending OR rejected)+creator_user_id:${ctx.session.user.id}`
            }

            if (!ctx.session.user.sysadmin && !input._isUserSearch) {
                const organizations = await getUserOrganizations({
                    userId: ctx.session.user.id,
                    apiKey: ctx.session.user.apikey,
                })
                let orgsFq = `organization:(${organizations
                    ?.map((org) => org.name)
                    .join(' OR ')})`

                if (organizations.length > 0) {
                    fq = `${fq}+${orgsFq}`
                }
            }
            const dataset = (await getAllDatasetFq({
                apiKey: ctx.session.user.apikey,
                fq: fq, // TODO: Vverify if organization admin can only see this and sysadmin
                query: input,
                user: true,
            }))!

            return {
                datasets: dataset.datasets,
                count: dataset.count,
            }
        }),

    approvePendingDataset: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            return approvePendingDataset(input.id, ctx.session)
        }),
    //create pending dataset, only takes in dataset id, and JSon object
    createPendingDataset: protectedProcedure
        .input(z.object({ id: z.string(), data: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const response = await fetch(
                `${env.CKAN_URL}/api/3/action/pending_dataset_create`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        package_id: input.id,
                        package_data: JSON.parse(input.data) as WriDataset,
                    }),
                    headers: {
                        Authorization: ctx.session.user.apikey,
                        'Content-Type': 'application/json',
                    },
                }
            )
            const data = (await response.json()) as CkanResponse<PendingDataset>
            if (!data.success && data.error) throw Error(data.error.message)
            return data
        }),
    updatePendingDataset: protectedProcedure
        .input(z.object({ id: z.string(), data: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const response = await fetch(
                `${env.CKAN_URL}/api/3/action/pending_dataset_update`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        package_id: input.id,
                        package_data: JSON.parse(input.data) as WriDataset & {
                            last_modified: string
                        },
                    }),
                    headers: {
                        Authorization: ctx.session.user.apikey,
                        'Content-Type': 'application/json',
                    },
                }
            )
            const data = (await response.json()) as CkanResponse<PendingDataset>
            if (!data.success && data.error) throw Error(data.error.message)
            return data
        }),
    // show pending dataset, only takes in dataset id
    showPendingDataset: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            const response = await fetch(
                `${env.CKAN_URL}/api/3/action/pending_dataset_show?id=${input.id}`,
                {
                    headers: {
                        Authorization: ctx.session.user.apikey,
                        'Content-Type': 'application/json',
                    },
                }
            )
            const data = (await response.json()) as CkanResponse<PendingDataset>
            if (!data.success && data.error) throw Error(data.error.message)
            const dataset = data.result.package_data

            let spatial = null
            if (dataset.spatial) {
                try {
                    spatial = JSON.parse(dataset.spatial)
                } catch (e) {
                    console.error(e)
                }
            }

            return {
                ...data.result.package_data,
                open_in: dataset.open_in
                    ? (JSON.parse(
                          dataset.open_in as unknown as string
                      ) as OpenIn[])
                    : [],
                spatial,
            }
        }),

    getOneActualOrPendingDataset: publicProcedure
        .input(
            z.object({
                id: z.string(),
                isPending: z.boolean(),
                noLayer: z.boolean().optional(),
            })
        )
        .query(async ({ input, ctx }) => {
            if (input.isPending) {
                const dataset = await getOnePendingDataset(
                    input.id,
                    ctx.session
                )
                return dataset
            }
            const dataset = await getOneDataset(
                input.id,
                ctx.session,
                input.noLayer
            )
            return dataset
        }),

    // show pending diff
    showPendingDiff: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            const response = await fetch(
                `${env.CKAN_URL}/api/3/action/pending_diff_show?package_id=${input.id}`,
                {
                    headers: {
                        Authorization: ctx.session.user.apikey,
                        'Content-Type': 'application/json',
                    },
                }
            )

            const packageData = (await response.json()) as CkanResponse<{
                diff: Record<string, { old_value: string; new_value: string }>
                old_dataset: WriDataset | null
                new_dataset: WriDataset | null
            }>

            if (!packageData.success && packageData.error) {
                if (packageData.error.message)
                    throw Error(packageData.error.message)
                throw Error(JSON.stringify(packageData.error))
            }

            if (Object.keys(packageData.result.diff).length === 0) {
                return null
            }

            return packageData.result
        }),

    requestDatafileConversion: publicProcedure
        .input(
            z.object({
                resource_id: z.string(),
                provider: z.enum(['datastore', 'rw']),
                format: z.enum([
                    'CSV',
                    'XLSX',
                    'XML',
                    'TSV',
                    'JSON',
                    'GeoJSON',
                    'SHP',
                    'KML',
                ]),
                sql: z.string(),
                email: z.string(),
                rw_id: z.string().optional(),
                carto_account: z.string().optional(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const headers: any = {
                'Content-Type': 'application/json',
            }

            const user = ctx?.session?.user
            if (user) {
                headers['Authorization'] = user.apikey
            }

            const response = await fetch(
                `${env.CKAN_URL}/api/3/action/prefect_download_from_store`,
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(input),
                }
            )

            const data = (await response.json()) as CkanResponse<boolean>
            if (response.ok) {
                return data
            }
            throw data
        }),
    downloadSubsetOfData: publicProcedure
        .input(
            z.object({
                id: z.string(),
                provider: z.string(),
                dataset_id: z.string().optional(),
                numOfRows: z.number(),
                connectorUrl: z.string().optional(),
                format: z.enum(['CSV', 'XLSX', 'XML', 'TSV', 'JSON']),
                sql: z.string(),
                email: z.string(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const headers: any = {
                'Content-Type': 'application/json',
            }

            const user = ctx?.session?.user
            if (user) {
                headers['Authorization'] = user.apikey
            }

            const response = await fetch(
                `${env.CKAN_URL}/api/3/action/prefect_download_subset_from_store`,
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(input),
                }
            )

            const data = (await response.json()) as CkanResponse<boolean>
            if (response.ok) {
                return data
            }
            throw data
        }),
    downloadZippedResources: publicProcedure
        .input(
            z.object({
                dataset_id: z.string(),
                keys: z.array(z.string()),
                email: z.string(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const headers: any = {
                'Content-Type': 'application/json',
            }

            const user = ctx?.session?.user
            if (user) {
                headers['Authorization'] = user.apikey
            }

            const response = await fetch(
                `${env.CKAN_URL}/api/3/action/prefect_download_zipped`,
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(input),
                }
            )

            const data = (await response.json()) as CkanResponse<boolean>
            if (response.ok) {
                return data
            }
            throw data
        }),
    getDatasetReleaseNotes: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            return getDatasetReleaseNotes(input)
        }),
    resourceLocationSearch: publicProcedure
        .input(
            z.object({
                bbox: z.array(z.array(z.number())).nullable(),
                point: z.array(z.number()).nullable(),
                location: z.string(),
                package_id: z.string(),
                is_pending: z.boolean(),
            })
        )
        .query(async ({ input, ctx }) => {
            if (!input.bbox && !input.point) {
                return null
            }
            console.log('INPUT', input)
            const bbox = input.bbox ? `&bbox=${input.bbox?.join(',')}` : ''
            const point = input.point ? `&point=${input.point?.join(',')}` : ''
            const spatial_address = input.location
                ? `&spatial_address=${input.location}`
                : ''
            const is_pending = `&is_pending=${
                input.is_pending ? 'True' : 'False'
            }`
            const url = `${env.CKAN_URL}/api/3/action/resource_location_search?package_id=${input.package_id}${bbox}${point}${spatial_address}${is_pending}`
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            const results: CkanResponse<{
                count: number
                results: Resource[]
            }> = await response.json()
            return results.result.results
        }),
})
