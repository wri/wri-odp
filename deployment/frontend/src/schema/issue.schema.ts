import z from 'zod'

export const CommentSchema = z.object({
  issue_number: z.number(),
  dataset_id: z.string(),
  comment: z.string(),
  status: z.string().optional()
})

export type CommentIssueType = z.infer<typeof CommentSchema>;