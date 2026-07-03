import { createTRPCRouter } from '@/server/api/trpc';
import { activityStreamRouter } from '@/server/api/routers/activityStream';
import { UserRouter } from '@/server/api/routers/User';
import { DatasetRouter } from './routers/dataset';
import { OrganizationRouter } from './routers/organization';
import { TopicRouter } from './routers/topics';
import { teamRouter } from './routers/teams';
import { applicationRouter } from './routers/applications';
import { uploadsRouter } from './routers/uploads';
import { authRouter } from './routers/auth.router';
import { tagsRouter } from './routers/tags';
import { rwRouter } from './routers/rw';
import { dataApiRouter } from './routers/dataApi';
import { datastoreRouter } from './routers/datastore';
import { notificationRouter } from './routers/notification';
import type { inferRouterOutputs } from '@trpc/server';
import { prefectRouter } from './routers/prefect';
import { dashboardRouter } from './routers/dashboard';
import { downloadEventRouter } from './routers/download_event';

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
    applications: applicationRouter,
    uploads: uploadsRouter,
    teams: teamRouter,
    tags: tagsRouter,
    notification: notificationRouter,
    rw: rwRouter,
    dataApi: dataApiRouter,
    datastore: datastoreRouter,
    prefect: prefectRouter,
    downloadEvents: downloadEventRouter,
    dashboard: dashboardRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
export type RouterOutput = inferRouterOutputs<AppRouter>;
