import { http } from '@/core/api/http'
import type { Role, User, UserStatus, UserSummary } from '@/core/api/types'

export type UserListQuery = {
  page?: number
  limit?: number
  search?: string
  role?: Role | ''
  status?: UserStatus | ''
}

export const usersApi = {
  list: (query: UserListQuery) => http.get<User[]>('/users', { query }),
  teachers: () => http.get<UserSummary[]>('/users/teachers'),
  get: (id: string) => http.get<User>(`/users/${id}`),
  create: (payload: Record<string, unknown>) => http.post<User>('/users', payload),
  update: (id: string, payload: Record<string, unknown>) => http.patch<User>(`/users/${id}`, payload),
  remove: (id: string) => http.delete<null>(`/users/${id}`),
  resetPassword: (id: string, password: string) => http.post<User>(`/users/${id}/password`, { password }),
}
