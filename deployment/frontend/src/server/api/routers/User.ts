import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure
} from "@/server/api/trpc";
import { env } from "@/env.mjs";
import { getUser, getUserOrganizations, getUserDataset, getOrgDetails, getAllOrganizations, getAllUsers } from "@/utils/apiUtils";

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
  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    const orgs = (await getAllOrganizations({ apiKey: ctx.session.user.apikey }))!;
    const orgDetails = await Promise.all(orgs.map(async (org) => {
      const orgDetails = (await getOrgDetails({ orgId: org.id, apiKey: ctx.session.user.apikey }))!;
      return orgDetails;
    }));
    const users = await getAllUsers({ apiKey: ctx.session.user.apikey });

    type IUsers = {
      title?: string;
      description?: string;
      orgnumber?: number;
      image_display_url?: string;
      orgs?:
      {
        title?: string;
        capacity?: string;
        image_display_url?: string;
        name?: string;
      }[]

    }
    const allUsers: IUsers[] = [];
    for (const user of users) {
      const userTemp = []
      const userOrgDetails = []
      for (const org of orgDetails) {
        const userOrg = org.users?.find((userorg) => userorg.id === user.id);
        if (user?.name && userOrg) {
          const userDetails = {
            title: user?.name,
            description: user?.email,
            capacity: userOrg?.capacity ? userOrg?.capacity : "member",
            image_display_url: user?.image_url,
            org: org.name,
            orgId: org.id
          }
          userOrgDetails.push({
            title: org.title,
            capacity: userOrg?.capacity ? userOrg?.capacity : "member",
            image_display_url: org.image_display_url,
            name: org.name

          })
          userTemp.push(userDetails);
        }
      }
      if (user?.name) {
        if (userTemp.length > 0) {
          allUsers.push({
            title: user?.name,
            description: user?.email,
            orgnumber: userTemp?.length,
            image_display_url: user?.image_url,
            orgs: userOrgDetails
          })
        }
        else {
          allUsers.push({
            title: user?.name,
            description: user?.email,
            orgnumber: 0,
            image_display_url: user?.image_url,
            orgs: []
          })
        }
      }
    }

    return {
      users: allUsers
    }
  }),

});