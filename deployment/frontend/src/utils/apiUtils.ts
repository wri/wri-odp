import { env } from "@/env.mjs";
import type { Activity, ActivityDisplay, CkanResponse, User, WriDataset, WriOrganization } from "@/schema/ckan.schema";

export async function getOrgDetails({ orgId, apiKey }: { orgId: string, apiKey: string }): Promise<WriOrganization | null> {
  try {
    const response = await fetch(`${env.CKAN_URL}/api/3/action/organization_show?id=${orgId}`,
      {
        headers: {
          "Authorization": apiKey,
        }
      });
    const data = (await response.json()) as CkanResponse<WriOrganization | null>;
    const organization: WriOrganization | null = data.success === true ? data.result : null;
    return organization
  }
  catch (e) {
    console.error(e);
    return null
  }
}

export async function getAllDatasetFq({ apiKey, fq }: { apiKey: string, fq: string }): Promise<WriDataset[] | null> {
  try {
    const response = await fetch(`${env.CKAN_URL}/api/3/action/package_search?q=${fq}`,
      {
        headers: {
          "Authorization": apiKey,
        }
      });
    const data = (await response.json()) as CkanResponse<{ results: WriDataset[], count: number }>;
    const datasets = data.success === true ? data.result.results : null;
    return datasets
  }
  catch (e) {
    console.error(e);
    return null
  }
}
export async function getUserOrganizations({ userId, apiKey }: { userId: string, apiKey: string }): Promise<WriOrganization[] | null> {
  try {
    const response = await fetch(`${env.CKAN_URL}/api/3/action/organization_list_for_user?all_fields=true`,
      {
        method: "POST",
        body: JSON.stringify({ id: userId }),
        headers: {
          "Authorization": apiKey,
          "Content-Type": "application/json"
        }
      });
    const data = (await response.json()) as CkanResponse<WriOrganization[] | null>;
    const organizations: WriOrganization[] | null = data.success === true ? data.result : null;
    return organizations
  }
  catch (e) {
    console.error(e);
    return null
  }
}

export async function getUserDataset({ userId, apiKey }: { userId: string, apiKey: string }): Promise<{ datasets: WriDataset[]; count: number } | null> {
  try {
    const response = await fetch(`${env.CKAN_URL}/api/3/action/package_search?q=creator_user_id:${userId}`,
      {
        headers: {
          "Authorization": apiKey,
        }
      });
    const data = (await response.json()) as CkanResponse<{ results: WriDataset[], count: number }>
    const datasets = data.result.results;
    const count = data.result.count;
    return { datasets, count }
  }
  catch (e) {
    console.error(e);
    return null

  }
}

export async function getUser({ userId, apiKey }: { userId: string, apiKey: string }): Promise<User | null> {
  try {
    const response = await fetch(`${env.CKAN_URL}/api/3/action/user_show?id=${userId}`,
      {
        headers: {
          "Authorization": apiKey,
        }
      });
    const data = (await response.json()) as CkanResponse<User | null>;
    const user: User | null = data.success === true ? data.result : null;
    return user
  }
  catch (e) {
    console.error(e);
    return null
  }
}

export function activityDetails(activity: Activity): ActivityDisplay {
  const activitProperties: Record<string, string> = {
    "new": "created",
    "changed": "updated",
    "deleted": "deleted",
  }

  const activityType = activity.activity_type?.split(" ");
  const action = activityType[0]!;
  const object = activityType[1]!;
  let title = "";
  if (object === "package") {
    title = activity.data?.package?.title ?? "";
  }
  else {
    title = activity.data?.group?.title ?? "";
  }
  const description = `${activitProperties[action]} the ${object} ${title}`;
  const time = timeAgo(activity.timestamp);
  return { description, time, icon: action };
}


export function timeAgo(timestamp: string): string {
  const currentDate = new Date();
  const date = new Date(timestamp);
  const timeDifference = currentDate.getTime() - date.getTime();

  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 1) {
    return `${days} days ago`;
  } else if (hours > 1) {
    return `${hours} hours ago`;
  } else if (minutes > 1) {
    return `${minutes} minutes ago`;
  } else {
    return `${seconds} seconds ago`;
  }
}