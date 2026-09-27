import type { Role, StudentStatus, UserStatus } from '@/core/api/types'

export const ROLE_LABEL: Record<Role, string> = { admin: 'Administrator', teacher: 'Teacher', student: 'Student' }

export const ROLE_TONE: Record<Role, 'accent' | 'info' | 'primary'> = { admin: 'accent', teacher: 'info', student: 'primary' }

export const USER_STATUS_TONE: Record<UserStatus, 'success' | 'warning' | 'danger'> = {
  active: 'success',
  pending: 'warning',
  disabled: 'danger',
}

export const STUDENT_STATUS_TONE: Record<StudentStatus, 'success' | 'neutral' | 'info'> = {
  active: 'success',
  inactive: 'neutral',
  graduated: 'info',
}

export const YEAR_OPTIONS = [1, 2, 3, 4, 5, 6].map((y) => ({ value: y, label: `Year ${y}` }))

export const DEMO_ACCOUNTS: { role: Role; email: string; password: string }[] = [
  { role: 'admin', email: 'aditirao@gmail.com', password: 'Admin@123' },
  { role: 'teacher', email: 'karanmalhotra@gmail.com', password: 'Teacher@123' },
  { role: 'student', email: 'nehasharma@gmail.com', password: 'Student@123' },
]
