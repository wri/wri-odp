import { env } from '@/env.mjs'
import type {
    Activity,
    ActivityDisplay,
    CkanResponse,
    User,
    WriDataset,
    WriOrganization,
    GroupTree,
    Collaborator,
    GroupsmDetails,
    WriUser,
    PendingDataset,
    OpenIn,
    Issue,
} from '@/schema/ckan.schema'
import type { Group } from '@portaljs/ckan'
import type { SearchInput } from '@/schema/search.schema'
import { Facets, Filter } from '@/interfaces/search.interface'
import { replaceNames } from '@/utils/replaceNames'
import { Session } from 'next-auth'
import nodemailer from 'nodemailer'
import { randomBytes } from 'crypto'
import {
    RwDatasetResp,
    RwErrorResponse,
    isRwError,
} from '@/interfaces/rw.interface'
import Team from '@/interfaces/team.interface'
import Topic from '@/interfaces/topic.interface'
import type {
    NewNotificationInputType,
    NotificationType,
} from '@/schema/notification.schema'
import { Resource, View } from '@/interfaces/dataset.interface'
import { CreateViewFormSchema, EditViewFormSchema } from '@/schema/view.schema'
import { getLayerRw } from '@/server/api/routers/dataset'
import {
    convertLayerObjToForm,
    getRawObjFromApiSpec,
} from '@/components/dashboard/datasets/admin/datafiles/sections/BuildALayer/convertObjects'
import { DatasetFormType, ResourceFormType } from '@/schema/dataset.schema'
import { TRPCError } from '@trpc/server'
import {
    editLayerRw,
    createLayerRw,
    createDatasetRw,
    deleteLayerRw,
    assertFullfilled,
} from './rwUtils'

export async function searchHierarchy({
    isSysadmin,
    apiKey,
    q,
    group_type,
}: {
    isSysadmin: boolean
    apiKey: string
    q?: string
    group_type: string
}): Promise<GroupTree[]> {
    try {
        let response: Response
        let groups: GroupTree[] | [] = []
        if (isSysadmin) {
            let urLink = ''
            if (q) {
                urLink = `${env.CKAN_URL}/api/3/action/${
                    group_type == 'group' ? 'group_list' : 'organization_list'
                }?q=${q}&all_fields=True`
            } else {
                urLink = `${env.CKAN_URL}/api/3/action/${
                    group_type == 'group' ? 'group_list' : 'organization_list'
                }?all_fields=True`
            }
            response = await fetch(urLink, {
                headers: {
                    Authorization: apiKey,
                },
            })
            const data = (await response.json()) as CkanResponse<GroupTree[]>
            groups = data.success === true ? data.result : []
        } else {
            response = await fetch(
                `${env.CKAN_URL}/api/3/action/${
                    group_type == 'group'
                        ? 'group_list_authz'
                        : 'organization_list_for_user'
                }?all_fields=True`,
                {
                    headers: {
                        Authorization: apiKey,
                    },
                }
            )

            const data = (await response.json()) as CkanResponse<GroupTree[]>
            groups = data.success === true ? data.result : []
            if (groups.length && q) {
                groups = groups.filter((group) =>
                    group.name.toLowerCase().includes(q.toLowerCase())
                )
            }
        }

        const groupTree: GroupTree[] = await Promise.all(
            groups.map(async (group) => {
                const g = await fetch(
                    `${env.CKAN_URL}/api/3/action/group_tree_section?id=${group.id}&type=${group_type}&all_fields=True`,
                    {
                        headers: {
                            Authorization: apiKey,
                        },
                    }
                )
                const d = (await g.json()) as CkanResponse<GroupTree>
                const result: GroupTree =
                    d.success === true ? d.result : ({} as GroupTree)
                if (q) {
                    result.highlighted = true
                } else {
                    result.highlighted = false
                }
                return result
            })
        )
        const t = groupTree.reduce((acc: Record<string, GroupTree>, group) => {
            const key = group.id
            if (!acc[key]) {
                acc[key] = group
            }
            return acc
        }, {})

        return Object.values(t)
    } catch (e) {
        console.log(e)
        throw new Error(e as string)
    }
}

export async function getGroups({
    apiKey,
    group_type = 'group',
    isSysadmin,
}: {
    apiKey: string
    group_type?: string
    isSysadmin?: boolean
}): Promise<GroupTree[]> {
    try {
        const response = await fetch(
            `${env.CKAN_URL}/api/3/action/group_tree?all_fields=True&type=${group_type}`,
            {
                headers: {
                    Authorization: apiKey,
                },
            }
        )
        const data = (await response.json()) as CkanResponse<GroupTree[]>
        const groups: GroupTree[] = data.success === true ? data.result : []
        return groups
    } catch (e) {
        console.error(e)
        return []
    }
}

export async function getGroup({
    apiKey,
    id,
}: {
    apiKey: string
    id: string
}): Promise<Group | Record<string, string>> {
    try {
        const response = await fetch(
            `${env.CKAN_URL}/api/3/action/group_show?id=${id}`,
            {
                headers: {
                    Authorization: apiKey,
                },
            }
        )
        const data = (await response.json()) as CkanResponse<Group>
        const groups: Group | Record<string, string> =
            data.success === true ? data.result : {}
        return groups
    } catch (e) {
        console.error(e)
        return {}
    }
}

export async function getAllUsers({
    apiKey,
}: {
    apiKey: string
}): Promise<User[]> {
    try {
        const response = await fetch(
            `${env.CKAN_URL}/api/3/action/user_list?all_fields=True`,
            {
                headers: {
                    Authorization: apiKey,
                },
            }
        )
        const data = (await response.json()) as CkanResponse<User[]>
        const users: User[] | null = data.success === true ? data.result : []
        return users
    } catch (e) {
        console.error(e)
        return []
    }
}

export async function getAllOrganizations({
    apiKey,
}: {
    apiKey: string
}): Promise<WriOrganization[]> {
    try {
        const orgList = await Promise.all(
            [0, 1, 2, 3, 4, 5].map(async (i) => {
                const response = await fetch(
                    `${
                        env.CKAN_URL
                    }/api/3/action/organization_list?all_fields=True&limit=${
                        (i + 1) * 25
                    }&offset=${i * 25}`,
                    {
                        headers: {
                            Authorization: apiKey,
                        },
                    }
                )
                const data = (await response.json()) as CkanResponse<
                    WriOrganization[]
                >
                if (!data.success && data.error) {
                    if (data.error.message)
                        throw Error(replaceNames(data.error.message, true))
                    throw Error(replaceNames(JSON.stringify(data.error), true))
                }
                const organizations: WriOrganization[] | [] =
                    data.success === true ? data.result : []
                return organizations
            })
        )
        return orgList.flat()
    } catch (e) {
        console.error(e)
        return []
    }
}

export async function getUserGroups({
    userId,
    apiKey,
}: {
    userId: string
    apiKey: string
}): Promise<Group[] | null> {
    try {
        const response = await fetch(
            `${env.CKAN_URL}/api/3/action/group_list?all_fields=true`,
            {
                headers: {
                    Authorization: apiKey,
                    'Content-Type': 'application/json',
                },
            }
        )
        const data = (await response.json()) as CkanResponse<Group[] | null>
        const groups: Group[] | null =
            data.success === true ? data.result : null
        return groups
    } catch (e) {
        console.error(e)
        return null
    }
}

export async function getOrgDetails({
    orgId,
    apiKey,
}: {
    orgId: string
    apiKey: string
}): Promise<WriOrganization | null> {
    try {
        const response = await fetch(
            `${env.CKAN_URL}/api/3/action/organization_show?id=${orgId}`,
            {
                headers: {
                    Authorization: apiKey,
                },
            }
        )
        const data =
            (await response.json()) as CkanResponse<WriOrganization | null>
        const organization: WriOrganization | null =
            data.success === true ? data.result : null
        return organization
    } catch (e) {
        console.error(e)
        return null
    }
}

