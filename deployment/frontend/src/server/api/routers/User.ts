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
import type { CkanResponse, WriOrganization, WriUser } from "@/schema/ckan.schema";
import { UserFormInviteSchema, UserFormSchema } from '@/schema/user.schema';
import { User } from "@portaljs/ckan";

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


      const response = await fetch(`${env.CKAN_URL}/api/3/action/user_list_wri`, {
        headers: {
          "Authorization": ctx.session.user.apikey,
          "Content-Type": "application/json"
        }
      });
      const data = (await response.json()) as CkanResponse<WriUser[]>;
      if (!data.success && data.error) throw Error(data.error.message)

      let users = data.result
      if (!ctx.session.user.sysadmin) {
        let user = users.find((user) => user.id === ctx.session.user.id);
        if (user) {
          let o_users = [user];
          let user_org = user.organizations;
          if (user_org) {
            o_users = []
            for (const org of user_org) {
              for (const user of org.users!) {
                o_users.push(users.find((u) => u.id === user.id)!);
              }
            }
          }
          users = o_users;
        }
      }
      console.log("USERSS: ", users)

      let result: IUsers[] = users.map((user) => {
        let rslt = {
          title: user.name!,
          id: user.id!,
          email_hash: user.email_hash!,
          description: user.email!,
          image_display_url: user.image_url!,
          orgnumber: user.organizations?.length ?? 0,
          orgs: [] as IUsers["orgs"]
        }

        if (user.organizations) {
          rslt.orgs =  user.organizations.map((org) => {
            return {
              title: org.title,
              capacity: org.capacity,
              image_display_url: org.image_display_url,
              name: org.name
            }
          })
        }
        return rslt;
      })


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
  getPossibleMembers: protectedProcedure
    .input(z.string())
    .query(async ({input,  ctx }) => {
      const orgMembers = (await getOrgDetails({ orgId: input, apiKey: ctx.session.user.apikey }))!;
      const allUsers = (await getAllUsers({ apiKey: ctx.session.user.apikey }))!;
      const orgUsers = orgMembers.users?.map((user) => user.name);
      const nonOrgUsers = allUsers.filter((user) => !orgUsers?.includes(user.name!));
      return {
        users: nonOrgUsers
      }
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
      if (!data.success && data.error) {
         const errors = Object.keys(data.error).map((key) => {
            const error = data.error as Record<string, string | string[]>;
            const value = error[key];
            if (Array.isArray(value)) {
              return `${key}: ${value.join(", ")}`;
            }
          })
        throw Error(errors.join(",\n"))
      }

      
      if (input.team?.value) {
        const response = await fetch(`${env.CKAN_URL}/api/3/action/organization_member_create`, {
          method: "POST",
          body: JSON.stringify({ id: input.team?.id, username: name, role: input.role?.id }),
          headers: {
            "Authorization": ctx.session.user.apikey,
            "Content-Type": "application/json"
          }
        });
        const data = (await response.json()) as CkanResponse<null>;
        if (!data.success && data.error) throw Error(data.error.message)


        try {
          const role = input.role?.value as string;
          const email = generateInviteEmail(input.email, password, name, input.team.label, role);
          await sendEmail(input.email, "Invite for WRI OpenData Platform", email);
        }
        catch (error) {
          throw Error(error as string)
        }

      }
      else {
        try {
          const email = generateEmail(input.email, password, name);
          await sendEmail(input.email, "Invite for WRI OpenData Platform", email);
        }
        catch (error) {
          throw Error(error as string)
        }
      }

      return data.result
     
    })
  
});
