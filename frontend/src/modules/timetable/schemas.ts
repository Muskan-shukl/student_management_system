import { z } from 'zod'
import { DAYS } from '@/core/api/types'

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Pick a time')

export const slotSchema = z
  .object({
    course: z.string().trim().min(2, 'Course is required').max(100),
    year: z.number().int().min(1).max(6),
    day: z.enum(DAYS),
    startTime: time,
    endTime: time,
    subject: z.string().trim().min(1, 'Subject is required').max(60),
    room: z.string().trim().max(40),
    teacher: z.string(),
  })
  .refine((s) => s.endTime > s.startTime, { message: 'End time must be after start time', path: ['endTime'] })
export type SlotForm = z.infer<typeof slotSchema>
