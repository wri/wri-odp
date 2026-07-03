import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { env } from '@/env.mjs';
import type { CkanResponse, WriDataset } from '@/schema/ckan.schema';

import { NotificationInput } from '@/schema/notification.schema';
import type { NotificationType } from '@/schema/notification.schema';
import { timeAgo } from '@/utils/apiUtils';
import { replaceNames } from '@/utils/replaceNames';
import type Team from '@/interfaces/team.interface';
import type Topic from '@/interfaces/topic.interface';
import { z } from 'zod';

function parseNotificationCount(
    data: CkanResponse<NotificationType[] | { count: number }>
): number {
    if (!data.success) {
        if (data.error?.message) {
            throw Error(replaceNames(data.error.message, true));
        }
        throw Error(
            replaceNames(
                data.error
                    ? JSON.stringify(data.error)
                    : 'Failed to fetch notifications',
                true
            )
        );
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
        (notification) => notification.is_unread && notification.state !== 'deleted'
    ).length;
}

function parseNotificationList(
    data: CkanResponse<NotificationType[]>
): NotificationType[] {
    if (!data.success) {
        if (data.error?.message) {
            throw Error(replaceNames(data.error.message, true));
        }
        throw Error(
            replaceNames(
                data.error
                    ? JSON.stringify(data.error)
                    : 'Failed to fetch notifications',
                true
            )
        );
    }

    return Array.isArray(data.result) ? data.result : [];
}

