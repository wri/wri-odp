import z from 'zod'

export const CommentSchema = z.object({
  issue_number: z.number(),
  dataset_id: z.string(),
  comment: z.string(),
  status: z.string().optional()
})

export const IssueSchema = z.object({
  title: z.string(),
  description: z.string(),
  dataset_id: z.string()
})

export type CommentIssueType = z.infer<typeof CommentSchema>;
export type IssueSchemaType = z.infer<typeof IssueSchema>;