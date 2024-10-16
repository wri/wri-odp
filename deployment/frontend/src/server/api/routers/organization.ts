import {
  createTRPCRouter,
  protectedProcedure
} from "@/server/api/trpc";
import { env } from "@/env.mjs";
import { getGroups, searchHierarchy, getAllOrganizations, getUserOrganizations } from "@/utils/apiUtils";
import { searchSchema } from "@/schema/search.schema";
import type { GroupTree, CkanResponse, WriOrganization } from '@/schema/ckan.schema'

export const OrganizationRouter = createTRPCRouter({
  getUsersOrganizations: protectedProcedure
    .input(searchSchema)
    .query(async ({ input, ctx }) => {
      let groupTree: GroupTree[] = []
      const allOrg = await getAllOrganizations({ apiKey: ctx.session.user.apikey })
      const Org2Image = allOrg.reduce((acc, org) => {
        acc[org.id] = org.image_display_url!
        return acc
      }
        , {} as Record<string, string>)

      if (input.search) {
        groupTree = await searchHierarchy({ 
          isSysadmin: ctx.session.user.sysadmin, 
          apiKey: ctx.session.user.apikey, 
          q: input.search, 
          group_type: 'organization' })
      }
      else {
        groupTree = await searchHierarchy({ 
          isSysadmin: ctx.session.user.sysadmin, 
          apiKey: ctx.session.user.apikey, 
          q: '', 
          group_type: 'organization' })

      }

      const result = groupTree
      return {
        organizations: input.pageEnabled ? result.slice(input.page.start, input.page.start + input.page.rows) :  result ,
        count: result.length,
        org2Image: Org2Image
      }
    }),
  getAllOrganizations: protectedProcedure.query(async ({ ctx }) => {

    if (ctx.session.user.sysadmin) {
      const orgs = await getAllOrganizations({ apiKey: ctx.session.user.apikey })
      return orgs
    }
    else {
      const orgs = await getUserOrganizations({ userId: ctx.session.user.id, apiKey: ctx.session.user.apikey })
      const response = await fetch(`${env.CKAN_URL}/api/3/action/organization_followee_list?id=${ctx.session.user.id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${ctx.session.user.apikey}`,
        },
      })
      const data = (await response.json()) as CkanResponse<WriOrganization[]>
      if (!data.success && data.error) throw Error(data.error.message)
      return orgs.concat(data.result)
    }
  }),

});