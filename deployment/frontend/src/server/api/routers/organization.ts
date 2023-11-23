import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure
} from "@/server/api/trpc";
import { env } from "@/env.mjs";
import { getGroups, searchHierarchy, getAllOrganizations, getUserOrganizations } from "@/utils/apiUtils";
import { searchArrayForKeyword } from "@/utils/general";
import { searchSchema } from "@/schema/search.schema";
import type { GroupTree, FolloweeList, CkanResponse, WriOrganization } from '@/schema/ckan.schema'

export const OrganizationRouter = createTRPCRouter({
  getUsersOrganizations: protectedProcedure
    .input(searchSchema)
    .query(async ({ input, ctx }) => {
      let groupTree: GroupTree[] = []

      if (input.search) {
        groupTree = await searchHierarchy({ isSysadmin: ctx.session.user.sysadmin, apiKey: ctx.session.user.apikey, q: input.search, group_type: 'organization' })
      }
      else {
        if (ctx.session.user.sysadmin) {
          groupTree = await getGroups({
            apiKey: ctx.session.user.apikey,
            group_type: "organization"
          })
        }
        else {
          groupTree = await searchHierarchy({ isSysadmin: ctx.session.user.sysadmin, apiKey: ctx.session.user.apikey, q: '', group_type: 'organization' })
        }
      }

      const result = groupTree
      return {
        organizations: result.slice(
          input.page.start,
          input.page.start + input.page.rows
        ),
        count: result.length,
      }
    }),
  getAllOrganizations: protectedProcedure.query(async ({ ctx }) => {

    if (ctx.session.user.sysadmin) {
      const orgs = await getAllOrganizations({ apiKey: ctx.session.user.apikey })
      return orgs
    }
    else {
      const orgs = await getUserOrganizations({ userId: ctx.session.user.id, apiKey: ctx.session.user.apikey })
      const response = await fetch(`${env.CKAN_URL}/api/3/action/followee_list?id=${ctx.session.user.id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${ctx.session.user.apikey}`,
        },
      })
      const data = (await response.json()) as CkanResponse<FolloweeList[]>
      if (!data.success && data.error) throw Error(data.error.message)
      const result = data.result.reduce((acc, item) => {
        if (item.type === 'organization') {
          const found = orgs.find((org) => org.display_name === item.display_name)
          if (!found) {
            const t = item.dict as WriOrganization;
            acc.push(t);
          }
        }
        return acc;
      }, [] as WriOrganization[]);
      return orgs.concat(result)
    }
  }),

});