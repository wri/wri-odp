import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure
} from "@/server/api/trpc";
import { env } from "@/env.mjs";
import { getUserOrganizations, getOrgDetails } from "@/utils/apiUtils";

export const TopicRouter = createTRPCRouter({
  getUsersTopics: protectedProcedure.query(async ({ ctx }) => {
    const organizations = (await getUserOrganizations({ userId: ctx.session.user.id, apiKey: ctx.session.user.apikey }))!;
    const org = await Promise.all(organizations.map(async (org) => {
      const orgDetails = await getOrgDetails({ orgId: org.id, apiKey: ctx.session.user.apikey });
      const packageCount = orgDetails?.package_count;
      const userCount = orgDetails?.users?.length ?? 0;
      const orgTitle = orgDetails?.title;
      const orgName = orgDetails?.name;
      const orgImage = orgDetails?.image_display_url;
      return {
        title: orgTitle,
        name: orgName,
        image_display_url: orgImage,
        description: `${userCount} Member(s) | ${packageCount} Datasets`
      }
    }));

    return {
      organizations: org
    }
  }),

});