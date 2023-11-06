import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure
} from "@/server/api/trpc";
import { env } from "@/env.mjs";
import { getUser, getUserOrganizations, getUserDataset } from "@/utils/apiUtils";

export const OrganizationRouter = createTRPCRouter({
  getUsersOrganizations: protectedProcedure.query(async ({ ctx }) => {
    const organizations = (await getUserOrganizations({ userId: ctx.session.user.id, apiKey: ctx.session.user.apikey }))!;

    return {
      organizations: organizations
    }
  }),

});