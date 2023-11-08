import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure
} from "@/server/api/trpc";
import { env } from "@/env.mjs";
import { getUserOrganizations, getOrgDetails } from "@/utils/apiUtils";
import { searchArrayForKeyword } from "@/utils/general";
import { searchSchema } from "@/schema/search.schema";

export const OrganizationRouter = createTRPCRouter({
  getUsersOrganizations: protectedProcedure
    .input(searchSchema)
    .query(async ({ input, ctx }) => {
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

      type IOrg = {
        title: string | undefined;
        name: string | undefined;
        image_display_url: string | undefined;
        description: string;
      }
      let result = org;
      if (input.search) {
        result = searchArrayForKeyword<IOrg>(org, input.search);
      }

      return {
        organizations: result.slice(input.page.start, input.page.start + input.page.rows),
        count: result.length,
      }
    }),

});