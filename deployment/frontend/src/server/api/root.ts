import { exampleRouter } from "@/server/api/routers/example";
import { createTRPCRouter } from "@/server/api/trpc";
import { activityStreamRouter } from "@/server/api/routers/activityStream";
import { UserRouter } from "@/server/api/routers/User";
import { DatasetRouter } from "./routers/dataset";
import { OrganizationRouter } from "./routers/organization";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  dashboardActivity: activityStreamRouter,
  user: UserRouter,
  dataset: DatasetRouter,
  organization: OrganizationRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
