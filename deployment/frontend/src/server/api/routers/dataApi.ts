import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { z } from 'zod';

export const dataApiRouter = createTRPCRouter({
    getTilesInfo: publicProcedure
        .input(z.object({ assetId: z.string() }))
        .query(async ({ input }) => {
            const res = await fetch(
                `https://data-api.globalforestwatch.org/asset/${encodeURIComponent(input.assetId)}/tiles_info`,
                { redirect: 'follow' }
            );
            if (!res.ok) {
                throw new Error(
                    `tiles_info failed: ${res.status} ${res.statusText}`
                );
            }
            const geojson = (await res.json()) as {
                features?: Array<{
                    properties?: { name?: string };
                }>;
            };
            return (geojson.features ?? [])
                .map((f) => f.properties?.name ?? '')
                .filter(Boolean);
        }),
});
