import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure
} from "@/server/api/trpc";
import { env } from "@/env.mjs";
import { getUserOrganizations, getAllDatasetFq } from "@/utils/apiUtils";

export const DatasetRouter = createTRPCRouter({
  getAllDataset: protectedProcedure.query(async ({ ctx }) => {
    const organizations = await getUserOrganizations({ userId: ctx.session.user.id, apiKey: ctx.session.user.apikey });
    const orgsFq = `organization:(${organizations?.map(org => org.name).join(" OR ")})`;
    const dataset = (await getAllDatasetFq({ apiKey: ctx.session.user.apikey, fq: orgsFq }))!;

    return {
      datasets: dataset,
    }
  }),
  getMyDataset: protectedProcedure.query(async ({ ctx }) => {
    const dataset = (await getAllDatasetFq({ apiKey: ctx.session.user.apikey, fq: `creator_user_id:${ctx.session.user.id}` }))!;
    return {
      datasets: dataset,
    }
  }),
  getFavoriteDataset: protectedProcedure.query(async ({ ctx }) => {
    const dataset = (await getAllDatasetFq({ apiKey: ctx.session.user.apikey, fq: `featured_dataset:true` }))!;
    return {
      datasets: dataset,
    }
  }),
  getDraftDataset: protectedProcedure.query(async ({ ctx }) => {
    const dataset = (await getAllDatasetFq({ apiKey: ctx.session.user.apikey, fq: `state:draft` }))!;
    return {
      datasets: dataset,
    }
  }),

});