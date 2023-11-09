import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure
} from "@/server/api/trpc";
import { env } from "@/env.mjs";
import type { Activity, ActivityDisplay, CkanResponse, User } from "@/schema/ckan.schema";
import { getUser, activityDetails } from "@/utils/apiUtils";
import { searchArrayForKeyword } from "@/utils/general";
import { searchSchema } from "@/schema/search.schema";
import { filterObjects } from "@/utils/general";

export const activityStreamRouter = createTRPCRouter({
  listActivityStreamDashboard: protectedProcedure
    .input(searchSchema)
    .query(async ({ input, ctx }) => {
      const response = await fetch(`${env.CKAN_URL}/api/3/action/dashboard_activity_list`,
        {
          headers: {
            "Authorization": ctx.session.user.apikey,
          }
        })

      const data = (await response.json()) as CkanResponse<Activity[]>;
      const activities = await Promise.all(data.result.map(async (activity: Activity) => {
        let user_data = await getUser({ userId: activity.user_id, apiKey: ctx.session.user.apikey });
        user_data = user_data === undefined ? null : user_data;
        const actitvityDetails = activityDetails(activity);
        actitvityDetails.description = `${user_data?.name} ${actitvityDetails.description}`
        return actitvityDetails;
      }));

      let result = activities;
      if (input.search) {
        result = searchArrayForKeyword<ActivityDisplay>(activities, input.search);
      }

      if (input.fq) {
        result = filterObjects(activities, input.fq);
      }

      return {
        activity: result.slice(input.page.start, input.page.start + input.page.rows),
        count: result.length,
      };
    }),

});