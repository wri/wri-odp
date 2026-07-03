import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from '@/server/api/trpc';
import { env } from '@/env.mjs';
import { type CkanResponse } from '@/schema/ckan.schema';
import { type Organization } from '@/schema/ckan.schema';
import { TeamSchema } from '@/schema/team.schema';
import { z } from 'zod';
import { replaceNames } from '@/utils/replaceNames';
import { searchSchema } from '@/schema/search.schema';
import type {
    User,
    WriOrganization,
} from '@/schema/ckan.schema';
import {
    searchHierarchy,
    fetchFacets,
} from '@/utils/apiUtils';
import { sendMemberNotifications } from '@/utils/apiUtils';
import { flattenTree, collectGroupDetails } from '@/utils/flattenGroupTree';

export const teamRouter = createTRPCRouter({
    getAllTeams: protectedProcedure.query(async ({ ctx }) => {
        const user = ctx.session.user;
        const teamsMap = new Map();
        const teamsList = await Promise.all(
            [0, 1, 2, 3, 4, 5].map(async (i) => {
                const teamRes = await fetch(
                    user.sysadmin
                        ? `${
                              env.CKAN_URL
                          }/api/action/organization_list?all_fields=True&include_extras=true&limit=${
                              (i + 1) * 25
                          }&offset=${i * 25}`
                        : `${
                              env.CKAN_URL
                          }/api/action/organization_list_for_user?all_fields=True&include_extras=true&limit=${
                              (i + 1) * 25
                          }&offset=${i * 25}`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `${user.apikey}`,
                        },
                    }
                );
                const teams: CkanResponse<WriOrganization[]> =
                    await teamRes.json();
                if (!teams.success && teams.error) {
                    if (teams.error.message)
                        throw Error(replaceNames(teams.error.message, true));
                    throw Error(
                        replaceNames(JSON.stringify(teams.error), true)
                    );
                }
                teams.result.forEach((team) => {
                    if (teamsMap.has(team.id)) return;
                    teamsMap.set(team.id, team);
                });
            })
        );
        return Array.from(teamsMap.values()).sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            return nameA.localeCompare(nameB, undefined, {
                numeric: true,
                sensitivity: 'base',
            });
        });
    }),
    editTeam: protectedProcedure
        .input(TeamSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                const user = ctx.session.user;

                const newMembers = [];
                for (const member of input.members) {
                    newMembers.push({
                        name: member.user.value,
                        capacity: member.capacity.value,
                    });
                }
                try {
                    sendMemberNotifications(
                        user.id,
                        newMembers,
                        input.users,
                        input.id,
                        'team'
                    );
                } catch (e) {
                    console.error(e);
                }
                input.users = newMembers;
                const body = JSON.stringify({
                    ...input,
                    image_display_url: input.image_url
                        ? `${env.CKAN_URL}/uploads/group/${input.image_url}`
                        : null,
                    groups:
                        input.parent && input.parent.value !== ''
                            ? [{ name: input.parent.value }]
                            : [],
                    visibility: input.visibility.value,
                });
                const teamRes = await fetch(
                    `${env.CKAN_URL}/api/action/organization_patch`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `${user.apikey}`,
                        },
                        body,
                    }
                );
                const team: CkanResponse<Organization> = await teamRes.json();
                if (!team.success && team.error) {
                    if (team.error.message)
                        throw Error(replaceNames(team.error.message, true));
                    throw Error(replaceNames(JSON.stringify(team.error), true));
                }
                return team.result;
            } catch (e) {
                let error =
                    'Something went wrong please contact the System Administrator';
                if (e instanceof Error) error = e.message;
                throw Error(replaceNames(error, true));
            }
        }),
    getTeam: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const user = ctx.session.user;
            const teamRes = await fetch(
                `${env.CKAN_URL}/api/action/organization_show?id=${input.id}&include_users=True&include_extras=true`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${user.apikey}`,
                    },
                }
            );

            const team: CkanResponse<
                WriOrganization & {
                    groups: Organization[];
                }
            > = await teamRes.json();
            return {
                ...team.result,
                parent: team.result.groups[0]?.name ?? null,
            };
        }),
    deleteTeam: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            try {
                const user = ctx.session.user;
                const teamRes = await fetch(
                    `${env.CKAN_URL}/api/action/organization_delete`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `${user.apikey}`,
                        },
                        body: JSON.stringify({ id: input.id }),
                    }
                );
                const team: CkanResponse<
                    Organization & { groups: Organization[] }
                > = await teamRes.json();
                if (!team.success && team.error) {
                    if (team.error.message)
                        throw Error(replaceNames(team.error.message, true));
                    throw Error(replaceNames(JSON.stringify(team.error), true));
                }
                return {
                    ...team.result,
                };
            } catch (e) {
                let error =
                    'Something went wrong please contact the System Administrator';
                if (e instanceof Error) error = e.message;
                throw Error(replaceNames(error, true));
            }
        }),
    getTeamUsers: protectedProcedure
        .input(z.object({ id: z.string(), capacity: z.string().optional() }))
        .query(async ({ ctx, input }) => {
            const user = ctx.session.user;
            const membersListRes = await fetch(
                `${env.CKAN_URL}/api/action/member_list?id=${input.id}${
                    input.capacity ? `&capacity=${input.capacity}` : ''
                }&object_type=user`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${user.apikey}`,
                    },
                }
            );
            const membersList: CkanResponse<string[][]> =
                await membersListRes.json();
            return membersList.result;
        }),
    createTeam: protectedProcedure
        .input(TeamSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                const user = ctx.session.user;

                // only sysadmin is allowed to create Parent teams
                if (
                    !user.sysadmin &&
                    (!input.parent || input.parent.value === '')
                )
                    throw Error('Only Sysadmins can create parent Teams');

                const body = JSON.stringify({
                    ...input,
                    image_display_url: input.image_url
                        ? `${env.CKAN_URL}/uploads/group/${input.image_url}`
                        : null,
                    groups:
                        input.parent && input.parent.value !== ''
                            ? [{ name: input.parent.value }]
                            : [],
                    visibility: input.visibility.value,
                });

                const teamRes = await fetch(
                    `${env.CKAN_URL}/api/action/organization_create`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `${user.apikey}`,
                        },
                        body,
                    }
                );
                const team: CkanResponse<Organization> = await teamRes.json();
                if (!team.success && team.error) {
                    if (team.error.message)
                        throw Error(replaceNames(team.error.message, true));
                    throw Error(replaceNames(JSON.stringify(team.error), true));
                }
                return team.result;
            } catch (e) {
                let error =
                    'Something went wrong please contact the System Administrator';
                if (e instanceof Error) error = e.message;
                throw Error(replaceNames(error, true));
            }
        }),
    deleteDashboardTeam: protectedProcedure
        .input(z.string())
        .mutation(async ({ input, ctx }) => {
            try {
                const response = await fetch(
                    `${env.CKAN_URL}/api/3/action/organization_delete`,
                    {
                        method: 'POST',
                        body: JSON.stringify({ id: input }),
                        headers: {
                            Authorization: ctx.session.user.apikey,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                const data = (await response.json()) as CkanResponse<null>;
                if (!data.success && data.error)
                    throw Error(replaceNames(data.error.message, true));
                return data;
            } catch (e) {
                let error =
                    'Something went wrong please contact the System Administrator';
                if (e instanceof Error) error = e.message;
                throw Error(replaceNames(error, true));
            }
        }),
    getGeneralTeam: publicProcedure
        .input(searchSchema)
        .query(async ({ input, ctx }) => {
            const groupTree = await searchHierarchy({
                isSysadmin: true,
                apiKey: ctx?.session?.user.apikey ?? '',
                q: input.search || undefined,
                group_type: 'organization',
            });

            if (groupTree.length === 0) {
                return {
                    teams: groupTree,
                    teamsDetails: {},
                    subTeamCounts: {},
                    count: 0,
                };
            }

            const paginated = groupTree.slice(
                input.page.start,
                input.page.start + input.page.rows
            );

            const teamsDetails = collectGroupDetails(paginated);

            if (ctx.session?.user) {
                const facets = await fetchFacets(
                    teamsDetails,
                    'organization',
                    ctx.session.user.apikey ?? ''
                );

                for (const group in teamsDetails) {
                    const team = teamsDetails[group]!;
                    team.package_count = facets[team.name] ?? 0;
                }
            }

            return {
                teams: paginated,
                teamsDetails,
                subTeamCounts: flattenTree(groupTree),
                count: groupTree.length,
            };
        }),
    getPossibleMembers: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const user = ctx.session.user;
            const teamRes = await fetch(
                `${env.CKAN_URL}/api/action/organization_show?id=${input.id}&include_users=True`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${user.apikey}`,
                    },
                }
            );
            const team: CkanResponse<
                Organization & { groups: Organization[] }
            > = await teamRes.json();
            if (!team.success && team.error) {
                if (team.error.message)
                    throw Error(replaceNames(team.error.message, true));
                throw Error(replaceNames(JSON.stringify(team.error), true));
            }
            const teamUsers = team?.result?.users?.map(
                (user) => user.name
            ) as string[];
            const usersRes = await fetch(
                `${env.CKAN_URL}/api/action/user_list?all_fields=True&limit=1000`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${user.apikey}`,
                    },
                }
            );
            const users: CkanResponse<User[]> = await usersRes.json();
            if (!users.success && users.error) {
                if (users.error.message)
                    throw Error(replaceNames(users.error.message, true));
                throw Error(replaceNames(JSON.stringify(users.error), true));
            }

            return users.result.filter(
                (user) => user.name && !teamUsers.includes(user.name)
            );
        }),
    getCurrentMembers: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const user = ctx.session.user;
            const teamRes = await fetch(
                `${env.CKAN_URL}/api/action/organization_show?id=${input.id}&include_users=True`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${user.apikey}`,
                    },
                }
            );
            const team: CkanResponse<
                Organization & { groups: Organization[] }
            > = await teamRes.json();
            if (!team.success && team.error) {
                if (team.error.message)
                    throw Error(replaceNames(team.error.message, true));
                throw Error(replaceNames(JSON.stringify(team.error), true));
            }

            return team.result.users;
        }),
    list: publicProcedure.query(async ({ ctx, input }) => {
        const teamRes = await fetch(
            `${env.CKAN_URL}/api/action/organization_list?all_fields=True`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        const team: CkanResponse<Organization[]> = await teamRes.json();
        if (!team.success && team.error)
            throw Error(replaceNames(team.error.message));
        return {
            teams: team.result,
        };
    }),
    removeMember: protectedProcedure
        .input(z.object({ id: z.string(), username: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const user = ctx.session.user;
            const teamRes = await fetch(
                `${env.CKAN_URL}/api/action/member_delete`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${user.apikey}`,
                    },
                    body: JSON.stringify({
                        id: input.id,
                        object: input.username,
                        object_type: 'user',
                    }),
                }
            );
            const team: CkanResponse<
                Organization & { groups: Organization[] }
            > = await teamRes.json();
            if (!team.success && team.error) {
                if (team.error.message)
                    throw Error(replaceNames(team.error.message, true));
                throw Error(replaceNames(JSON.stringify(team.error), true));
            }
            return team.result;
        }),
});
