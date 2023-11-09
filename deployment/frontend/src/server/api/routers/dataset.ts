import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure
} from "@/server/api/trpc";
import { env } from "@/env.mjs";
import { getUserOrganizations, getAllDatasetFq } from "@/utils/apiUtils";
import { searchSchema } from "@/schema/search.schema";

export const DatasetRouter = createTRPCRouter({
  getAllDataset: protectedProcedure
    .input(searchSchema)
    .query(async ({ input, ctx }) => {
      const organizations = await getUserOrganizations({ userId: ctx.session.user.id, apiKey: ctx.session.user.apikey });
      let orgsFq = `organization:(${organizations?.map(org => org.name).join(" OR ")})`;
      const fq = []
      if (input.fq) {
        for (const key of Object.keys(input.fq)) {
          if (key === "organization") {
            orgsFq = `organization:(${input.fq[key]})`;
            continue;
          }
          fq.push(`${key}:(${input.fq[key]})`)
        }
        const filter = fq.join("+");
        if (filter) orgsFq = `${orgsFq}+${filter}`;

      }
      const dataset = (await getAllDatasetFq({ apiKey: ctx.session.user.apikey, fq: orgsFq, query: input }))!;
      return {
        datasets: dataset.datasets,
        count: dataset.count
      }
    }),
  getMyDataset: protectedProcedure
    .input(searchSchema)
    .query(async ({ input, ctx }) => {
      const dataset = (await getAllDatasetFq({ apiKey: ctx.session.user.apikey, fq: `creator_user_id:${ctx.session.user.id}`, query: input }))!;
      return {
        datasets: dataset.datasets,
        count: dataset.count
      }
    }),
  getFavoriteDataset: protectedProcedure
    .input(searchSchema)
    .query(async ({ input, ctx }) => {
      const dataset = (await getAllDatasetFq({ apiKey: ctx.session.user.apikey, fq: `featured_dataset:true`, query: input }))!;
      return {
        datasets: dataset.datasets,
        count: dataset.count
      }
    }),
  getDraftDataset: protectedProcedure
    .input(searchSchema)
    .query(async ({ input, ctx }) => {
      const dataset = (await getAllDatasetFq({ apiKey: ctx.session.user.apikey, fq: `state:draft`, query: input }))!;
      return {
        datasets: dataset.datasets,
        count: dataset.count
      }
    }),

});