export async function getAllDatasetFq({
    apiKey,
    fq,
    query,
    facetFields = [],
    sortBy = '',
    extLocationQ = '',
    extAddressQ = '',
    user = null,
}: {
    apiKey: string
    fq: string
    query: SearchInput
    facetFields?: string[]
    sortBy?: string
    extLocationQ?: string
        extAddressQ?: string
    user?: boolean | null
}): Promise<{ datasets: WriDataset[]; count: number; searchFacets: Facets }> {
    try {
        let url = `${env.CKAN_URL}/api/3/action/package_search?q=${query.search}`

        if (fq) {
            url += `&fq=(${fq})`
        }

        if (facetFields) {
            url += `&facet.field=["${facetFields.join('","')}"]`
        }

        if (sortBy) {
            url += `&sort=${sortBy}`
        }

        if (extLocationQ) {
            url += `&ext_location_q=${extLocationQ}`
        }

        if (extAddressQ) {
            url += `&ext_address_q=${extAddressQ}`
        }

        if (user) {
            url += `&user=true`
        }

        const response = await fetch(
            `${url}&start=${query.page?.start}&rows=${query.page?.rows}`,
            {
                headers: {
                    Authorization: apiKey,
                },
            }
        )

        const data = (await response.json()) as CkanResponse<{
            results: WriDataset[]
            count: number
            search_facets: Facets
        }>

        if (data.error) {
            throw data.error
        }

        const datasets = data.success === true ? data.result.results : []

        const count = data.success === true ? data.result.count : 0
        const searchFacets =
            data.success === true ? data.result?.search_facets : {}

        return { datasets, count, searchFacets }
    } catch (e) {
        console.error(e)
        throw new Error('Failed to fetch datasets')
    }
}

export async function getUserOrganizations({
    userId,
    apiKey,
}: {
    userId: string
    apiKey: string
}): Promise<WriOrganization[]> {
    try {
        const response = await fetch(
            `${env.CKAN_URL}/api/3/action/organization_list_for_user?all_fields=true`,
            {
                headers: {
                    Authorization: `${apiKey}`,
                    'Content-Type': 'application/json',
                },
            }
        )
        const data = (await response.json()) as CkanResponse<WriOrganization[]>
        const organizations: WriOrganization[] | [] =
            data.success === true ? data.result : []
        return organizations
    } catch (e) {
        console.error(e)
        return []
    }
}

export async function getUserDataset({
    userId,
    apiKey,
}: {
    userId: string
    apiKey: string
}): Promise<{ datasets: WriDataset[]; count: number } | null> {
    try {
        const response = await fetch(
            `${env.CKAN_URL}/api/3/action/package_search?q=creator_user_id:${userId}`,
            {
                headers: {
                    Authorization: apiKey,
                },
            }
        )
        const data = (await response.json()) as CkanResponse<{
            results: WriDataset[]
            count: number
        }>
        const datasets = data.result.results
        const count = data.result.count
        return { datasets, count }
    } catch (e) {
        console.error(e)
        return null
    }
}

export async function getUser({
    userId,
    apiKey,
}: {
    userId: string
    apiKey: string
}): Promise<User | null> {
    try {
        const response = await fetch(
            `${env.CKAN_URL}/api/3/action/user_show?id=${userId}`,
            {
                headers: {
                    Authorization: apiKey,
                },
            }
        )
        const data = (await response.json()) as CkanResponse<User | null>
        const user: User | null = data.success === true ? data.result : null
        return user
    } catch (e) {
        console.error(e)
        return null
    }
}

export function activityDetails(activity: Activity): ActivityDisplay {
    const activitProperties: Record<string, string> = {
        new: 'created',
        changed: 'updated',
        deleted: 'deleted',
    }

    const activityType = activity.activity_type?.split(' ')
    const action = activityType[0]!
    let object = activityType[1]!
    const actionType = activityType.join('_')
    let title = ''
    const GroupObject: Record<string, string> = {
        group: 'topic',
        organization: 'team',
    }
    if (object === 'package') {
        title = activity.data?.package?.title ?? ''
    } else if (object === 'user') {
        if (action === 'new') {
            title = 'signed up'
        } else if (action === 'changed') {
            title = 'updated their profile'
        } else {
            title = 'deleted their profile'
        }
    } else {
        title = activity.data?.group?.title ?? ''
        object = GroupObject[object]!
    }
    let description = `${activitProperties[action]} the ${object} ${title}`
    if (object === 'user') description = title
    const time = timeAgo(activity.timestamp)

    let orgId = ''
    let packageId = ''
    let groupId = ''
    let packageGroup: string[] = []
    if (object === 'package') {
        orgId = activity.data?.package?.owner_org as string
        packageId = activity.object_id as string
        //get all groups id
        const groups = activity.data?.package?.groups as { id: string }[]
        packageGroup = groups.map((group) => group.id)
    } else if (object === 'team') {
        orgId = activity.object_id as string
    } else if (object === 'topic') {
        groupId = activity.object_id as string
    }
    return {
        description,
        time,
        icon: action,
        action,
        timestamp: activity.timestamp,
        actionType: actionType,
        orgId: orgId ? orgId : undefined,
        packageId: packageId ? packageId : undefined,
        groupId: groupId ? groupId : undefined,
        packageGroup: packageGroup.length > 0 ? packageGroup : undefined,
    }
}

export async function getOneDataset(
    datasetName: string,
    session: Session | null
) {
    const user = session?.user
    const datasetRes = await fetch(
        `${env.CKAN_URL}/api/action/package_show?id=${datasetName}`,
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: env.SYS_ADMIN_API_KEY,
            },
        }
    )

    const dataset: CkanResponse<WriDataset> = await datasetRes.json()
    if (!dataset.success && dataset.error) {
        if (dataset.error.message) throw Error(dataset.error.message)
        throw Error(JSON.stringify(dataset.error))
    }

    if (dataset.result.rw_id && dataset.result.approval_status !== 'pending') {
        const rwRes = await fetch(
            `https://api.resourcewatch.org/v1/dataset/${dataset.result.rw_id}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )
        const datasetRw: RwDatasetResp | RwErrorResponse = await rwRes.json()
        if (isRwError(datasetRw))
            throw Error(
                `Error resource at the Resource Watch API - (${JSON.stringify(
                    datasetRw.errors
                )})`
            )
        dataset.result.connectorType = datasetRw.data.attributes.connectorType
        dataset.result.connectorUrl = datasetRw.data.attributes.connectorUrl
        dataset.result.provider = datasetRw.data.attributes.provider
        dataset.result.tableName = datasetRw.data.attributes.tableName
    } else {
        const resource = dataset.result.resources.filter(
            (x) => x.format?.toLowerCase() === 'layer'
        )

        if (resource.length) {
            const layer = resource[0]!
            dataset.result.connectorType = layer.connectorType
            dataset.result.connectorUrl = layer.connectorUrl
            dataset.result.provider = layer.provider
            dataset.result.tableName = layer.tableName
        }
    }

    let spatial = null
    if (dataset.result.spatial) {
        try {
            spatial = JSON.parse(dataset.result.spatial)
        } catch (e) {
            console.log(e)
        }
    }

    const resources = await Promise.all(
        dataset.result.resources.map(async (r) => {
            const _views = await getResourceViews({
                id: r.id,
                session: session,
            })

            if (r.url_type === 'upload' || r.url_type === 'link') {
                const resourceHasChartView =
                    r.datastore_active &&
                    _views.some(
                        (v) =>
                            v.view_type == 'custom' &&
                            v.config_obj.type == 'chart'
                    )

                r._hasChartView = resourceHasChartView!

                return { ...r, _views }
            }

            if (!r.url && !r.layerObj && !r.layerObjRaw) return r
            if (!r.layerObj && !r.layerObjRaw) {
                const layerObj = await getLayerRw(r.url!)
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
            }

            if (r.layerObj || r.layerObjRaw) {
                if (r.layerObj) {
                    return {
                        ...r,
                        layerObj: convertLayerObjToForm(r.layerObj),
                        rw_id: r.id,
                    }
                }
                if (r.layerObjRaw) {
                    return {
                        ...r,
                        layerObjRaw: getRawObjFromApiSpec(r.layerObjRaw),
                        rw_id: r.id,
                    }
                }
            }
            return r
        })
    )

    return {
        ...dataset.result,
        resources,
        open_in: dataset.result.open_in
            ? (JSON.parse(
                  dataset.result.open_in as unknown as string
              ) as OpenIn[])
            : [],
        spatial,
    }
}

export async function getOnePendingDataset(
    datasetName: string,
    session: Session | null
) {
    const user = session?.user
    const response = await fetch(
        `${env.CKAN_URL}/api/3/action/pending_dataset_show?package_id=${datasetName}`,
        {
            headers: {
                Authorization: env.SYS_ADMIN_API_KEY,
                'Content-Type': 'application/json',
            },
        }
    )
    const data = (await response.json()) as CkanResponse<PendingDataset>
    if (!data.success && data.error) {
        const erroInfo = JSON.stringify(data.error).toLowerCase()
        if (erroInfo.includes('not found')) {
            return null
        }
        throw Error(JSON.stringify(data.error))
    }
    const dataset = data.result.package_data

    // if (dataset.rw_id) {
    const resourceLayer = dataset.resources.filter(
        (x) => x.format?.toLowerCase() === 'layer'
    )
    if (resourceLayer.length) {
        const layer = resourceLayer[0]!
        dataset.connectorType = layer.connectorType
        dataset.connectorUrl = layer.connectorUrl
        dataset.provider = layer.provider
        dataset.tableName = layer.tableName
    }
    // }

    let hasLayer = false
    const resources = await Promise.all(
        dataset.resources.map(async (r) => {
            if (r.url_type === 'upload' || r.url_type === 'link') return r
            if (!r.url && !r.layerObj && !r.layerObjRaw) return r
            if (!r.layerObj && !r.layerObjRaw) {
                const layerObj = await getLayerRw(r.url!)
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
            }

            if (r.layerObj || r.layerObjRaw) {
                hasLayer = true
                if (r.layerObj) {
                    return {
                        ...r,
                        layerObj: convertLayerObjToForm(r.layerObj),
                        rw_id: r.url ? r.rw_id : r.id,
                    }
                }
                if (r.layerObjRaw) {
                    return {
                        ...r,
                        layerObjRaw: getRawObjFromApiSpec(r.layerObjRaw),
                        rw_id: r.url ? r.rw_id : r.id,
                    }
                }
            }
            return r
        })
    )

    let spatial = null
    if (dataset.spatial) {
        try {
            spatial = JSON.parse(dataset.spatial)
        } catch (e) {
            console.log(e)
        }
    }

    if (!dataset.spatial || !dataset.spatial_address) {
        delete dataset.spatial
        delete dataset.spatial_address
    }

    if (!dataset.metadata_modified) {
        dataset.metadata_modified = data.result.last_modified
    }

    if (hasLayer) {
        dataset.rw_dataset = true
    }

    return {
        ...dataset,
        resources,
        open_in: dataset.open_in
            ? (JSON.parse(dataset.open_in as unknown as string) as OpenIn[])
            : [],
        spatial,
    }
}

export async function upsertCollaborator(
    _collaborator: { package_id: string; user_id: string; capacity: string },
    session: Session
) {
    const user = session.user
    const collaboratorRes = await fetch(
        `${env.CKAN_URL}/api/action/package_collaborator_create`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${user?.apikey ?? ''}`,
            },
            body: JSON.stringify({
                ..._collaborator,
                id: _collaborator.package_id,
            }),
        }
    )
    const collaborator: CkanResponse<Collaborator> =
        await collaboratorRes.json()
    if (!collaborator.success && collaborator.error) {
        if (collaborator.error.message) throw Error(collaborator.error.message)
        throw Error(JSON.stringify(collaborator.error))
    }
    return collaborator.result
}

