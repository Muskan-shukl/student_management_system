import { z } from 'zod'
import { USER_STATUSES } from '@/core/api/types'
import { emailSchema, nameSchema, passwordSchema, phoneSchema } from '@/modules/auth/schemas'

const staffRole = z.enum(['admin', 'teacher'])
const department = z.string().trim().max(80, 'Department is too long')

export const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: staffRole,
  phone: phoneSchema,
  department,
})
export type CreateUserForm = z.infer<typeof createUserSchema>

export const editUserSchema = z.object({
  name: nameSchema,
  role: staffRole,
  status: z.enum(USER_STATUSES),
  phone: phoneSchema,
  department,
})
export type EditUserForm = z.infer<typeof editUserSchema>
