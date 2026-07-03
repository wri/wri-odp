import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { env } from '@/env.mjs';
import {
    getAllDatasetFq,
    getUserOrganizations,
} from '@/utils/apiUtils';
import type { CkanResponse } from '@/schema/ckan.schema';
import type { NotificationType } from '@/schema/notification.schema';

async function fetchNotificationCount(recipientId: string): Promise<number> {
    const response = await fetch(
        `${env.CKAN_URL}/api/3/action/notification_get_all?recipient_id=${recipientId}&count_only=true`,
        {
            headers: {
                Authorization: env.SYS_ADMIN_API_KEY,
            },
        }
    );

    const data = (await response.json()) as CkanResponse<
        NotificationType[] | { count: number }
    >;

    if (!data.success) {
        return 0;
    }

    if (
        data.result &&
        typeof data.result === 'object' &&
        !Array.isArray(data.result) &&
        'count' in data.result
    ) {
        return data.result.count;
    }

    if (!Array.isArray(data.result)) {
        return 0;
    }

    return data.result.filter(
        (notification) =>
            notification.is_unread && notification.state !== 'deleted'
    ).length;
}

async function fetchPendingCount(
    userId: string,
    apiKey: string,
    sysadmin: boolean,
    organizations: { name: string }[]
): Promise<number> {
    let fq = 'approval_status:pending+visibility_type:(public OR internal)';

    if (!sysadmin) {
        if (organizations.length === 0) {
            return 0;
        }
        const orgsFq = `organization:(${organizations.map((org) => org.name).join(' OR ')})`;
        fq = `${fq}+${orgsFq}`;
    }

    const dataset = await getAllDatasetFq({
        apiKey,
        fq,
        query: {
            search: '',
            page: { start: 0, rows: 0 },
            sortBy: 'metadata_modified desc',
        },
        user: true,
    });

    return dataset.count;
}

export const dashboardRouter = createTRPCRouter({
    getLayoutBadges: protectedProcedure.query(async ({ ctx }) => {
        const user = ctx.session.user;

        if (user.sysadmin) {
            const [notificationCount, pendingCount] = await Promise.all([
                fetchNotificationCount(user.id),
                fetchPendingCount(user.id, user.apikey, true, []),
            ]);

            return {
                notificationCount,
                pendingCount,
                isOrgAdmin: true,
            };
        }

        const organizations = await getUserOrganizations({
            userId: user.id,
            apiKey: user.apikey,
        });

        const [notificationCount, pendingCount] = await Promise.all([
            fetchNotificationCount(user.id),
            fetchPendingCount(user.id, user.apikey, false, organizations),
        ]);

        return {
            notificationCount,
            pendingCount,
            isOrgAdmin: organizations.some((org) => org.capacity === 'admin'),
        };
    }),
});