export async function deleteCollaborator(
    _collaborator: { package_id: string; user_id: string },
    session: Session
) {
    const user = session.user
    const collaboratorRes = await fetch(
        `${env.CKAN_URL}/api/action/package_collaborator_delete`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${user?.apikey ?? ''}`,
            },
            body: JSON.stringify({
                ..._collaborator,
                id: _collaborator.package_id,
            }),
        }
    )
    const collaborator: CkanResponse<Collaborator> =
        await collaboratorRes.json()
    if (!collaborator.success && collaborator.error) {
        if (collaborator.error.message) throw Error(collaborator.error.message)
        throw Error(JSON.stringify(collaborator.error))
    }
    return collaborator.result
}

export function timeAgo(timestamp: string): string {
    const currentDate = new Date()
    const date = new Date(timestamp)
    const timeDifference = currentDate.getTime() - date.getTime()

    const seconds = Math.floor(timeDifference / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 1) {
        return `${days} days ago`
    } else if (hours > 1) {
        return `${hours} hours ago`
    } else if (minutes > 1) {
        return `${minutes} minutes ago`
    } else {
        return `${seconds} seconds ago`
    }
}

export function findNameInTree(
    tree: GroupTree,
    targetName: string
): GroupTree | null {
    // Base case: if the current node's name matches the target, return the node
    if (tree.name === targetName) {
        return tree
    }

    // Recursive case: search through children
    if (tree.children && tree.children.length > 0) {
        for (const child of tree.children) {
            const result = findNameInTree(child, targetName)
            if (result) {
                return result // If found in child, return the result
            }
        }
    }
    // If not found in the current node or its children, return null
    return null
}

export function findAllNameInTree(
    tree: GroupTree,
    targetName: string
): GroupTree[] {
    const result: GroupTree[] = []

    // Check if the targetName is a substring of the current node's name
    if (
        tree.name.toLowerCase().includes(targetName) ||
        tree.title?.toLowerCase().includes(targetName)
    ) {
        result.push(tree)
    }

    // Recursive case: search through children
    if (tree.children && tree.children.length > 0) {
        for (const child of tree.children) {
            const childResults = findAllNameInTree(child, targetName)
            result.push(...childResults) // Add child results to the overall result
        }
    }

    return result
}
export async function getOrganizationTreeDetails({
    input,
    session,
}: {
    input: SearchInput
    session: Session | null
}) {
    let groupTree: GroupTree[] = []
    const allGroups = (await getAllOrganizations({
        apiKey: session?.user.apikey ?? '',
    }))!

    const teamDetails = allGroups.reduce(
        (acc, org) => {
            acc[org.id] = {
                img_url: org.image_display_url ?? '',
                description: org.description ?? '',
                package_count: org.package_count!,
                name: org.name,
            }
            return acc
        },
        {} as Record<string, GroupsmDetails>
    )

    for (const group in teamDetails) {
        const team = teamDetails[group]!
        const packagedetails = (await getAllDatasetFq({
            apiKey: session?.user.apikey ?? '',
            fq: `organization:${team.name}+is_approved:true`,
            query: { search: '', page: { start: 0, rows: 10000 } },
        }))!
        team.package_count = packagedetails.count
    }

    if (input.search) {
        groupTree = await searchHierarchy({
            isSysadmin: true,
            apiKey: session?.user.apikey ?? '',
            q: input.search,
            group_type: 'organization',
        })
        if (input.tree) {
            let groupFetchTree = groupTree[0] as GroupTree
            const findTree = findNameInTree(groupFetchTree, input.search)
            if (findTree) {
                groupFetchTree = findTree
            }
            groupTree = [groupFetchTree]
        }
    } else {
        groupTree = await getGroups({
            apiKey: session?.user.apikey ?? '',
            group_type: 'organization',
        })
    }

    const result = groupTree
    return {
        teams: result,
        teamsDetails: teamDetails,
        count: result.length,
    }
}

export async function getTopicTreeDetails({
    input,
    session,
}: {
    input: SearchInput
    session: Session | null
}) {
    let groupTree: GroupTree[] = []
    const allGroups = (await getUserGroups({
        apiKey: session?.user.apikey ?? '',
        userId: '',
    }))!
    const topicDetails = allGroups.reduce(
        (acc, org) => {
            acc[org.id] = {
                img_url: org.image_display_url,
                description: org.description,
                package_count: org.package_count,
                name: org.name,
            }
            return acc
        },
        {} as Record<string, GroupsmDetails>
    )

    for (const group in topicDetails) {
        const topic = topicDetails[group]!
        const packagedetails = (await getAllDatasetFq({
            apiKey: session?.user.apikey ?? '',
            fq: `groups:${topic.name}+is_approved:true`,
            query: { search: '', page: { start: 0, rows: 10000 } },
        }))!
        topic.package_count = packagedetails.count
    }
    if (input.search) {
        groupTree = await searchHierarchy({
            isSysadmin: true,
            apiKey: session?.user.apikey ?? '',
            q: input.search,
            group_type: 'group',
        })
        if (input.tree) {
            let groupFetchTree = groupTree[0] as GroupTree
            const findTree = findNameInTree(groupFetchTree, input.search)
            if (findTree) {
                groupFetchTree = findTree
            }
            groupTree = [groupFetchTree]
        }
    } else {
        groupTree = await getGroups({
            apiKey: session?.user.apikey ?? '',
        })
    }

    const result = groupTree
    return {
        topics: result,
        topicDetails: topicDetails,
        count: result.length,
    }
}

export async function getDatasetDetails({
    id,
    session,
}: {
    id: string
    session: Session | null
}) {
    try {
        const user = session?.user
        let datasetRes = await fetch(
            `${env.CKAN_URL}/api/action/package_show?id=${id}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${user?.apikey ?? ''}`,
                },
            }
        )
        if (datasetRes.status !== 200) {
            datasetRes = await fetch(
                `${env.CKAN_URL}/api/action/package_show?id=${id}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${user?.apikey ?? ''}`,
                    },
                }
            )
        }
        const dataset: CkanResponse<WriDataset> = await datasetRes.json()
        if (!dataset.success && dataset.error) {
            if (dataset.error.message) throw Error(dataset.error.message)
            throw Error(JSON.stringify(dataset.error))
        }
        return dataset.result
    } catch (e) {
        return {
            id,
            name: id,
            title: id,
            temporal_coverage_start: 1970,
            temporal_coverage_end: 1970,
            visibility_type: 'private',
        } as unknown as WriDataset
    }
}

function cryptoRandomFloat(): number {
    return randomBytes(4).readUInt32BE(0) / 0xffffffff
}

export async function getRandomUsernameFromEmail(
    email: string
): Promise<string> {
    const localpart = email.split('@')[0] as string
    const cleanedLocalpart = localpart.replace(/[^\w]/g, '-').toLowerCase()

    const maxNameCreationAttempts = 100

    const checkUsernameExists = async (username: string): Promise<boolean> => {
        const response = await fetch(
            `${env.CKAN_URL}/api/3/action/user_show?q=${username}`
        )
        const userData = (await response.json()) as CkanResponse<User>
        return !!userData.result
    }

    for (let i = 0; i < maxNameCreationAttempts; i++) {
        const randomNumber = cryptoRandomFloat()
        const randomSuffix = Math.floor(randomNumber * 10000)
        const randomName = `${cleanedLocalpart}-${randomSuffix}`

        const userExists = await checkUsernameExists(randomName)

        if (!userExists) {
            return randomName
        }
    }

    return cleanedLocalpart
}

export function generateRandomPassword(length: number): string {
    const charset =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+'
    let password = ''

    for (let i = 0; i < length; i++) {
        const randomNumber = cryptoRandomFloat()
        const randomIndex = Math.floor(randomNumber * charset.length)
        password += charset.charAt(randomIndex)
    }

    return password
}

export async function sendEmail(
    to: string,
    subject: string,
    html: string
): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const transporter = nodemailer.createTransport({
        host: env.SMTP_SERVER,
        port: Number(env.SMTP_PORT) || 0,
        secure: false,
        auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASSWORD,
        },
        connectionTimeout: 100 * 1000,
    })

    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        await transporter.sendMail({
            from: env.SMTP_FROM,
            to,
            subject,
            html,
        })
    } catch (error) {
        console.error(error)
        throw error
    }
}

export function generateEmail(
    email: string,
    password: string,
    username: string
): string {
    return `
        <p>Hi there,</p>
        <p>You have been invited to join the WRI OpenData Platform. Please use the following credentials to log in to ${env.NEXTAUTH_URL}:</p>
        <p>Username: ${username}</p>
        <p>Email: ${email}</p>
        <p>Password: ${password}</p>
        <p>Once you log in, remember to change your password</p>
        <p>Thanks!</p>
    `
}

export function generateInviteEmail(
    email: string,
    password: string,
    username: string,
    orgName: string,
    role: string
): string {
    return `
        <p>Hi there,</p>
        <p>You have been invited to join the WRI OpenData Platform and you have been added to the team ${orgName} 
        with the following role: ${role}.</p>
        <p>Please use the following credentials to log in to ${env.NEXTAUTH_URL}:</p>
        <p>Username: ${username}</p>
        <p>Email: ${email}</p>
        <p>Password: ${password}</p>
        <p>Once you log in, remember to change your password</p>
        <p>Thanks!</p>
    `
}

export async function generateMemberEmail(
    senderUser: User,
    recipientUser: User,
    notification: NotificationType
): Promise<{ subject: string; body: string }> {
    const actionType = notification.activity_type.split('_')
    const senderUsername = senderUser.fullname
        ? senderUser.fullname
        : senderUser.name
    const recipientUsername = recipientUser.fullname
        ? recipientUser.fullname
        : recipientUser.name

    let msg = ''
    let subject = ''
    let subMsg = ''
    let portalUrl = env.NEXTAUTH_URL ?? ''
    if (portalUrl.endsWith('/')) {
        portalUrl = portalUrl.slice(0, -1)
    }

    const senderUserLink = `<a href="${portalUrl}/dashboard/users?q=${senderUser.name}">${senderUsername}</a>`

    if (notification.object_type === 'dataset') {
        const dataset = await fetch(
            `${env.CKAN_URL}/api/3/action/package_show?id=${notification.object_id}`,
            {
                headers: {
                    Authorization: env.SYS_ADMIN_API_KEY,
                },
            }
        )
        const datasetData = (await dataset.json()) as CkanResponse<WriDataset>
        const datasetName = datasetData.result.name
        const datasetTitle = datasetData.result.title ?? datasetName
        const datasetLink = `<a href="${portalUrl}/datasets/${datasetName}">${datasetTitle}</a>`

        if (actionType[0] === 'collaborator') {
            const role = actionType[2]
            const action = actionType[1]
            if (action === 'removed') {
                subMsg = `${action} you as a collaborator (${role}) from the dataset`
                subject = `Collaborator role ${action} from dataset ${datasetTitle}`
                msg = `${senderUserLink} ${subMsg} ${datasetLink}`
            } else if (action === 'added') {
                subMsg = `${action} you as a collaborator (${role}) for the dataset`
                subject = `Collaborator role ${action} for dataset ${datasetTitle}`
                msg = `${senderUserLink} ${action} ${subMsg} ${datasetLink}`
            } else if (action === 'updated') {
                subMsg = `${action} your collaborator role to "${role}" for the dataset`
                subject = `Collaborator role ${action} for dataset ${datasetTitle}`
                msg = `${senderUserLink} ${action} ${subMsg} ${datasetLink}`
            }
        }
    } else if (
        notification.object_type === 'team' ||
        notification.object_type === 'topic'
    ) {
        const actionType = notification.activity_type.split('_')
        let teamOrTopic

        if (notification.object_type === 'team') {
            teamOrTopic = await fetch(
                `${env.CKAN_URL}/api/3/action/organization_show?id=${notification.object_id}`,
                {
                    headers: {
                        Authorization: env.SYS_ADMIN_API_KEY,
                    },
                }
            )
        } else if (notification.object_type === 'topic') {
            teamOrTopic = await fetch(
                `${env.CKAN_URL}/api/3/action/group_show?id=${notification.object_id}`,
                {
                    headers: {
                        Authorization: env.SYS_ADMIN_API_KEY,
                    },
                }
            )
        }

        if (!teamOrTopic) {
            throw new Error(
                `Could not find team or topic with id ${notification.object_id}`
            )
        }

        const teamOrTopicData = (await teamOrTopic.json()) as CkanResponse<
            Team | Topic
        >
        const teamOrTopicName = teamOrTopicData.result.name
        const teamOrTopicTitle = teamOrTopicData.result.title ?? teamOrTopicName
        const objectLink = `<a href="${portalUrl}/${
            notification.object_type === 'team' ? 'teams' : 'topics'
        }/${teamOrTopicData.result.name}">${teamOrTopicTitle}</a>`

        if (actionType[0] === 'member') {
            const role = actionType[2]
            const action = actionType[1]
            if (action === 'removed') {
                subMsg = `${action} you as a member${
                    role !== 'member' ? ` (${role})` : ''
                } from the ${notification.object_type}`
                subject = `Membership role ${action} from ${notification.object_type} ${teamOrTopicTitle}`
                msg = `${senderUserLink} ${subMsg} ${objectLink}`
            } else if (action === 'added') {
                subMsg = `${action} you as a member${
                    role !== 'member' ? ` (${role})` : ''
                } in the ${notification.object_type}`
                subject = `Membership role ${action} to ${notification.object_type} ${teamOrTopicTitle}`
                msg = `${senderUserLink} ${subMsg} ${objectLink}`
            } else if (action === 'updated') {
                subMsg = `${action} your member role to "${role}" in the ${notification.object_type}`
                subject = `Membership role ${action} in ${notification.object_type} ${teamOrTopicTitle}`
                msg = `${senderUserLink} ${subMsg} ${objectLink}`
            }
        }
    }

    const body = `
        <p>Hi ${recipientUsername},</p>
        <p>${msg}.</p>
        <p>Have a great day!</p>
        <p>Sent by the <a href="${portalUrl}">WRI OpenData Platform</a></p>
    `

    return {
        subject: subject,
        body: body,
    }
}

