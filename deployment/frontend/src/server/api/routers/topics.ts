import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure
} from "@/server/api/trpc";
import { env } from "@/env.mjs";
import { getGroups, getGroup } from "@/utils/apiUtils";

export const TopicRouter = createTRPCRouter({
  getUsersTopics: protectedProcedure.query(async ({ ctx }) => {
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
    return {
      topics: groupDetails
    }
  }),

});