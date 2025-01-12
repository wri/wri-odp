import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from '@/server/api/trpc'
import { env } from '@/env.mjs'
import { CkanResponse } from '@/schema/ckan.schema'
import { z } from 'zod'
import { DownloadEvent } from '@/interfaces/downloadEvent.interface'
import { downloadEventSchema } from '@/components/_shared/DownloadPopup'

export const downloadEventRouter = createTRPCRouter({
    getAllEvents: protectedProcedure
        .input(
            z.object({
                ownerOrg: z.string().optional(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const user = ctx.session.user
            const url = input.ownerOrg
                ? `${env.CKAN_URL}/api/action/download_event_list?owner_org=${input.ownerOrg}&format=csv`
                : `${env.CKAN_URL}/api/action/download_event_list?&format=csv`
            const downloadEventRes = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${user.apikey}`,
                },
                body: JSON.stringify({
                    owner_org: input.ownerOrg,
                    format: 'csv',
                }),
            })
            const downloadEvents: CkanResponse<string> =
                await downloadEventRes.json()
            return downloadEvents.result
        }),
    createEvents: publicProcedure
        .input(
            downloadEventSchema.extend({
                resources: z.array(z.string()),
                package_id: z.string(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const _input = {
                ...input,
                affiliation: input.affiliation.value,
                country: input.country?.value,
                first_name: input.firstName,
                last_name: input.lastName,
            }
            const downloadEventRes = await fetch(
                `${env.CKAN_URL}/api/action/download_event_create`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${env.SYS_ADMIN_API_KEY}`,
                    },
                    body: JSON.stringify(_input),
                }
            )
            const downloadEvent: CkanResponse<DownloadEvent[]> =
                await downloadEventRes.json()
            console.log('DOWNLOAD EVENT', downloadEvent)
            return downloadEvent.result
        }),
})
