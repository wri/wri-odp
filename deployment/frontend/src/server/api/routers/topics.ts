import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure
} from "@/server/api/trpc";
import { env } from "@/env.mjs";
import { getGroups, getGroup } from "@/utils/apiUtils";
import { searchSchema } from "@/schema/search.schema";
import type { GroupTree } from "@/schema/ckan.schema";
import { searchArrayForKeyword } from "@/utils/general";


export const TopicRouter = createTRPCRouter({
  getUsersTopics: protectedProcedure
    .input(searchSchema)
    .query(async ({ input, ctx }) => {
      const groupTree = await getGroups({ apiKey: ctx.session.user.apikey });
      const groupDetails = await Promise.all(groupTree.map(async (group) => {
        const groupDetails = await getGroup({ apiKey: ctx.session.user.apikey, id: group.id });
        const rgroup = {
          ...group,
          image_display_url: groupDetails?.image_display_url
        }
        rgroup.children.map(async (child) => {
          const childDetails = await getGroup({ apiKey: ctx.session.user.apikey, id: child.id });
          child.image_display_url = childDetails?.image_display_url
          return child
        })
        return group
      }));
      let result = groupDetails;
      if (input.search) {
        result = searchArrayForKeyword<GroupTree>(groupDetails, input.search);
      }
      return {
        topics: result.slice(input.page.start, input.page.start + input.page.rows),
        count: result.length,
      }
    }),

});