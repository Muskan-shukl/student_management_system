import { download, http } from '@/core/api/http'
import type { Student, StudentStatus } from '@/core/api/types'

export type StudentListQuery = {
  page?: number
  limit?: number
  search?: string
  course?: string
  status?: StudentStatus | ''
  year?: number | ''
  teacher?: string
  unassigned?: boolean
}

export type StudentPayload = Record<string, unknown>

export const studentsApi = {
  list: (query: StudentListQuery) => http.get<Student[]>('/students', { query }),
  courses: () => http.get<string[]>('/students/courses'),
  get: (id: string) => http.get<Student>(`/students/${id}`),
  create: (payload: StudentPayload) => http.post<Student>('/students', payload),
  update: (id: string, payload: StudentPayload) => http.patch<Student>(`/students/${id}`, payload),
  updateAcademic: (id: string, payload: StudentPayload) => http.patch<Student>(`/students/${id}/academic`, payload),
  remove: (id: string) => http.delete<null>(`/students/${id}`),
  bulkAssign: (ids: string[], assignedTeacher: string | null) => http.patch<{ matched: number; modified: number }>('/students/bulk-assign', { ids, assignedTeacher }),
  exportCsv: (query: Omit<StudentListQuery, 'page' | 'limit'>) => download('/students/export', query, 'students.csv'),
  me: () => http.get<Student>('/students/me'),
  updateMe: (payload: StudentPayload) => http.patch<Student>('/students/me', payload),
}
