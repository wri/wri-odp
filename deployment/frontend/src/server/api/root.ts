import { exampleRouter } from "@/server/api/routers/example";
import { createTRPCRouter } from "@/server/api/trpc";
import { activityStreamRouter } from "@/server/api/routers/activityStream";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  dashboardActivity: activityStreamRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
