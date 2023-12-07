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
} from '@/schema/ckan.schema'
import type { Group } from '@portaljs/ckan'
import type { SearchInput } from '@/schema/search.schema'
import { Facets } from '@/interfaces/search.interface'
import { replaceNames } from '@/utils/replaceNames'
import { Session } from 'next-auth'
import { Resource } from '@/interfaces/dataset.interface'
import { RwResponse, isRwError } from '@/interfaces/rw.interface'

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
}: {
    apiKey: string
    fq: string
    query: SearchInput
    facetFields?: string[]
    sortBy?: string
    extLocationQ?: string
    extAddressQ?: string
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
                Authorization: `${user?.apikey ?? ''}`,
            },
        }
    )
    const dataset: CkanResponse<WriDataset> = await datasetRes.json()
    if (!dataset.success && dataset.error) {
        if (dataset.error.message) throw Error(dataset.error.message)
        throw Error(JSON.stringify(dataset.error))
    }
    if (dataset.result.rw_id) {
        const rwRes = await fetch(
            `https://api.resourcewatch.org/v1/dataset/${dataset.result.rw_id}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${env.RW_API_KEY}`,
                },
            }
        )
        const datasetRw: RwResponse = await rwRes.json()
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
    }
    return {
        ...dataset.result,
        open_in: dataset.result.open_in
            ? Object.values(dataset.result.open_in)
            : [],
        spatial: dataset.result.spatial
            ? JSON.parse(dataset.result.spatial)
            : null,
        resources: dataset.result.resources.map(
            (r) =>
                ({
                    ...r,
                    _extra: {
                        is_layer: r.url?.startsWith(
                            'https://api.resourcewatch'
                        ),
                        rw_layer_id: r.url ? r.url.split('/').at(-1) : null,
                    },
                }) as Resource
        ),
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
                package_count: org.package_count,
            }
            return acc
        },
        {} as Record<string, GroupsmDetails>
    )

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
            }
            return acc
        },
        {} as Record<string, GroupsmDetails>
    )
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
