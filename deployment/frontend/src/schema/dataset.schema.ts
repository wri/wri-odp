import z from "zod";

export const DatasetSchema = z.object({
  title: z.string(),
  name: z.string(),
  source: z.string().url().optional().nullable(),
  language: z.string().optional().nullable(),
  team: z.string(),
  projects: z.string().optional().nullable(),
  applications: z.string().optional().nullable(),
  technicalNotes: z.string().url(),
  tags: z.array(z.string()),
  temporalCoverageStart: z.date().optional().nullable(),
  temporalCoverageEnd: z.date().optional().nullable(),
  updateFrequency: z.enum(['monthly', 'quarterly', 'yearly', 'daily']).optional().nullable(),
  citation: z.string().optional().nullable(),
  visibility: z.string().default("private"),
  license: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  longDescription: z.string().optional().nullable(),
  featured: z.boolean().optional().nullable(),
  featuredImage: z.string().url().optional().nullable(),
  authorName: z.string(),
  authorEmail: z.string().email(),
  maintainerName: z.string(),
  maintainerEmail: z.string().email(),
  function: z.string().optional().nullable(),
  restrictions: z.string().optional().nullable(),
  reasonsForAdding: z.string().optional().nullable(),
  learnMore: z.string().optional().nullable(),
  cautions: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  customFields: z.array(z.object({
    name: z.string(),
    value: z.string(),
  }))
})

export type DatasetFormType = z.infer<typeof DatasetSchema>;
