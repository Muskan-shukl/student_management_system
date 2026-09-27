import { http } from '@/core/api/http'
import type { Announcement, Grade, Student, TimetableSlot, User } from '@/core/api/types'

export interface AdminDashboard {
  role: 'admin'
  users: { total: number; admins: number; teachers: number; students: number; pendingTeachers: number }
  students: { total: number; active: number; unassigned: number; byCourse: { course: string; count: number }[] }
  pendingTeachers: User[]
  recentStudents: Student[]
  announcements: Announcement[]
  attendanceTrend: { date: string; total: number; percent: number }[]
  today: { students: number; marked: number; present: number; late: number; absent: number; unassigned: number }
  teachers: { _id: string; name: string; department?: string; students: number; avgAttendance: number | null; markedToday: boolean }[]
  assignments: number
}

export interface TeacherDashboard {
  role: 'teacher'
  assigned: number
  averageAttendance: number | null
  averageScore: number | null
  ungraded: number
  lowAttendance: Student[]
  recentStudents: Student[]
  todayClasses: TimetableSlot[]
  announcements: Announcement[]
  submissionsToCheck: number
  attendanceMarkedToday: boolean
}

export interface StudentDashboard {
  role: 'student'
  profile: Student | null
  averageScore: number | null
  attendancePercent: number | null
  gradedSubjects: number
  bestSubject: Grade | null
  todayClasses: TimetableSlot[]
  announcements: Announcement[]
  pendingAssignments: { _id: string; title: string; subject: string; dueDate: string; overdue: boolean }[]
  pendingCount: number
}

export type DashboardData = AdminDashboard | TeacherDashboard | StudentDashboard

export const dashboardApi = {
  get: () => http.get<DashboardData>('/dashboard'),
}
