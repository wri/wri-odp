import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure
} from "@/server/api/trpc";
import { env } from "@/env.mjs";
import type { Activity, ActivityDisplay, CkanResponse, User } from "@/schema/ckan.schema";
import { getUser, activityDetails, getDatasetDetails } from "@/utils/apiUtils";
import { searchArrayForKeyword } from "@/utils/general";
import { searchSchema } from "@/schema/search.schema";
import { filterObjects } from "@/utils/general";
import { NotificationSchema, NotificationInput } from "@/schema/notification.schema";
import type { NotificationType, NotificationInputType } from "@/schema/notification.schema";
import { timeAgo } from "@/utils/apiUtils";

export const notificationRouter = createTRPCRouter({
  getAllNotifications: protectedProcedure
    .query(async ({ ctx }) => {
      const response = await fetch(`${env.CKAN_URL}/api/3/action/notification_get_all?recipient_id=${ctx.session.user.id}`,
        {
          headers: {
            "Authorization": ctx.session.user.apikey,
          }
        })

      const data = (await response.json()) as CkanResponse<NotificationType[]>;
      const activities = await Promise.all(data.result.map(async (notification: NotificationType) => {
        let user_data = await getUser({ userId: notification.sender_id, apiKey: ctx.session.user.apikey });
        user_data = user_data === undefined ? null : user_data;
        let objectName = "";
        if (notification.object_type === "dataset") {
          const dataset = await getDatasetDetails({ id: notification.object_id, session: ctx.session });
          objectName = dataset?.title ?? dataset?.name ?? "";
         }
        const resultNotification = {
          ...notification,
          sender_name: user_data?.name,
          sender_image: user_data?.image_display_url,
          sender_emailHash: user_data?.email_hash,
          object_name: objectName,
          checked: false,
          time_sent: timeAgo(notification.time_sent!),
        }
        return resultNotification;
      }));



      return activities.filter((notification) => notification.state !== "deleted");  
     }),
})