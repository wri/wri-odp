import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure
} from "@/server/api/trpc";
import { env } from "@/env.mjs";
import {
  getUser,
  getUserOrganizations,
  getUserDataset,
  getOrgDetails,
  getAllOrganizations,
  getAllUsers,
  getRandomUsernameFromEmail,
  generateRandomPassword,
  sendEmail,
  generateEmail,
  generateInviteEmail

} from "@/utils/apiUtils";
import { searchArrayForKeyword } from "@/utils/general";
import { searchSchema } from "@/schema/search.schema";
import type { CkanResponse, WriOrganization } from "@/schema/ckan.schema";
import { UserFormInviteSchema, UserFormSchema } from '@/schema/user.schema';
import { User } from "@portaljs/ckan";
import { send } from "xstate";

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
      isSysAdmin: userdetails?.sysadmin,
      email_hash: userdetails?.email_hash
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
        email_hash?: string;
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
              email_hash: user.email_hash,
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
              email_hash: user.email_hash,
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
        email_hash?: string;
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
          userCapacity,
          email_hash } = user;
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
                userCapacity: userCapacity ?? '',
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
            email_hash,
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
      let result = allUsers
      // non-organization users
      if (ctx.session.user.sysadmin) {
        const nonOrgUsers = (await getAllUsers({ apiKey: ctx.session.user.apikey }))!;
        const orgUsers = Array.from(userMap.keys());
        const nonOrgUsersFiltered = nonOrgUsers.filter((user) => !orgUsers.includes(user.name!));
        const nonOrgUsersFormatted = nonOrgUsersFiltered.map((user) => {
          return {
            title: user.name,
            id: user.id,
            email_hash: user.email_hash,
            description: user.email,
            image_display_url: user.image_url,
            orgnumber: 0,
            orgs: []
          }
        });
        result = [...allUsers, ...nonOrgUsersFormatted] as IUsers[];
      }
      if (input.search) {
        result = searchArrayForKeyword<IUsers>(result, input.search);
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
    }),
  
  getUser: protectedProcedure
    .input(z.string())
    .query(async ({input,  ctx }) => {
      const userdetails = (await getUser({ userId: input, apiKey: ctx.session.user.apikey }))!;
      return {
        userdetails: userdetails
      }
    }),
  updateUser: protectedProcedure
    .input(UserFormSchema)
    .mutation(async ({ input, ctx }) => {
      const image_url = input.image_url;
      if (image_url?.includes("ckanuploadimage:")) {
        input.image_url = image_url.replace("ckanuploadimage:", `${env.CKAN_URL}/uploads/group/`);
      }
      const response = await fetch(`${env.CKAN_URL}/api/3/action/user_update`, {
        method: "POST",
        body: JSON.stringify({ ...input}),
        headers: {
          "Authorization": ctx.session.user.apikey,
          "Content-Type": "application/json"
        }
      });
      const data = (await response.json()) as CkanResponse<User>;
      if (!data.success && data.error) throw Error(data.error.message)
      return data.result
    }),
  getUserCapacity: protectedProcedure
    .query(async ({ ctx }) => {
      let isOrgAdmin = false;
      let adminOrg: WriOrganization[] = []
      if (ctx.session.user.sysadmin) {
        isOrgAdmin = true;
        adminOrg = (await getAllOrganizations({ apiKey: ctx.session.user.apikey }))!;
      }
      else {
        const orgdetails = await getUserOrganizations({ userId: ctx.session.user.id, apiKey: ctx.session.user.apikey });
        isOrgAdmin = orgdetails?.some((org) => org.capacity === "admin");
        adminOrg = orgdetails?.filter((org) => org.capacity === "admin");
      }

      return {
        isOrgAdmin: isOrgAdmin,
        adminOrg: adminOrg
      }
    }),
  
  createOtherUser: protectedProcedure
    .input(UserFormInviteSchema)
    .mutation(async ({ input, ctx }) => {

      const name = await getRandomUsernameFromEmail(input.email);
      const password = generateRandomPassword(12);
      
      const response = await fetch(`${env.CKAN_URL}/api/3/action/user_create`, {
        method: "POST",
        body: JSON.stringify({ email: input.email, name, password }),
        headers: {
          "Authorization": ctx.session.user.apikey,
          "Content-Type": "application/json"
        }
      });

      const data = (await response.json()) as CkanResponse<User>;
      if (!data.success && data.error) throw Error(data.error.message)

      
      if (input.team?.value) {
        // add user to organization
        const response = await fetch(`${env.CKAN_URL}/api/3/action/organization_member_create`, {
          method: "POST",
          body: JSON.stringify({ id: input.team?.value, username: name, role: input.role?.value }),
          headers: {
            "Authorization": ctx.session.user.apikey,
            "Content-Type": "application/json"
          }
        });
        const data = (await response.json()) as CkanResponse<null>;
        if (!data.success && data.error) throw Error(data.error.message)

        try {
          const role = input.role?.value as string;
          const email = generateInviteEmail(input.email, password,  name, input.team.label, role);
          await sendEmail(input.email, "Invite for WRI OpenData Platform", email);
        }
        catch (error) {
          throw Error(error as string)
        }

      }
      else {
        try {
          const email = generateEmail(input.email, password, name);
          await sendEmail(input.email, "Welcome to WRI OpenData Platform", email);
        }
        catch (error) {
          throw Error(error as string)
        }
      }

      return data.result
     
    })
  
});