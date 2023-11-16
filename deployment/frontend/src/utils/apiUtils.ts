import { env } from '@/env.mjs'
import type {
    Activity,
    ActivityDisplay,
    CkanResponse,
    User,
    WriDataset,
    WriOrganization,
    GroupTree,
} from '@/schema/ckan.schema'
import type { Group } from '@portaljs/ckan'
import type { SearchInput } from '@/schema/search.schema'
import { Facets } from '@/interfaces/search.interface'


export async function searchHierarchy({ apiKey, q, group_type }: { apiKey: string, q: string, group_type: string }): Promise<GroupTree[]> {
    try {
        const response = await fetch(`${env.CKAN_URL}/api/3/action/${group_type == "group" ? "group_list" : "organization_list"}?q=${q}&all_fields=True`, {
            headers: {
                "Authorization": apiKey,
            }
        });
        const data = (await response.json()) as CkanResponse<GroupTree[]>;

        const groups: GroupTree[] | [] = data.success === true ? data.result : [];

        const groupTree: GroupTree[] = await Promise.all(groups.map(async (group) => {
            const g = await fetch(`${env.CKAN_URL}/api/3/action/group_tree_section?id=${group.id}&type=${group_type}&all_fields=True`, {
                headers: {
                    "Authorization": apiKey,
                }
            });
            const d = (await g.json()) as CkanResponse<GroupTree>;
            if (d.success === true) {
                return d.result
            } else {
                return {} as GroupTree
            }
        }));
        return groupTree

    }
    catch (e) {
        console.log(e)
        throw new Error(e as string)
    }
}

export async function getGroups({
    apiKey,
    group_type = "group"
}: {
    apiKey: string,
    group_type?: string
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

export async function getAllOrganizations({ apiKey }: { apiKey: string }): Promise<WriOrganization[]> {
    try {
        const response = await fetch(`${env.CKAN_URL}/api/3/action/organization_list?all_fields=True`,
            {
                headers: {
                    "Authorization": apiKey,
                }
            });
        const data = (await response.json()) as CkanResponse<WriOrganization[]>;
        const organizations: WriOrganization[] | [] = data.success === true ? data.result : [];
        return organizations
    }
    catch (e) {
        console.error(e);
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
                method: 'POST',
                body: JSON.stringify({ id: userId }),
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
}: {
    apiKey: string
    fq: string
    query: SearchInput
    facetFields?: string[]
    sortBy?: string
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

export async function getUserOrganizations({ userId, apiKey }: { userId: string, apiKey: string }): Promise<WriOrganization[]> {
    try {
        const response = await fetch(`${env.CKAN_URL}/api/3/action/organization_list_for_user?all_fields=true`,
            {
                method: "POST",
                body: JSON.stringify({ id: userId }),
                headers: {
                    "Authorization": `${apiKey}`,
                    "Content-Type": "application/json"
                }
            });

        const data = (await response.json()) as CkanResponse<WriOrganization[]>;
        const organizations: WriOrganization[] | [] = data.success === true ? data.result : [];
        return organizations
    }
    catch (e) {
        console.error(e);
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

    const activityType = activity.activity_type?.split(" ");
    const action = activityType[0]!;
    let object = activityType[1]!;
    const actionType = activityType.join("_");
    let title = "";
    const GroupObject: Record<string, string> = {
        "group": "topic",
        "organization": "team"
    }
    if (object === "package") {
        title = activity.data?.package?.title ?? "";
    }
    else {
        title = activity.data?.group?.title ?? "";
        object = GroupObject[object]!;
    }
    const description = `${activitProperties[action]} the ${object} ${title}`;
    const time = timeAgo(activity.timestamp);
    return { description, time, icon: action, action, timestamp: activity.timestamp, actionType: actionType };
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
