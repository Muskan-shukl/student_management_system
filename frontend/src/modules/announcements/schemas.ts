import { z } from 'zod'
import { AUDIENCES } from '@/core/api/types'

export const announcementSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120, 'Title is too long'),
  body: z.string().trim().min(3, 'Message must be at least 3 characters').max(2000, 'Message is too long'),
  audience: z.enum(AUDIENCES),
  course: z.string().trim().max(100),
  pinned: z.boolean(),
})
export type AnnouncementForm = z.infer<typeof announcementSchema>
