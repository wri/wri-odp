import { createTRPCRouter } from "@/server/api/trpc";
import { activityStreamRouter } from "@/server/api/routers/activityStream";
import { UserRouter } from "@/server/api/routers/User";
import { DatasetRouter } from "./routers/dataset";
import { OrganizationRouter } from "./routers/organization";
import { TopicRouter } from "./routers/topics";
import { teamRouter } from './routers/teams'
import { uploadsRouter } from './routers/uploads'
import { authRouter } from './routers/auth.router'
import { tagsRouter } from "./routers/tags";
import { rwRouter } from "./routers/rw";
import { notificationRouter } from "./routers/notificaftion";
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  dashboardActivity: activityStreamRouter,
  auth: authRouter,
  user: UserRouter,
  dataset: DatasetRouter,
  organization: OrganizationRouter,
  topics: TopicRouter,
  uploads: uploadsRouter,
  teams: teamRouter,
  tags: tagsRouter,
  notification: notificationRouter,
  rw: rwRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter
export type RouterOutput = inferRouterOutputs<AppRouter>;

