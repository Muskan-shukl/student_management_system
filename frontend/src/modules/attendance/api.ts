import { http } from '@/core/api/http'
import type { AttendanceHistory, AttendanceOverview, AttendanceSheet, AttendanceStatus } from '@/core/api/types'

export const attendanceApi = {
  sheet: (date: string) => http.get<AttendanceSheet>('/attendance/sheet', { query: { date } }),
  mark: (date: string, entries: { student: string; status: AttendanceStatus }[]) => http.post<AttendanceSheet>('/attendance/mark', { date, entries }),
  me: (month?: string) => http.get<AttendanceHistory>('/attendance/me', { query: { month } }),
  overview: (date?: string) => http.get<AttendanceOverview>('/attendance/overview', { query: { date } }),
  student: (id: string, month?: string) => http.get<AttendanceHistory>(`/attendance/student/${id}`, { query: { month } }),
}
