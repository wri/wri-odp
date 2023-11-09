import z from "zod";

export const DatasetSchema = z.object({
  title: z.string(),
  name: z.string(),
  source: z.string().optional().nullable(),
  language: z.string().optional().nullable(),
  team: z.string(),
  projects: z.string().optional().nullable(),
  applications: z.string().optional().nullable(),
  technicalNotes: z.string().url(),
  tags: z.array(z.string()),
  temporalCoverageStart: z.string().datetime().optional().nullable(),
  temporalCoverageEnd: z.string().datetime().optional().nullable(),
  updateFrequency: z.union(['monthly', 'quarterly', 'yearly', 'daily']).optional().nullable(),
  citation: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  longDescription: z.string().optional().nullable(),
  featured: z.boolean().optional().nullable(),
  featuredImage: z.string().url().optional().nullable(),
  customFields: z.array(z.object({
    name: z.string(),
    value: z.string(),
  }))
})

export type DatasetFormType = z.infer<typeof DatasetSchema>;
