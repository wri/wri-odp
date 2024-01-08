import z from 'zod'

export const CommentSchema = z.object({
  issue_number: z.number(),
  dataset_id: z.string(),
  comment: z.string(),
  status: z.string().optional(),
  creator_id: z.string().nullable(),
  owner_org: z.string().nullable(),
  issuetitle: z.string()
})

export const IssueSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().min(1, { message: 'description is required' }),
  dataset_id: z.string(),
  creator_id: z.string().nullable(),
  owner_org: z.string().nullable()
})

export type CommentIssueType = z.infer<typeof CommentSchema>;
export type IssueSchemaType = z.infer<typeof IssueSchema>;