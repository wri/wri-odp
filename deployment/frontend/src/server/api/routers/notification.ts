import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { env } from '@/env.mjs'
import type {
    Activity,
    ActivityDisplay,
    CkanResponse,
    User,
} from '@/schema/ckan.schema'
import {
    getUser,
    activityDetails,
    getDatasetDetails,
    getTeamDetails,
    getTopicDetails,
} from '@/utils/apiUtils'
import { searchArrayForKeyword } from '@/utils/general'
import { searchSchema } from '@/schema/search.schema'
import { filterObjects } from '@/utils/general'
import {
    NotificationSchema,
    NotificationInput,
} from '@/schema/notification.schema'
import type {
    NotificationType,
    NotificationInputType,
} from '@/schema/notification.schema'
import { timeAgo } from '@/utils/apiUtils'
import { replaceNames } from '@/utils/replaceNames'

export const notificationRouter = createTRPCRouter({
    getAllNotifications: protectedProcedure.query(async ({ ctx }) => {
        const response = await fetch(
            `${env.CKAN_URL}/api/3/action/notification_get_all?recipient_id=${ctx.session.user.id}`,
            {
                headers: {
                    Authorization: ctx.session.user.apikey,
                },
            }
        )

        const data = (await response.json()) as CkanResponse<NotificationType[]>
        
        const activities = await Promise.all(
            data.result.map(async (notification: NotificationType) => {
                let user_data = await getUser({
                    userId: notification.sender_id,
                    apiKey: ctx.session.user.apikey,
                })
                
                user_data = user_data === undefined ? null : user_data
                let objectName = ''
                let objectIdName = ''
                let msg = ''
                if (notification.object_type === 'dataset') {
                    const dataset = await getDatasetDetails({
                        id: notification.object_id,
                        session: ctx.session,
                    })
                    objectName = dataset?.title ?? dataset?.name ?? ''
                    objectIdName = dataset?.name

                    const actionType = notification.activity_type.split('_')

                    if (actionType[0] === 'collaborator') {
                        const role = actionType[2]
                        const action = actionType[1]
                        if (action === 'removed') {
                            msg = ` ${action} you as a collaborator (${role}) from the dataset`
                        } else if (action === 'added') {
                            msg = ` ${action} you as a collaborator (${role}) for the dataset`
                        } else if (action === 'updated') {
                            msg = ` ${action} your collaborator status to "${role}" for the dataset`
                        }
                    }
                    else if (actionType[0] === 'issue') {
                        const action = actionType[1]
                        if (action === 'created') {
                            msg = ` ${action} an issue (${actionType[2]?.split('nbsp;')?.join(' ')} ) for the dataset`
                        }
                        else if (action === 'commented') {
                            msg = ` ${action} on an issue (${actionType[2]?.split('nbsp;')?.join(' ')} ) for the dataset`
                        }
                        else if (action === 'closed') {
                             msg = ` ${action} an issue (${actionType[2]?.split('nbsp;')?.join(' ')} ) for the dataset`
                        }
                        else if (action === 'open') {
                             msg = ` re-${action} an issue (${actionType[2]?.split('nbsp;')?.join(' ')} ) for the dataset`
                        }
                        else if (action === "deleted") {
                             msg = ` ${action} an issue (${actionType[2]?.split('nbsp;')?.join(' ')} ) for the dataset`
                        }
                        
                    }
                    else {
                        if (notification.activity_type.includes(' ')) {
                            msg = ` ${notification.activity_type} `
                        } else {
                            msg = ` ${actionType[0]}  ${actionType[1]} `
                        }
                    }
                } else if (
                    notification.object_type === 'team' ||
                    notification.object_type === 'topic'
                ) {
                    const objectType = notification.object_type
                    let teamOrTopic = null

                    if (objectType === 'team') {
                        teamOrTopic = await getTeamDetails({
                            id: notification.object_id,
                            session: ctx.session,
                        })
                    } else {
                        teamOrTopic = await getTopicDetails({
                            id: notification.object_id,
                            session: ctx.session,
                        })
                    }

                    objectName = teamOrTopic?.title ?? teamOrTopic?.name ?? ''
                    objectIdName = teamOrTopic?.name ?? ''

                    const actionType = notification.activity_type.split('_')

                    if (actionType[0] === 'member') {
                        const role = actionType[2]
                        const action = actionType[1]
                        if (action === 'removed') {
                            msg = ` ${action} you as a member (${role}) from the ${notification.object_type}`
                        } else if (action === 'added') {
                            msg = ` ${action} you as a member${
                                role !== 'member' ? ` (${role})` : ''
                            } in the ${notification.object_type}`
                        } else if (action === 'updated') {
                            msg = ` ${action} your member status to "${role}" in the ${notification.object_type}`
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
                }
                return resultNotification
            })
        )
        return activities.filter(
            (notification) => notification.state !== 'deleted'
        )
    }),
    updateNotification: protectedProcedure
        .input(NotificationInput)
        .mutation(async ({ input, ctx }) => {
            try {
                const response = await Promise.all(
                    input.notifications.map(async (notification) => {
                        const payload: NotificationType = notification
                        if (input.state) payload.state = input.state
                        if (input.is_unread !== undefined) {
                            payload.is_unread = input.is_unread
                        }

                        const response = await fetch(
                            `${env.CKAN_URL}/api/3/action/notification_update`,
                            {
                                method: 'POST',
                                headers: {
                                    Authorization: ctx.session.user.apikey,
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(payload),
                            }
                        )
                        const data =
                            (await response.json()) as CkanResponse<NotificationType>
                        if (!data.success && data.error) {
                            if (data.error.message)
                                throw Error(
                                    replaceNames(data.error.message, true)
                                )
                            throw Error(
                                replaceNames(JSON.stringify(data.error), true)
                            )
                        }

                        return data.result
                    })
                )
                return response
            } catch (e) {
                let error =
                    'Something went wrong please contact the system administrator'
                if (e instanceof Error) error = e.message
                throw Error(replaceNames(error, true))
            }
        }),
})
