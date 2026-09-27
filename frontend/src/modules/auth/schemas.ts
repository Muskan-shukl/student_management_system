import { z } from 'zod'

// Shared field rules — mirror the backend so users see errors before a round trip.
export const NAME_PATTERN = /^\p{L}[\p{L}\s'.-]*$/u
// Exactly 10 digits, starting 6-9 (Indian mobile number), digits only.
export const PHONE_PATTERN = /^[6-9]\d{9}$/
export const PHONE_MAXLENGTH = 10
export const NAME_MAXLENGTH = 60

export const nameSchema = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(60, 'Name is too long')
  .regex(NAME_PATTERN, 'Only letters, spaces, apostrophes, hyphens and periods are allowed')
export const emailSchema = z.string().trim().min(1, 'Email is required').pipe(z.email('Enter a valid email address'))
export const passwordSchema = z
  .string()
  .min(8, 'At least 8 characters')
  .max(72, 'Password is too long')
  .regex(/[A-Z]/, 'Add an uppercase letter')
  .regex(/[a-z]/, 'Add a lowercase letter')
  .regex(/\d/, 'Add a number')
export const phoneSchema = z.union([
  z.literal(''),
  z
    .string()
    .trim()
    .regex(PHONE_PATTERN, 'Enter a valid 10-digit phone number'),
])

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})
export type LoginInput = z.infer<typeof loginSchema>

export const signupSchema = z
  .object({
    role: z.enum(['student', 'teacher']),
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password'),
    course: z.string().trim(),
    year: z.number().int().min(1).max(6),
    department: z.string().trim().max(80, 'Department is too long'),
  })
  .refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })
  .refine((d) => d.role !== 'student' || d.course.length >= 2, { message: 'Course is required', path: ['course'] })
export type SignupForm = z.infer<typeof signupSchema>

/** Shape sent to the API (confirmPassword stripped, role-specific fields only). */
export type SignupInput =
  | { role: 'student'; name: string; email: string; password: string; course: string; year: number }
  | { role: 'teacher'; name: string; email: string; password: string; department?: string }

export const toSignupInput = (form: SignupForm): SignupInput =>
  form.role === 'student'
    ? { role: 'student', name: form.name, email: form.email, password: form.password, course: form.course, year: form.year }
    : { role: 'teacher', name: form.name, email: form.email, password: form.password, department: form.department || undefined }

export const profileSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  department: z.string().trim().max(80, 'Department is too long'),
})
export type ProfileInput = z.infer<typeof profileSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })
  .refine((d) => d.currentPassword !== d.newPassword, { message: 'Choose a different password', path: ['newPassword'] })
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

export const forgotPasswordSchema = z.object({ email: emailSchema })
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

/** 0–4 strength score used by the password meter. */
export const passwordStrength = (value: string) => {
  let score = 0
  if (value.length >= 8) score++
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++
  if (/\d/.test(value)) score++
  if (/[^A-Za-z0-9]/.test(value) || value.length >= 12) score++
  return score
}