export async function sendMemberNotifications(
    currentUserId: string,
    newMembers: User[],
    existingMembers: User[],
    teamOrTopicId: any,
    objectType: string
): Promise<void> {
    const addedMembers = findAddedMembers(newMembers, existingMembers)
    const removedMembers = findRemovedMembers(newMembers, existingMembers)
    const updatedMembers = findUpdatedMembers(newMembers, existingMembers)
    const sendType = ['team', 'topic'].includes(objectType)
        ? 'member'
        : 'collaborator'

    for (const user of addedMembers) {
        await sendNotification(
            user,
            `${sendType}_added_${user.capacity}`,
            objectType,
            teamOrTopicId,
            currentUserId
        )
    }

    for (const user of removedMembers) {
        await sendNotification(
            user,
            `${sendType}_removed_${user.capacity}`,
            objectType,
            teamOrTopicId,
            currentUserId
        )
    }

    for (const user of updatedMembers) {
        await sendNotification(
            user,
            `${sendType}_updated_${user.capacity}`,
            objectType,
            teamOrTopicId,
            currentUserId
        )
    }
}

async function sendNotification(
    user: User,
    changeType: string,
    objectType: string,
    teamOrTopicId: string,
    currentUserId: string,
    includeEmail = true
) {
    if (user.name !== undefined) {
        const userObj = await getUser({
            userId: user.name,
            apiKey: env.SYS_ADMIN_API_KEY,
        })
        if (userObj && userObj.id !== undefined) {
            const notification = await createNotification(
                userObj.id,
                currentUserId,
                changeType,
                objectType,
                teamOrTopicId,
                true
            )
            if (includeEmail) {
                const senderUserObj = await getUser({
                    userId: currentUserId,
                    apiKey: env.SYS_ADMIN_API_KEY,
                })
                if (senderUserObj) {
                    const email = await generateMemberEmail(
                        senderUserObj,
                        userObj,
                        notification as NotificationType
                    )
                    await sendEmail(
                        userObj.email ?? '',
                        email.subject,
                        email.body
                    )
                }
            }
        }
    }
}

