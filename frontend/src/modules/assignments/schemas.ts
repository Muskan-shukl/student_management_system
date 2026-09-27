import { z } from 'zod'

export const assignmentSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120, 'Title is too long'),
  subject: z.string().trim().min(1, 'Subject is required').max(60, 'Subject is too long'),
  dueDate: z.string().min(1, 'Pick a due date'),
  course: z.string().trim().max(100),
  description: z.string().trim().max(2000, 'Description is too long'),
})
export type AssignmentForm = z.infer<typeof assignmentSchema>

export const submitSchema = z.object({ note: z.string().trim().max(500, 'Note is too long') })