export const notificationRouter = createTRPCRouter({
    getAllNotifications: protectedProcedure
        .input(
            z.object({
                returnLength: z.boolean().optional(),
                limit: z.number().int().positive().optional(),
            })
        )
        .query(async ({ input, ctx }) => {
            const authHeader = env.SYS_ADMIN_API_KEY;
            const recipientId = ctx.session.user.id;

            if (!input.returnLength) {
                const response = await fetch(
                    `${env.CKAN_URL}/api/3/action/notification_get_all?recipient_id=${recipientId}&count_only=true`,
                    {
                        headers: {
                            Authorization: authHeader,
                        },
                    }
                );

                const data = (await response.json()) as CkanResponse<
                    NotificationType[] | { count: number }
                >;

                return { count: parseNotificationCount(data) };
            }

            const limitParam =
                input.limit !== undefined ? `&limit=${input.limit}` : '';

            const response = await fetch(
                `${env.CKAN_URL}/api/3/action/notification_get_all?recipient_id=${recipientId}${limitParam}`,
                {
                    headers: {
                        Authorization: authHeader,
                    },
                }
            );

            const data = (await response.json()) as CkanResponse<
                NotificationType[]
            >;

            const notifications = parseNotificationList(data);

            const activities: NotificationType[] = [];

            // Used to fix object capitalization
            const titleCase = (str: string) =>
                str
                    .split(' ')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

            for (const notification of notifications) {
                if (notification.state === 'deleted') continue;
                if (!notification.sender_obj) continue;

                const user_data = notification.sender_obj;

                let objectName = '';
                let objectIdName = '';
                let msg = '';
                if (notification.object_type === 'dataset') {
                    const dataset = notification.object_data as WriDataset | undefined;
                    if (!dataset) continue;
                    objectName = dataset.title ?? dataset.name ?? '';
                    objectIdName = dataset.name;

                    const actionType = notification.activity_type.split('_');

                    if (actionType[0] === 'collaborator') {
                        const role = actionType[2];
                        const action = actionType[1];
                        if (action === 'removed') {
                            msg = ` ${action} you as a collaborator (${role}) from the Dataset`;
                        } else if (action === 'added') {
                            msg = ` ${action} you as a collaborator (${role}) for the Dataset`;
                        } else if (action === 'updated') {
                            msg = ` ${action} your collaborator status to "${role}" for the Dataset`;
                        }
                    } else if (actionType[0] === 'issue') {
                        const action = actionType[1];
                        if (action === 'created') {
                            msg = ` ${action} an issue (${actionType[2]
                                ?.split('nbsp;')
                                ?.join(' ')} ) for the Dataset`;
                        } else if (action === 'commented') {
                            msg = ` ${action} on an issue (${actionType[2]
                                ?.split('nbsp;')
                                ?.join(' ')} ) for the Dataset`;
                        } else if (action === 'closed') {
                            msg = ` ${action} an issue (${actionType[2]
                                ?.split('nbsp;')
                                ?.join(' ')} ) for the Dataset`;
                        } else if (action === 'open') {
                            msg = ` re-${action} an issue (${actionType[2]
                                ?.split('nbsp;')
                                ?.join(' ')} ) for the Dataset`;
                        } else if (action === 'deleted') {
                            msg = ` ${action} an issue (${actionType[2]
                                ?.split('nbsp;')
                                ?.join(' ')} ) for the Dataset`;
                        }
                    } else if (actionType[0] === 'pending') {
                        msg = ` created ${actionType[0]}  ${titleCase(actionType[1] ?? '')} `;
                    } else {
                        if (notification.activity_type.includes(' ')) {
                            const parts = notification.activity_type.split(' ');
                            // Fixes object capitalization
                            const objectTypeFixed = parts[1]
                                ? parts[1].charAt(0).toUpperCase() +
                                  parts[1].slice(1)
                                : '';
                            msg = ` ${parts[0]} ${objectTypeFixed} `;
                        } else {
                            msg = ` ${actionType[0]}  ${titleCase(actionType[1] ?? '')} `;
                        }
                    }
                } else if (
                    notification.object_type === 'team' ||
                    notification.object_type === 'topic'
                ) {
                    const objectType = notification.object_type;
                    let teamOrTopic = null;

                    if (objectType === 'team') {
                        teamOrTopic = notification.object_data as Team;
                    } else {
                        teamOrTopic = notification.object_data as Topic;
                    }

                    if (!teamOrTopic) continue;

                    objectName = teamOrTopic.title ?? teamOrTopic.name ?? '';
                    objectIdName = teamOrTopic?.name ?? '';

                    const actionType = notification.activity_type.split('_');

                    if (actionType[0] === 'member') {
                        const role = actionType[2];
                        const action = actionType[1];
                        if (action === 'removed') {
                            msg = ` ${action} you as a member (${role}) from the ${titleCase(notification.object_type ?? '')}`;
                        } else if (action === 'added') {
                            msg = ` ${action} you as a member${
                                role !== 'member' ? ` (${role})` : ''
                            } in the ${titleCase(notification.object_type ?? '')}`;
                        } else if (action === 'updated') {
                            msg = ` ${action} your member status to "${role}" in the ${titleCase(notification.object_type ?? '')}`;
                        }
                    }
                }

                const resultNotification = {
                    ...notification,
                    sender_name: user_data?.name,
                    sender_image: user_data?.image_display_url ?? '',
                    sender_emailHash: user_data?.email_hash,
                    object_name: objectName,
                    checked: false,
                    time_text: timeAgo(notification.time_sent!),
                    objectIdName: objectIdName,
                    msg: msg ?? '',
                };
                activities.push(resultNotification);
            }

            return activities;
        }),
    updateNotification: protectedProcedure
        .input(NotificationInput)
        .mutation(async ({ input }) => {
            try {
                const notificationPayload: NotificationType[] =
                    input.notifications.map((notification) => {
                        if (input.state) notification.state = input.state;
                        if (input.is_unread !== undefined) {
                            notification.is_unread = input.is_unread;
                        }
                        return notification;
                    });

                const response = await fetch(
                    `${env.CKAN_URL}/api/3/action/notification_bulk_update`,
                    {
                        method: 'POST',
                        headers: {
                            Authorization: env.SYS_ADMIN_API_KEY,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ payload: notificationPayload }),
                    }
                );

                const data = (await response.json()) as CkanResponse<number>;
                if (!data.success && data.error) {
                    if (data.error.message)
                        throw Error(replaceNames(data.error.message, true));
                    throw Error(replaceNames(JSON.stringify(data.error), true));
                }

                return data.result;
            } catch (e) {
                let error =
                    'Something went wrong please contact the system administrator';
                if (e instanceof Error) error = e.message;
                throw Error(replaceNames(error, true));
            }
        }),
});