function findAddedMembers(newMembers: User[], existingMembers: User[]): User[] {
    const existingIds = new Set(existingMembers.map((user) => user.name))
    return newMembers.filter((user) => !existingIds.has(user.name))
}

function findRemovedMembers(
    newMembers: User[],
    existingMembers: User[]
): User[] {
    const newIds = new Set(newMembers.map((user) => user.name))
    return existingMembers.filter((user) => !newIds.has(user.name))
}

function findUpdatedMembers(
    newMembers: User[],
    existingMembers: User[]
): User[] {
    const existingIdMap = new Map(
        existingMembers.map((user) => [user.name, user])
    )
    return newMembers.filter((user) => {
        const existingUser = existingIdMap.get(user.name)
        return existingUser && user.capacity !== existingUser.capacity
    })
}

export async function createNotification(
    recipient_id: string,
    sender_id: string,
    activity_type: string,
    object_type: string,
    object_id: string,
    is_unread: boolean
) {
    try {
        const response = await fetch(
            `${env.CKAN_URL}/api/3/action/notification_create`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${env.SYS_ADMIN_API_KEY}`,
                },
                body: JSON.stringify({
                    recipient_id,
                    sender_id,
                    activity_type,
                    object_type,
                    object_id,
                    is_unread,
                }),
            }
        )
        const data =
            (await response.json()) as CkanResponse<NewNotificationInputType>
        if (!data.success && data.error) {
            if (data.error.message) throw Error(data.error.message)
            throw Error(JSON.stringify(data.error))
        }
        return data.result
    } catch (e) {
        console.error(e)
        return null
    }
}

export async function getTeamDetails({
    id,
    session,
}: {
    id: string
    session: Session | null
}) {
    const user = session?.user
    const teamRes = await fetch(
        `${env.CKAN_URL}/api/action/organization_show?id=${id}`,
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${user?.apikey ?? ''}`,
            },
        }
    )
    const team: CkanResponse<Team> = await teamRes.json()
    if (!team.success && team.error) {
        if (team.error.message) throw Error(team.error.message)
        throw Error(JSON.stringify(team.error))
    }
    return team.result
}

