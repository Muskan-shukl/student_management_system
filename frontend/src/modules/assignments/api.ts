import { http } from '@/core/api/http'
import type { MyAssignmentStatus, StudentAssignment, SubmissionStatus, TeacherAssignment } from '@/core/api/types'

export const assignmentsApi = {
  listForStudent: (status?: MyAssignmentStatus | '') => http.get<StudentAssignment[]>('/assignments', { query: { status: status || undefined, limit: 50 } }),
  listForTeacher: (page = 1) => http.get<TeacherAssignment[]>('/assignments', { query: { page, limit: 10 } }),
  get: (id: string) => http.get<TeacherAssignment>(`/assignments/${id}`),
  create: (payload: Record<string, unknown>) => http.post<TeacherAssignment>('/assignments', payload),
  update: (id: string, payload: Record<string, unknown>) => http.patch<TeacherAssignment>(`/assignments/${id}`, payload),
  remove: (id: string) => http.delete<null>(`/assignments/${id}`),
  submit: (id: string, note: string) => http.post<StudentAssignment>(`/assignments/${id}/submit`, { note }),
  review: (id: string, studentId: string, status: SubmissionStatus) => http.patch<TeacherAssignment>(`/assignments/${id}/submissions/${studentId}`, { status }),
}
