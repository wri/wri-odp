import { createTRPCRouter } from '@/server/api/trpc'
import { teamRouter } from './routers/teams'
import { topicRouter } from './routers/topics'
import { uploadsRouter } from './routers/uploads'
import { authRouter } from './routers/auth.router'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    auth: authRouter,
    teams: teamRouter,
    topics: topicRouter,
    uploads: uploadsRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
