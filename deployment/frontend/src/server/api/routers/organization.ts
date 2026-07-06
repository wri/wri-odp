import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { env } from '@/env.mjs';
import {
    searchHierarchy,
    getAllOrganizations,
    getUserOrganizations,
} from '@/utils/apiUtils';
import { searchSchema } from '@/schema/search.schema';
import type { CkanResponse, WriOrganization } from '@/schema/ckan.schema';
import { collectGroupTreeImages } from '@/utils/flattenGroupTree';

export const OrganizationRouter = createTRPCRouter({
    getUsersOrganizations: protectedProcedure
        .input(searchSchema)
        .query(async ({ input, ctx }) => {
            const { groups, count } = await searchHierarchy({
                isSysadmin: ctx.session.user.sysadmin,
                apiKey: ctx.session.user.apikey,
                q: input.search || undefined,
                group_type: 'organization',
                page: input.page,
            });

            return {
                organizations: groups,
                count,
                org2Image: collectGroupTreeImages(groups),
            };
        }),
    getAllOrganizations: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.session.user.sysadmin) {
            const orgs = await getAllOrganizations({
                apiKey: ctx.session.user.apikey,
            });
            return orgs;
        } else {
            const orgs = await getUserOrganizations({
                userId: ctx.session.user.id,
                apiKey: ctx.session.user.apikey,
            });
            const response = await fetch(
                `${env.CKAN_URL}/api/3/action/organization_followee_list?id=${ctx.session.user.id}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${ctx.session.user.apikey}`,
                    },
                }
            );
            const data = (await response.json()) as CkanResponse<
                WriOrganization[]
            >;
            if (!data.success && data.error) throw Error(data.error.message);
            return orgs.concat(data.result);
        }
    }),
});
