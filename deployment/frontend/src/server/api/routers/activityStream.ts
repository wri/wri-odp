import { z } from 'zod';
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from '@/server/api/trpc';
import { env } from '@/env.mjs';
import type {
    Activity,
    CkanResponse,
} from '@/schema/ckan.schema';
import { activityDetails } from '@/utils/apiUtils';
import { searchSchema } from '@/schema/search.schema';

function withPaginationParams(
    url: string,
    page: { start: number; rows: number }
) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}limit=${page.rows}&offset=${page.start}`;
}

export const activityStreamRouter = createTRPCRouter({
    listPackageActivity: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            const url = `${env.CKAN_URL}/api/3/action/package_activity_list?id=${input.id}`;
            const fetchOps: any = { headers: {} };

            const user = ctx.session?.user;
            if (user) {
                fetchOps.headers.Authorization = user.apikey;
            }

            const response = await fetch(url, fetchOps);

            const data: CkanResponse<Activity[]> = await response.json();

            return data.result;
        }),
    listActivityStreamDashboard: protectedProcedure
        .input(searchSchema)
        .query(async ({ input, ctx }) => {
            let url = `${env.CKAN_URL}/api/3/action/dashboard_activity_listv2`;
            let search = '';

            if (input.fq) {
                if ('packageId' in input.fq) {
                    if (input.fq.packageId === 'all') {
                        search = 'packageId';
                    } else {
                        url = `${env.CKAN_URL}/api/3/action/package_activity_list_wri?id=${input.fq.packageId}`;
                    }
                } else if ('orgId' in input.fq) {
                    if (input.fq.orgId === 'all') {
                        search = 'orgId';
                    } else {
                        url = `${env.CKAN_URL}/api/3/action/organization_activity_list_wri?id=${input.fq.orgId}`;
                    }
                } else if ('groupId' in input.fq) {
                    if (input.fq.groupId === 'all') {
                        search = 'groupId';
                    } else {
                        url = `${env.CKAN_URL}/api/3/action/group_activity_list_wri?id=${input.fq.groupId}`;
                    }
                }
            }

            url = withPaginationParams(url, input.page);

            const response = await fetch(url, {
                headers: {
                    Authorization: ctx.session.user.apikey,
                },
            });

            const data = (await response.json()) as CkanResponse<Activity[]>;
            const activities = data.result.map((activity: Activity) => {
                const user_data = activity.user_data!;
                const activityDetailsObj = activityDetails(activity);
                const parts = activityDetailsObj.description.split(' ');

                try {
                    if (parts.length >= 4 && parts[1] === 'the') {
                        const maybeType = parts[2];
                        if (
                            typeof maybeType === 'string' &&
                            [
                                'dataset',
                                'team',
                                'topic',
                                'application',
                                'data',
                                'file',
                            ].includes(maybeType.toLowerCase())
                        ) {
                            parts[2] =
                                maybeType.charAt(0).toUpperCase() +
                                maybeType.slice(1);
                        }
                    }
                    activityDetailsObj.description = `${user_data?.name} ${parts.join(' ')}`;
                } catch {
                    activityDetailsObj.description = `${user_data?.name} ${activityDetailsObj.description}`;
                }

                return activityDetailsObj;
            });

            let result = activities;
            if (search) {
                result = activities.filter((activity) => {
                    if (search === 'packageId') {
                        return activity.packageId;
                    } else if (search === 'orgId') {
                        return activity.orgId;
                    } else if (search === 'groupId') {
                        return activity.groupId;
                    }
                });
            }

            return {
                activity: result ?? [],
                count: result?.length ?? 0,
            };
        }),
});
