import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure
} from "@/server/api/trpc";
import { env } from "@/env.mjs";
import { getGroups, searchHierarchy } from "@/utils/apiUtils";
import { searchArrayForKeyword } from "@/utils/general";
import { searchSchema } from "@/schema/search.schema";
import type { GroupTree } from '@/schema/ckan.schema'

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

});