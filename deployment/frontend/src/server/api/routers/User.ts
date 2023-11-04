import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure
} from "@/server/api/trpc";
import { env } from "@/env.mjs";
import { getUser, getUserOrganizations, getUserDataset } from "@/utils/apiUtils";

export const UserRouter = createTRPCRouter({
  getDashboardUser: protectedProcedure.query(async ({ ctx }) => {

    const userdetails = await getUser({ userId: ctx.session.user.id, apiKey: ctx.session.user.apikey });
    const organizations = await getUserOrganizations({ userId: ctx.session.user.id, apiKey: ctx.session.user.apikey });
    const TeamCount = organizations?.length;
    const dataset = await getUserDataset({ userId: ctx.session.user.id, apiKey: ctx.session.user.apikey });
    const DatasetCount = dataset?.count;
    const dashboardUser = {
      imageUrl: userdetails?.image_display_url,
      name: userdetails?.name,
      email: userdetails?.email,
      teamCount: TeamCount,
      datasetCount: DatasetCount,
      isSysAdmin: userdetails?.sysadmin
    }
    return {
      userdetails: dashboardUser
    }
  }),

});