export async function getTopicDetails({
    id,
    session,
}: {
    id: string
    session: Session | null
}) {
    const user = session?.user
    const topicRes = await fetch(
        `${env.CKAN_URL}/api/action/group_show?id=${id}`,
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${user?.apikey ?? ''}`,
            },
        }
    )
    const topic: CkanResponse<Topic> = await topicRes.json()
    if (!topic.success && topic.error) {
        if (topic.error.message) throw Error(topic.error.message)
        throw Error(JSON.stringify(topic.error))
    }
    return topic.result
}

export async function getRecipient({
    owner_org,
    session,
}: {
    owner_org: string
    session: Session
}): Promise<WriUser[]> {
    try {
        const response = await fetch(
            `${env.CKAN_URL}/api/3/action/organization_show?id=${owner_org}&include_users=true`,
            {
                headers: {
                    Authorization: env.SYS_ADMIN_API_KEY,
                    'Content-Type': 'application/json',
                },
            }
        )

        if (!response.ok) {
            throw new Error(
                `Failed to fetch organization information: ${response.statusText}`
            )
        }

        const responseData =
            (await response.json()) as CkanResponse<WriOrganization | null>
        const organization: WriOrganization | null =
            responseData.success === true ? responseData.result : null

        if (organization) {
            const members = organization.users!

            // Filter members to include only admins and editors
            const adminAndEditorMembers = members.filter(
                (member) =>
                    member.capacity === 'admin' || member.capacity === 'editor'
            )

            // Extract member IDs into an array
            // const memberIds = adminAndEditorMembers.map((member) => member.id!)

            return adminAndEditorMembers
        } else {
            throw new Error(
                `Failed to fetch organization information: ${responseData.error?.message}`
            )
        }
    } catch (error) {
        console.error(`Error in getRecipient function`)
        throw error
    }
}

export async function sendIssueOrCommentNotigication({
    owner_org,
    creator_id,
    collaborator_id,
    dataset_id,
    session,
    title,
    action,
}: {
    owner_org: string | null
    creator_id: string | null
    collaborator_id: string[] | null
    dataset_id: string
    session: Session
    title: string
    action: string
}) {
    try {
        let recipientIds: string[] = []
        let recipientUsers: WriUser[] | null = null

        if (owner_org) {
            recipientUsers = (await getRecipient({
                owner_org: owner_org,
                session: session,
            }))!
            recipientIds = recipientUsers.map((user) => user.id!)
        } else if (creator_id) {
            recipientIds = [creator_id]
            const creatorUser = await getUser({
                userId: creator_id,
                apiKey: session.user.apikey,
            })
            recipientUsers = [creatorUser as WriUser]
        }

        if (collaborator_id) {
            recipientIds = recipientIds.concat(collaborator_id)
            const collaboratorUsers = await Promise.all(
                collaborator_id.map(async (id) => {
                    return await getUser({
                        userId: id,
                        apiKey: session.user.apikey,
                    })
                })
            )

            const collaboratorUsersw = collaboratorUsers as WriUser[]

            if (recipientUsers) {
                recipientUsers = recipientUsers.concat(collaboratorUsersw)
            } else {
                recipientUsers = collaboratorUsersw
            }
        }

        const dataset = await getDatasetDetails({
            id: dataset_id,
            session: session,
        })

        if (recipientIds.length > 0) {
            const titleNotification = title.split(' ').join('nbsp;')
            const notificationPromises = recipientIds.map((recipientId) => {
                return createNotification(
                    recipientId,
                    session.user.id,
                    `issue_${action}_${titleNotification}`,
                    'dataset',
                    dataset_id,
                    true
                )
            })

            await Promise.all(notificationPromises)

            if (recipientUsers) {
                await Promise.all(
                    recipientUsers
                        .filter((user) => user.email)
                        .map(async (user) => {
                            const subject = `Issue ${action} on dataset ${dataset.title}`
                            const body = `<p>Hi ${
                                user.name ?? user.display_name ?? 'There'
                            }</p>
                        <p>There has been an issue ${action} on the dataset ${
                            dataset.title
                        }.</p>`
                            const email = user.email!
                            return await sendEmail(email, subject, body)
                        })
                )
            }
        }
    } catch (error) {
        console.error(error)
        throw Error('Error in sending issue /comment notification')
    }
}

export async function getResourceViews({
    id,
    session,
}: {
    id: string
    session: Session | null
}) {
    const headers = {
        'Content-Type': 'application/json',
    } as any

    if (session) {
        headers['Authorization'] = session.user.apikey
    }

    const url = `${env.CKAN_URL}/api/action/resource_view_list?id=${id}`
    const viewsRes = await fetch(url, { headers })

    const views: CkanResponse<View[]> = await viewsRes.json()

    if (!views.success && views.error) {
        if (views.error.message) throw Error(views.error.message)
        throw Error(JSON.stringify(views.error))
    }

    return views.result
}

export async function getResourceView({
    id,
    session,
}: {
    id: string
    session: Session | null
}) {
    const headers = {
        'Content-Type': 'application/json',
    } as any

    if (session) {
        headers['Authorization'] = session.user.apikey
    }

    const viewsRes = await fetch(
        `${env.CKAN_URL}/api/action/resource_view_show?id=${id}`,
        { headers }
    )
    const views: CkanResponse<View> = await viewsRes.json()

    if (!views.success && views.error) {
        if (views.error.message) throw Error(views.error.message)
        throw Error(JSON.stringify(views.error))
    }

    return views.result
}

export async function createResourceView({
    view,
    session,
}: {
    view: CreateViewFormSchema
    session: Session | null
}) {
    const headers = {
        'Content-Type': 'application/json',
    } as any

    if (session) {
        headers['Authorization'] = session.user.apikey
    }

    const viewsRes = await fetch(
        `${env.CKAN_URL}/api/action/resource_view_create`,
        {
            method: 'POST',
            headers,
            body: JSON.stringify(view),
        }
    )
    const views: CkanResponse<View[]> = await viewsRes.json()

    if (!views.success && views.error) {
        if (views.error.message) throw Error(views.error.message)
        throw Error(JSON.stringify(views.error))
    }

    return views.result
}

export async function updateResourceView({
    view,
    session,
}: {
    view: EditViewFormSchema
    session: Session | null
}) {
    const headers = {
        'Content-Type': 'application/json',
    } as any

    if (session) {
        headers['Authorization'] = session.user.apikey
    }

    const viewsRes = await fetch(
        `${env.CKAN_URL}/api/action/resource_view_update`,
        {
            method: 'POST',
            headers,
            body: JSON.stringify(view),
        }
    )
    const views: CkanResponse<View[]> = await viewsRes.json()

    if (!views.success && views.error) {
        if (views.error.message) throw Error(views.error.message)
        throw Error(JSON.stringify(views.error))
    }

    return views.result
}

export async function deleteResourceView({
    id,
    session,
}: {
    id: string
    session: Session | null
}) {
    const headers = {
        'Content-Type': 'application/json',
    } as any

    if (session) {
        headers['Authorization'] = session.user.apikey
    }

    const viewsRes = await fetch(
        `${env.CKAN_URL}/api/action/resource_view_delete`,
        {
            method: 'POST',
            headers,
            body: JSON.stringify({ id }),
        }
    )
    const views: CkanResponse<View[]> = await viewsRes.json()

    if (!views.success && views.error) {
        if (views.error.message) throw Error(views.error.message)
        throw Error(JSON.stringify(views.error))
    }

    return views.result
}

export async function sendGroupNotification({
    owner_org,
    creator_id,
    collaborator_id,
    dataset_id,
    session,
    action,
}: {
    owner_org: string | null
    creator_id: string | null
    collaborator_id: string[] | null
    dataset_id: string
    session: Session
    action: string
}) {
    try {
        let recipientIds: string[] = []
        let recipientUsers: WriUser[] | null = null
        if (owner_org) {
            recipientUsers = (await getRecipient({
                owner_org: owner_org,
                session: session,
            }))!
            recipientIds = recipientUsers.map((user) => user.id!)
        }
        if (!recipientUsers?.some((x) => x.id === creator_id) && creator_id) {
            recipientIds = recipientIds.concat([creator_id])
            const creatorUser = await getUser({
                userId: creator_id,
                apiKey: session.user.apikey,
            })

            if (recipientUsers) {
                recipientUsers = recipientUsers.concat([creatorUser as WriUser])
            } else {
                recipientUsers = [creatorUser as WriUser]
            }
        }

        if (collaborator_id) {
            recipientIds = recipientIds.concat(collaborator_id)
            const collaboratorUsers = await Promise.all(
                collaborator_id.map(async (id) => {
                    return await getUser({
                        userId: id,
                        apiKey: session.user.apikey,
                    })
                })
            )

            const collaboratorUsersw = collaboratorUsers as WriUser[]

            if (recipientUsers) {
                recipientUsers = recipientUsers.concat(collaboratorUsersw)
            } else {
                recipientUsers = collaboratorUsersw
            }
        }

        // get all admin users
        let allUsers = await getAllUsers({ apiKey: env.SYS_ADMIN_API_KEY })
        allUsers = allUsers.filter(
            (x) => !recipientUsers?.find((s) => s.id === x.id) && x.sysadmin
        )
        const allUserIds = allUsers.map((x) => x.id) as string[]
        recipientIds = recipientIds.concat(allUserIds)
        if (recipientUsers) {
            recipientUsers = recipientUsers.concat(allUsers as WriUser)
        } else {
            recipientUsers = allUsers
        }

        const dataset = await getDatasetDetails({
            id: dataset_id,
            session: session,
        })

        if (recipientIds.length > 0) {
            const notificationPromises = recipientIds.map((recipientId) => {
                return createNotification(
                    recipientId,
                    session.user.id,
                    action,
                    'dataset',
                    dataset_id,
                    true
                )
            })

            await Promise.all(notificationPromises)

            if (recipientUsers) {
                await Promise.all(
                    recipientUsers
                        .filter((user) => user.email)
                        .map(async (user) => {
                            const mainAction = action.split('_')[0]
                            const subject = `Approval status on dataset ${dataset.title}`
                            const body = `<p>Hi ${
                                user.name ?? user.display_name ?? 'There'
                            }</p>
                        <p>The approval status for the dataset <a href="${
                            env.NEXTAUTH_URL
                        }/datasets/${dataset.name}">${
                            dataset.title
                        }</a> is now <b><string>${mainAction}</strong><b></p>`
                            const email = user.email!
                            return await sendEmail(email, subject, body)
                        })
                )
            }
        }
    } catch (error) {
        console.error(error)
        throw Error('Error in sending issue/comment notification')
    }
}

export async function getPackageDiff({
    id,
    session,
}: {
    id: string
    session: Session | null
}) {
    const user = session?.user
    const packageRes = await fetch(
        `${env.CKAN_URL}/api/action/pending_diff_show?id=${id}`,
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${user?.apikey ?? ''}`,
            },
        }
    )
    const packageData = (await packageRes.json()) as CkanResponse<
        Record<string, Record<string, never>>
    >
    if (!packageData.success && packageData.error) {
        if (packageData.error.message) throw Error(packageData.error.message)
        throw Error(JSON.stringify(packageData.error))
    }
    return packageData.result
}

export async function getDatasetViews({
    rwDatasetId,
}: {
    rwDatasetId: string
}) {
    const viewsRes = await fetch(
        `https://api.resourcewatch.org/v1/dataset/${rwDatasetId}/widget`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${env.RW_API_KEY}`,
                'Content-Type': 'application/json',
            },
        }
    )
    const result = await viewsRes.json()
    return result.data.map((d: any) => ({
        id: d.id,
        ...d.attributes.widgetConfig,
    })) as View[]
}

export async function getDatasetView({ id }: { id: string }) {
    const viewsRes = await fetch(
        `https://api.resourcewatch.org/v1/widget/${id}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${env.RW_API_KEY}`,
                'Content-Type': 'application/json',
            },
        }
    )
    const result = await viewsRes.json()
    return {
        id: result.data.id,
        ...result.data.attributes.widgetConfig,
    }
}

export async function patchDataset({
    dataset,
    session,
}: {
    dataset: Partial<WriDataset>
    session: Session
}) {
    const datasetRes = await fetch(`${env.CKAN_URL}/api/action/package_patch`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `${session.user.apikey}`,
        },
        body: JSON.stringify(dataset),
    })

    const datasetObj: CkanResponse<WriDataset> = await datasetRes.json()
    if (!datasetObj.success && datasetObj.error) {
        if (datasetObj.error.message) throw Error(datasetObj.error.message)
        throw Error(JSON.stringify(datasetObj.error))
    }
}

