import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure
} from "@/server/api/trpc";
import { env } from "@/env.mjs";
import { getUser, getUserOrganizations, getUserDataset, getOrgDetails, getAllOrganizations, getAllUsers } from "@/utils/apiUtils";
import { searchArrayForKeyword } from "@/utils/general";
import { searchSchema } from "@/schema/search.schema";
import type { CkanResponse } from "@/schema/ckan.schema";

export const UserRouter = createTRPCRouter({
  getDashboardUser: protectedProcedure.query(async ({ ctx }) => {

    const userdetails = await getUser({ userId: ctx.session.user.id, apiKey: ctx.session.user.apikey });
    const organizations = await getUserOrganizations({ userId: ctx.session.user.id, apiKey: ctx.session.user.apikey });
    const TeamCount = organizations?.length;
    const dataset = await getUserDataset({ userId: ctx.session.user.id, apiKey: ctx.session.user.apikey });
    const DatasetCount = dataset?.count;
    const dashboardUser = {
      imageUrl: userdetails?.image_display_url,
      name: userdetails?.name,
      email: userdetails?.email,
      teamCount: TeamCount,
      datasetCount: DatasetCount,
      isSysAdmin: userdetails?.sysadmin
    }
    return {
      userdetails: dashboardUser
    }
  }),
  getAllUsers: protectedProcedure
    .input(searchSchema)
    .query(async ({ input, ctx }) => {

      type IUser = {
        title?: string;
        id: string;
        description?: string;
        capacity?: string;
        image_display_url?: string;
        org?: string;
        orgId?: string;
        orgimage?: string;
        orgtitle?: string;
        userCapacity?: string;
      };

      let getAllUsersOrgFlat: IUser[] = [];
      if (ctx.session.user.sysadmin) {

        const orgs = (await getAllOrganizations({ apiKey: ctx.session.user.apikey }))!;
        const orgDetails = await Promise.all(orgs.map(async (org) => {
          const orgDetails = (await getOrgDetails({ orgId: org.id, apiKey: ctx.session.user.apikey }))!;
          const users = orgDetails.users?.map((user) => {
            return {
              title: user.name,
              id: user.id,
              description: user.email,
              capacity: user.capacity,
              image_display_url: user.image_url,
              org: orgDetails.name,
              orgId: orgDetails.id,
              orgimage: orgDetails.image_display_url,
              orgtitle: orgDetails.title,
              userCapacity: org.capacity
            }

          });

          return users;
        }));
        getAllUsersOrgFlat = orgDetails.flat() as IUser[];
      }
      else {
        const userOrg = (await getUserOrganizations({ userId: ctx.session.user.id, apiKey: ctx.session.user.apikey }))!;
        const getAllUsersOrg = await Promise.all(userOrg.map(async (org) => {
          const orgDetails = (await getOrgDetails({ orgId: org.id, apiKey: ctx.session.user.apikey }))!;
          const users = orgDetails.users?.map((user) => {
            return {
              title: user.name,
              id: user.id,
              description: user.email,
              capacity: user.capacity,
              image_display_url: user.image_url,
              org: orgDetails.name,
              orgId: orgDetails.id,
              orgimage: orgDetails.image_display_url,
              orgtitle: orgDetails.title,
              userCapacity: org.capacity
            }

          });

          return users;
        }));

        getAllUsersOrgFlat = getAllUsersOrg.flat() as IUser[];
      }

      type IUsers = {
        title?: string;
        id: string;
        description?: string;
        orgnumber?: number;
        image_display_url?: string;
        orgs?:
        {
          title?: string;
          capacity?: string;
          image_display_url?: string;
          name?: string;
          userCapacity?: string;
        }[]

      }
      const userMap = new Map<string, IUsers>();
      getAllUsersOrgFlat.forEach((user) => {
        const {
          title,
          id,
          description,
          capacity,
          image_display_url,
          org,
          orgId,
          orgimage,
          orgtitle,
          userCapacity } = user;
        const key = title ?? id;

        if (userMap.has(key)) {
          const existingUser = userMap.get(key)!;
          existingUser.orgnumber = (existingUser.orgnumber ?? 1) + 1;

          if (org && orgId) {
            existingUser.orgs = [
              ...(existingUser.orgs ?? []),
              {
                title: orgtitle ?? '',
                capacity: capacity ?? '',
                image_display_url: orgimage ?? '',
                name: org || '',
                userCapacity: userCapacity ?? ''
              },
            ];
          }

          userMap.set(key, existingUser);
        } else {
          const newUser: IUsers = {
            title,
            id,
            description,
            image_display_url,
            orgnumber: 1,
            orgs: org
              ? [
                {
                  title: orgtitle ?? '',
                  capacity: capacity ?? '',
                  image_display_url: orgimage ?? '',
                  name: org || '',
                  userCapacity: userCapacity ?? ''
                },
              ]
              : [],
          };

          userMap.set(key, newUser);
        }
      });

      const allUsers = Array.from(userMap.values());
      let result = allUsers;
      if (input.search) {
        result = searchArrayForKeyword<IUsers>(allUsers, input.search);
      }

      return {
        users: result.slice(input.page.start, input.page.start + input.page.rows),
        count: result.length,
      }
    }),
  deleteUser: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const response = await fetch(`${env.CKAN_URL}/api/3/action/user_delete`, {
        method: "POST",
        body: JSON.stringify({ id: input }),
        headers: {
          "Authorization": ctx.session.user.apikey,
          "Content-Type": "application/json"
        }
      });
      const data = (await response.json()) as CkanResponse<null>;
      if (!data.success && data.error) throw Error(data.error.message)
      return data
    }),

  deleteMember: protectedProcedure
    .input(z.object({
      orgId: z.string(),
      username: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      const response = await fetch(`${env.CKAN_URL}/api/3/action/organization_member_delete`, {
        method: "POST",
        body: JSON.stringify({ id: input.orgId, username: input.username }),
        headers: {
          "Authorization": ctx.session.user.apikey,
          "Content-Type": "application/json"
        }
      });
      const data = (await response.json()) as CkanResponse<null>;
      if (!data.success && data.error) throw Error(data.error.message)
      return data
    })

});