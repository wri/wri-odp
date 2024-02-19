import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'
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
    listPackageActivity: publicProcedure.input(z.object({id: z.string()})).query(async ({input, ctx}) => {
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
            let url = `${env.CKAN_URL}/api/3/action/dashboard_activity_list`

            if (input.fq) {
                if ('package_id' in input.fq) {
                    url = `${env.CKAN_URL}/api/3/action/package_activity_list?id=${input.fq['package_id']}`
                } else if ('orgId' in input.fq) {
                    url = `${env.CKAN_URL}/api/3/action/organization_activity_list?id=${input.fq['orgId']}`
                }
            }
            const response = await fetch(url, {
                headers: {
                    Authorization: ctx.session.user.apikey,
                },
            })

            const data = (await response.json()) as CkanResponse<Activity[]>
            const activities = await Promise.all(
                data.result.map(async (activity: Activity) => {
                    let user_data = await getUser({
                        userId: activity.user_id,
                        apiKey: ctx.session.user.apikey,
                    })
                    user_data = user_data === undefined ? null : user_data
                    const actitvityDetails = activityDetails(activity)
                    actitvityDetails.description = `${user_data?.name} ${actitvityDetails.description}`
                    return actitvityDetails
                })
            )

            let result = activities
            if (input.search) {
                result = searchArrayForKeyword<ActivityDisplay>(
                    activities,
                    input.search
                )
            }

            if (input.fq && activities) {
                result = filterObjects(activities, input.fq)
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
