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
    .query(async ({ input, ctx }) => {
      const user = ctx.session.user
      const url = input.ownerOrg
        ? `${env.CKAN_URL}/api/action/download_event_list?owner_org=${input.ownerOrg}`
        : `${env.CKAN_URL}/api/action/download_event_list`
      const downloadEventRes = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${user.apikey}`,
        },
      })
      const downloadEvents: CkanResponse<DownloadEvent[]> =
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
      const downloadEventRes = await fetch(
        `${env.CKAN_URL}/api/action/download_event_create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${env.SYS_ADMIN_API_KEY}`,
          },
          body: JSON.stringify(input),
        }
      )
      const downloadEvent: CkanResponse<DownloadEvent[]> =
        await downloadEventRes.json()
      console.log('DOWNLOAD EVENT', downloadEvent)
      return downloadEvent.result
    }),
})
