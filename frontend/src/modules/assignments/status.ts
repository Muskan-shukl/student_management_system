import type { MyAssignmentStatus } from '@/core/api/types'

export const STATUS_TONE: Record<MyAssignmentStatus, 'neutral' | 'danger' | 'info' | 'success'> = {
  pending: 'neutral',
  overdue: 'danger',
  submitted: 'info',
  checked: 'success',
}
