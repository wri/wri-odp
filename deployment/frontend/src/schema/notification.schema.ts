import { z } from "zod";
import { User, WriDataset, WriOrganization } from "./ckan.schema";
import Team from "@/interfaces/team.interface";
import Topic from "@/interfaces/topic.interface";

export const NotificationSchema = z.object({
  id: z.string(),
  recipient_id: z.string(),
  sender_id: z.string(),
  activity_type: z.string(),
  object_type: z.string(),
  object_id: z.string(),
  time_sent: z.string().optional(),
  is_unread: z.boolean().optional(),
  state: z.string().optional(),
  checked: z.boolean().optional(),
  sender_name: z.string().optional(),
  object_name: z.string().optional(),
  sender_image: z.string().optional(),
  sender_emailHash: z.string().optional(),
  time_text: z.string().optional(),
  objectIdName: z.string().optional(),
  msg: z.string().optional(),

})

export type Notification = z.infer<typeof NotificationSchema>;

export interface NotificationType extends Notification {
  sender_obj?: User;
  object_data?: WriDataset | Topic | Team;
}

export const NotificationInput = z.object({
  notifications: z.array(NotificationSchema),
  state: z.string().optional(),
  is_unread: z.boolean().optional(),
})

export type NotificationInputType = z.infer<typeof NotificationInput>;

export const NewNotificationInput = z.object({
  recipient_id: z.string(),
  sender_id: z.string(),
  activity_type: z.string(),
  object_type: z.string(),
  object_id: z.string(),
  is_unread: z.boolean().optional(),
})

export type NewNotificationInputType = z.infer<typeof NewNotificationInput>;