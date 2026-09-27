import { z } from 'zod'
import { GENDERS, STUDENT_STATUSES } from '@/core/api/types'
import { emailSchema, NAME_PATTERN, nameSchema, passwordSchema, phoneSchema } from '@/modules/auth/schemas'

const optionalText = (max: number, label: string) => z.string().trim().max(max, `${label} is too long`)
const dateSchema = z.union([z.literal(''), z.string().refine((v) => new Date(v) <= new Date(), 'Date cannot be in the future')])
const genderSchema = z.union([z.literal(''), z.enum(GENDERS)])
const guardianNameSchema = z.union([
  z.literal(''),
  z.string().trim().min(2, 'Guardian name must be at least 2 characters').max(60, 'Guardian name is too long').regex(NAME_PATTERN, 'Only letters, spaces, apostrophes, hyphens and periods are allowed'),
])

const profileFields = {
  course: z.string().trim().min(2, 'Course is required').max(100, 'Course is too long'),
  year: z.number().int().min(1).max(6),
  gender: genderSchema,
  dateOfBirth: dateSchema,
  address: optionalText(255, 'Address'),
  guardianName: guardianNameSchema,
  guardianPhone: phoneSchema,
  assignedTeacher: z.string(),
}

export const createStudentSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
  ...profileFields,
})
export type CreateStudentForm = z.infer<typeof createStudentSchema>

export const editStudentSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  status: z.enum(STUDENT_STATUSES),
  ...profileFields,
})
export type EditStudentForm = z.infer<typeof editStudentSchema>

export const gradeSchema = z
  .object({
    subject: z.string().trim().min(1, 'Subject is required').max(60, 'Subject is too long'),
    score: z.number({ message: 'Enter a score' }).min(0, 'Cannot be negative'),
    maxScore: z.number({ message: 'Enter max' }).min(1, 'Must be at least 1'),
  })
  .refine((g) => g.score <= g.maxScore, { message: 'Score exceeds max', path: ['score'] })

export const academicSchema = z.object({
  grades: z.array(gradeSchema).max(30, 'Maximum 30 subjects'),
  remarks: z.string().trim().max(500, 'Remarks are too long'),
})
export type AcademicForm = z.infer<typeof academicSchema>

export const myProfileSchema = z.object({
  phone: phoneSchema,
  address: profileFields.address,
  dateOfBirth: dateSchema,
  gender: genderSchema,
  guardianName: profileFields.guardianName,
  guardianPhone: phoneSchema,
})
export type MyProfileForm = z.infer<typeof myProfileSchema>

/** Drop empty strings so the API only receives fields that were filled in. */
export const compact = <T extends Record<string, unknown>>(obj: T) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== '' && v !== undefined)) as Partial<T>
