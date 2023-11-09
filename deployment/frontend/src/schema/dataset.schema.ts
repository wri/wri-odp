import z from "zod";

export const DatasetSchema = z.object({
  title: z.string(),
  name: z.string(),
  citation: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  longDescription: z.string().optional().nullable(),
})

export type DatasetFormType = z.infer<typeof DatasetSchema>;