export async function updateDatasetHasChartsFlag({
    ckanDatasetId,
    session,
}: {
    ckanDatasetId: string
    session: Session
}) {
    const ckanDataset = await getOneDataset(ckanDatasetId, session)
    const ckanViews = ckanDataset.resources?.map((r) => r._views).flat() ?? []
    const ckanHasChartViews = ckanViews.some(
        (v) => v?.config_obj?.type == 'chart'
    )
    let hasChartViews = ckanHasChartViews

    if (ckanDataset?.rw_id) {
        const rwDatasetViews = await getDatasetViews({
            rwDatasetId: ckanDataset.rw_id,
        })
        const rwHasChartViews = rwDatasetViews.some(
            (v) => v?.config_obj?.type == 'chart'
        )

        hasChartViews = hasChartViews || rwHasChartViews
    }

    await patchDataset({
        session,
        dataset: { id: ckanDatasetId, has_chart_views: hasChartViews },
    })
}

export async function createDatasetView(input: CreateViewFormSchema) {
    const createRes = await fetch(
        `https://api.resourcewatch.org/v1/dataset/${input.resource_id}/widget`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${env.RW_API_KEY}`,
                'Content-Type': 'application/json',
            },
            // TODO: should application be the same as on the dataset metadata?
            body: JSON.stringify({
                name: input.title,
                application: ['rw'],
                widgetConfig: input,
            }),
        }
    )
    const result = await createRes.json()
    return result
}

export async function editDatasetView(input: EditViewFormSchema) {
    const createRes = await fetch(
        `https://api.resourcewatch.org/v1/dataset/${input.resource_id}/widget/${input.id}`,
        {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${env.RW_API_KEY}`,
                'Content-Type': 'application/json',
            },
            // TODO: should application be the same as on the dataset metadata?
            body: JSON.stringify({
                name: input.title,
                application: ['rw'],
                widgetConfig: input,
            }),
        }
    )
    const result = await createRes.json()
    return result
}

export async function deleteDatasetView(datasetId: string, id: string) {
    const createRes = await fetch(
        `https://api.resourcewatch.org/v1/dataset/${datasetId}/widget/${id}`,
        {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${env.RW_API_KEY}`,
                'Content-Type': 'application/json',
            },
        }
    )
    const result = await createRes.json()
    return result
}

export async function approvePendingDataset(
    datasetId: string,
    session: Session
) {
    const response = await fetch(
        `${env.CKAN_URL}/api/3/action/pending_dataset_show?package_id=${datasetId}`,
        {
            headers: {
                Authorization: session.user.apikey,
                'Content-Type': 'application/json',
            },
        }
    )
    const data = (await response.json()) as CkanResponse<PendingDataset>
    if (!data.success && data.error)
        throw Error(JSON.stringify(data.error).concat('pending_dataset_show'))

    let submittedDataset: WriDataset
    if (data.result && Object.keys(data.result.package_data).length > 0) {
        submittedDataset = data.result.package_data
        submittedDataset.approval_status = 'approved'
        submittedDataset.draft = false
        submittedDataset.is_approved = true
    } else {
        // fetch dataset from package_show
        const datasetRes = await fetch(
            `${env.CKAN_URL}/api/action/package_show?id=${datasetId}`,
            {
                headers: {
                    Authorization: session.user.apikey,
                    'Content-Type': 'application/json',
                },
            }
        )
        const dataset = (await datasetRes.json()) as CkanResponse<WriDataset>
        if (!dataset.success && dataset.error)
            throw Error(JSON.stringify(dataset.error).concat('package_show'))
        submittedDataset = dataset.result
        submittedDataset.approval_status = 'approved'
        submittedDataset.draft = false
        submittedDataset.is_approved = true
    }

    // fix datastore not working for initial csv
    const initialdataset = await getOneDataset(datasetId, session)
    const InitialresourcesWithoutLayer = initialdataset.resources.filter(
        (r) => !r.layerObj && !r.layerObjRaw
    )
    const resourcesWithoutLayer = submittedDataset.resources
        .filter((r) => !r.layerObj && !r.layerObjRaw)
        .map((r) => {
            const defaultResource = InitialresourcesWithoutLayer.find(
                (x) => x.id === r.id
            )
            if (defaultResource) {
                return {
                    ...r,
                    datastore_active: defaultResource.datastore_active,
                    hash: defaultResource.hash,
                    total_record_count: defaultResource.total_record_count,
                    size: defaultResource.size,
                }
            } else {
                return r
            }
        })

    let rw_id = submittedDataset.rw_id ?? null
    const isLayer = submittedDataset.resources.some((x) => x.format === 'Layer')

    const layerFilter = submittedDataset.resources.filter((x) => x.connectorUrl)
    const layer = layerFilter[0]!

    if (!submittedDataset.rw_id && isLayer) {
        const rwDataset = {
            title: submittedDataset.title! ?? '',
            connectorType: layer.connectorType!,
            connectorUrl: layer.connectorUrl!,
            provider: layer.provider!,
            tableName: layer.tableName!,
        }
        const datasetRw = await createDatasetRw(rwDataset as DatasetFormType)
        rw_id = datasetRw.data.id
    }

    const resourcesToEditLayer = submittedDataset.rw_id
        ? await Promise.all(
              submittedDataset.resources
                  .filter((r) => (r.layerObj || r.layerObjRaw) && r.rw_id && r.url)
                  .map(async (r) => {
                      const rr = r as ResourceFormType
                      if (r.layerObj) {
                          const layerForm = convertLayerObjToForm(r.layerObj)

                          rr.layerObj = layerForm
                          return await editLayerRw(rr)
                      }
                      const rawLayerForm = getRawObjFromApiSpec(r.layerObjRaw!)
                      rr.layerObjRaw = rawLayerForm
                      return await editLayerRw(rr)
                  })
          )
        : []

    const resourcesToCreateLayer =
        rw_id !== null
            ? await Promise.allSettled(
                  submittedDataset.resources
                      .filter((r) => (r.layerObj || r.layerObjRaw) && !r.url)
                      .map(async (r) => {
                          const rr = r as ResourceFormType
                          if (r.layerObj) {
                              const layerForm = convertLayerObjToForm(
                                  r.layerObj
                              )

                              rr.layerObj = layerForm
                              return await createLayerRw(rr, rw_id ?? '')
                          }
                          const rawLayerForm = getRawObjFromApiSpec(
                              r.layerObjRaw!
                          )
                          rr.layerObjRaw = rawLayerForm
                          return await createLayerRw(rr, rw_id ?? '')
                      })
              )
            : []

    // if there is some error, when creating layer, delete all layers and throw
    if (resourcesToCreateLayer.some((x) => x.status === 'rejected')) {
        const fulfilled = resourcesToCreateLayer
            .filter(assertFullfilled)
            .map((lp) => lp.value)
        await Promise.all(fulfilled.map(async (l) => await deleteLayerRw(l)))
        const errorString = resourcesToCreateLayer.reduce((acc, cur) => {
            if (cur.status === 'rejected') {
                return acc + ' - ' + cur.reason
            }
            return acc
        }, '')
        throw Error(errorString)
    }

    // filter fulfillped promises so typescript doesnt complain
    const resources = [
        ...resourcesWithoutLayer,
        ...resourcesToCreateLayer
            .filter(assertFullfilled)
            .map((lp) => lp.value),
        ...resourcesToEditLayer,
    ]

    submittedDataset.rw_id = rw_id!

    submittedDataset.resources = resources.map((resource) => {
        const schema = resource.schema as Resource['schema']
        return {
            ...resource,
            format: resource.format ?? '',
            id: resource.id,
            new: false,
            layerObjRaw: null,
            layerObj: null,
            url_type: resource.type,
            schema: resource.schema
                ? {
                      value: schema?.value,
                  }
                : '{}',
            url: resource.url ?? resource.name,
        }
    }) as Resource[]

    const datasetRes = await fetch(
        `${env.CKAN_URL}/api/action/package_update`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${session.user.apikey}`,
            },
            body: JSON.stringify(submittedDataset),
        }
    )
    const dataset = (await datasetRes.json()) as CkanResponse<WriDataset>
    if (!dataset.success && dataset.error) {
        if (dataset.error.message)
            throw Error(JSON.stringify(dataset.error).concat('package_update'))
        throw Error(JSON.stringify(dataset.error).concat('package_update'))
    }

    // get and close all dataset issues
    const issuesRes = await fetch(
        `${env.CKAN_URL}/api/action/issue_search?dataset_id=${dataset.result.id}`,
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${session.user.apikey}`,
            },
        }
    )
    const issues: CkanResponse<{ count: number; results: Issue[] }> =
        await issuesRes.json()
    if (!issues.success && issues.error) {
        if (issues.error.message) throw Error(issues.error.message)
        throw Error(JSON.stringify(issues.error))
    }

    await Promise.all(
        issues.result.results.map(async (issue) => {
            const inputData = {
                issue_number: issue.number,
                dataset_id: dataset.result.id,
                status: 'closed',
            }
            const response = await fetch(
                `${env.CKAN_URL}/api/3/action/issue_update`,
                {
                    method: 'POST',
                    body: JSON.stringify(inputData),
                    headers: {
                        Authorization: session.user.apikey,
                        'Content-Type': 'application/json',
                    },
                }
            )

            const data = (await response.json()) as CkanResponse<null>
            if (!data.success && data.error) throw Error(data.error.message)
            return issue
        })
    )

    if (!['private', 'draft'].includes(dataset.result.visibility_type)) {
        // send notification to user
        try {
            // get dataset collaborators id
            const collab = await fetchDatasetCollabIds(
                dataset.result.id,
                session.user.apikey
            )
            await sendGroupNotification({
                owner_org: dataset.result.owner_org
                    ? dataset.result.owner_org
                    : null,
                creator_id: dataset.result.creator_user_id,
                collaborator_id: collab,
                dataset_id: dataset.result.id,
                session: session,
                action: 'approved_dataset',
            })
        } catch (error) {
            console.log(error)
            throw Error('Error in sending issue /comment notification')
        }
    }

    // delete pending dataset
    const deleteResponse = await fetch(
        `${env.CKAN_URL}/api/3/action/pending_dataset_delete`,
        {
            method: 'POST',
            body: JSON.stringify({ package_id: datasetId }),
            headers: {
                Authorization: `${env.SYS_ADMIN_API_KEY}`,
                'Content-Type': 'application/json',
            },
        }
    )

    const deleteData = (await deleteResponse.json()) as CkanResponse<null>
    if (!deleteData.success && deleteData.error)
        throw Error(JSON.stringify(deleteData.error).concat('pending_delete'))
    return dataset.result
}

export const datasetFields = [
    'application',
    'approval_status',
    'author',
    'author_email',
    'citation',
    'creator_user_id',
    'draft',
    'featured_dataset',
    'has_chart_views',
    'id',
    'isopen',
    'license_id',
    'license_title',
    'maintainer',
    'maintainer_email',
    'metadata_created',
    'metadata_modified',
    'name',
    'num_resources',
    'num_tags',
    'organization',
    'owner_org',
    'private',
    'project',
    'rw_dataset',
    'rw_id',
    'short_description',
    'state',
    'technical_notes',
    'title',
    'type',
    'update_frequency',
    'url',
    'version',
    'visibility_type',
    'wri_data',
    'groups',
    'resources',
    'tags',
    'relationships_as_subject',
    'relationships_as_object',
    'notes',
    'open_in',
    'extras',
    'temporal_coverage_start',
    'temporal_coverage_end',
    'topics',
    'citation',
    'notes',
    'featured_dataset',
    'featured_image',
    'function',
    'restrictions',
    'reason_for_adding',
    'learn_more',
    'spatial',
    'spatial_address',
    'spatial_type',
    'methodology',
    'cautions',
    'function',
    'release_notes',
]

export function filterDatasetFields(dataset: any) {
    const filteredDataset: any = {}
    for (const field of datasetFields) {
        if (dataset[field]) {
            filteredDataset[field] = dataset[field]
        }
    }
    return filteredDataset
}
export async function fetchDatasetCollabIds(
    datasetId: string,
    userApiKey: string
) {
    const res = await fetch(
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
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: collaborators.error.message,
            })
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: JSON.stringify(collaborators.error),
        })
    }

    return collaborators.result.map((collaborator) => collaborator.user_id)
}

export async function getDatasetReleaseNotes({ id }: { id: string }) {
    const url = `${env.CKAN_URL}/api/3/action/dataset_release_notes?id=${id}`
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
        },
    })

    const releaseNotes: CkanResponse<
        { release_notes: string; date: string }[]
    > = await response.json()

    return releaseNotes.result
}

export async function generateDataSiteMap() {
    const packagedetails = (await getAllDatasetFq({
        apiKey: '',
        fq: `is_approved:true`,
        query: { search: '', page: { start: 0, rows: 100000 } },
    }))!

    const getAllOrg = await getAllOrganizations({ apiKey: '' })
    const orgs = getAllOrg.map((org) => {
        return {
            loc: `${env.NEXTAUTH_URL}/teams/${org.name}`,
            lastmod: new Date().toISOString(),
        }
    })

    const getGroups = (await getUserGroups({ apiKey: '', userId: '' }))!
    const groups = getGroups.map((group) => {
        return {
            loc: `${env.NEXTAUTH_URL}/topics/${group.name}`,
            lastmod: new Date().toISOString(),
        }
    })

    const sitemap = packagedetails.datasets.map((dataset) => {
        return {
            loc: `${env.NEXTAUTH_URL}/datasets/${dataset.name}`,
            lastmod: new Date().toISOString(),
        }
    })
    const general = [
        {
            loc: `${env.NEXTAUTH_URL}`,
            lastmod: new Date().toISOString(),
        },
        {
            loc: `${env.NEXTAUTH_URL}/topics`,
            lastmod: new Date().toISOString(),
        },
        {
            loc: `${env.NEXTAUTH_URL}/teams`,
            lastmod: new Date().toISOString(),
        },
        ...groups,
        ...orgs,
    ]
    sitemap.push(...general)
    return sitemap
}


export function advance_search_query(filters: Filter[]) {
    const keys = [...new Set(filters.map((f) => f.key))].filter(
            (key) => key != 'search'
    )
    
    const fq: any = {}
    let extLocationQ = ''
    let extAddressQ = ''

     keys.forEach((key) => {
            let keyFq

            const keyFilters = filters.filter((f) => f.key == key)
            if ((key as string) == 'temporal_coverage_start') {
                if (keyFilters.length > 0) {
                    const temporalCoverageStart = keyFilters[0]
                    const temporalCoverageEnd = filters.find(
                        (f) => f.key == 'temporal_coverage_end'
                    )?.value

                    keyFq = `[${temporalCoverageStart?.value} TO *]`

                    if (temporalCoverageEnd) {
                        keyFq = `[* TO ${temporalCoverageEnd}]`
                    }
                }
            } else if ((key as string) == 'temporal_coverage_end') {
                if (keyFilters.length > 0) {
                    const temporalCoverageEnd = keyFilters[0]
                    const temporalCoverageStart = filters.find(
                        (f) => f.key == 'temporal_coverage_start'
                    )?.value

                    keyFq = `[* TO ${temporalCoverageEnd?.value}]`

                    if (temporalCoverageStart) {
                        keyFq = `[${temporalCoverageStart} TO *]`
                    }
                }
            } else if (
                key === 'metadata_modified_since' ||
                key === 'metadata_modified_before'
            ) {
                const metadataModifiedSinceFilter = filters.find(
                    (f) => f.key === 'metadata_modified_since'
                )
                const metadataModifiedSince = metadataModifiedSinceFilter
                    ? metadataModifiedSinceFilter.value + 'T00:00:00Z'
                    : '*'

                const metadataModifiedBeforeFilter = filters.find(
                    (f) => f.key === 'metadata_modified_before'
                )
                const metadataModifiedBefore = metadataModifiedBeforeFilter
                    ? metadataModifiedBeforeFilter.value + 'T23:59:59Z'
                    : '*'

                fq[
                    'metadata_modified'
                ] = `[${metadataModifiedSince} TO ${metadataModifiedBefore}]`
            } else if (key == 'spatial') {
                const coordinates = keyFilters[0]?.value
                const address = keyFilters[0]?.label

                // @ts-ignore
                if (coordinates) extLocationQ = coordinates.reverse().join(',')
                if (address) extAddressQ = address
            } else {
                keyFq = keyFilters.map((kf) => `"${kf.value}"`).join(' OR ')
            }

            if (keyFq) fq[key as string] = keyFq
     })
    
    delete fq.metadata_modified_since
    delete fq.metadata_modified_before
    delete fq.spatial
    return { fq, extLocationQ, extAddressQ ,  search: filters.find((e) => e?.key == 'search')?.value ?? ''}
}

export async function getTokenList(session: Session)  {
    const response = await fetch(
        `${env.NEXT_PUBLIC_CKAN_URL}/api/3/action/api_token_list`,
        {
            method: 'POST',
            body: JSON.stringify({ user_id: session.user.id }),
            headers: {
                Authorization: session.user.apikey,
                'Content-Type': 'application/json',
            },
        }
    )

    const json = await response.json()

    return json
}

