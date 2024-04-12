import { z } from 'zod'
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from '@/server/api/trpc'
import { env } from '@/env.mjs'
import type {
    Activity,
    ActivityDisplay,
    CkanResponse,
    User,
} from '@/schema/ckan.schema'
import { getUser, activityDetails } from '@/utils/apiUtils'
import { searchArrayForKeyword } from '@/utils/general'
import { searchSchema } from '@/schema/search.schema'
import { filterObjects } from '@/utils/general'

export const activityStreamRouter = createTRPCRouter({
    listPackageActivity: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            let url = `${env.CKAN_URL}/api/3/action/package_activity_list?id=${input.id}`
            const fetchOps: any = { headers: {} }

            const user = ctx.session?.user
            if (user) {
                fetchOps.headers['Authorization'] = user.apikey
            }

            const response = await fetch(url, fetchOps)

            const data: CkanResponse<Activity[]> = await response.json()

            return data.result
        }),
    listActivityStreamDashboard: protectedProcedure
        .input(searchSchema)
        .query(async ({ input, ctx }) => {
            let url = `${env.CKAN_URL}/api/3/action/dashboard_activity_listv2`
            let search = ''

            if (input.fq) {
                if ('packageId' in input.fq) {
                    if (input.fq['packageId'] === 'all') {
                        search = 'packageId'
                    } else {
                        url = `${env.CKAN_URL}/api/3/action/package_activity_list_wri?id=${input.fq['packageId']}`
                    }
                } else if ('orgId' in input.fq) {
                    if (input.fq['orgId'] === 'all') {
                        search = 'orgId'
                    } else {
                        url = `${env.CKAN_URL}/api/3/action/organization_activity_list_wri?id=${input.fq['orgId']}`
                    }
                } else if ('groupId' in input.fq) {
                    if (input.fq['groupId'] === 'all') {
                        search = 'groupId'
                    } else {
                        url = `${env.CKAN_URL}/api/3/action/group_activity_list_wri?id=${input.fq['groupId']}`
                    }
                }
            }
            const response = await fetch(url, {
                headers: {
                    Authorization: ctx.session.user.apikey,
                },
            })

            const data = (await response.json()) as CkanResponse<Activity[]>
            const activities = data.result.map((activity: Activity) => {
                let user_data = activity.user_data as User
                const actitvityDetails = activityDetails(activity)
                actitvityDetails.description = `${user_data?.name} ${actitvityDetails.description}`
                return actitvityDetails
            })

            let result = activities
            if (search) {
                result = activities.filter((activity) => {
                    if (search === 'packageId') {
                        return activity.packageId
                    } else if (search === 'orgId') {
                        console.log('ORGID', activity.orgId, activity.packageId)
                        return activity.orgId
                    } else if (search === 'groupId') {
                        return activity.groupId
                    }
                })
            }

            return {
                activity: result
                    ? result.slice(
                          input.page.start,
                          input.page.start + input.page.rows
                      )
                    : [],
                count: result.length,
            }
        }),
})
