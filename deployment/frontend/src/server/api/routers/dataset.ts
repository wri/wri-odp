import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure
} from "@/server/api/trpc";
import { env } from "@/env.mjs";
import { getUserOrganizations, getAllDatasetFq, getUserGroups } from "@/utils/apiUtils";
import { searchSchema } from "@/schema/search.schema";
import type { CkanResponse } from "@/schema/ckan.schema";

export const DatasetRouter = createTRPCRouter({
  getAllDataset: protectedProcedure
    .input(searchSchema)
    .query(async ({ input, ctx }) => {
      // const organizations = await getUserOrganizations({ userId: ctx.session.user.id, apiKey: ctx.session.user.apikey });
      // const groups = await getUserGroups({ userId: ctx.session.user.id, apiKey: ctx.session.user.apikey });
      // let orgsFq = `organization:(${organizations?.map(org => org.name).join(" OR ")})`;
      // if (groups) {
      //   orgsFq = `${orgsFq} +groups:(${groups.map(group => group.name).join(" OR ")})`
      // }
      let orgsFq = `" "`;
      const fq = []
      if (input.fq) {
        orgsFq = "";
        for (const key of Object.keys(input.fq)) {
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
  deleteDataset: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const response = await fetch(`${env.CKAN_URL}/api/3/action/package_delete`, {
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
    })
});