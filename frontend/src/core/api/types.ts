export const ROLES = { ADMIN: 'admin', TEACHER: 'teacher', STUDENT: 'student' } as const
export type Role = (typeof ROLES)[keyof typeof ROLES]

export const USER_STATUSES = ['active', 'pending', 'disabled'] as const
export type UserStatus = (typeof USER_STATUSES)[number]

export const STUDENT_STATUSES = ['active', 'inactive', 'graduated'] as const
export type StudentStatus = (typeof STUDENT_STATUSES)[number]

export const GENDERS = ['male', 'female', 'other'] as const
export type Gender = (typeof GENDERS)[number]

export interface FieldError {
  field: string
  message: string
}

export interface Meta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  meta?: Meta
}

export interface User {
  _id: string
  name: string
  email: string
  role: Role
  status: UserStatus
  phone?: string
  department?: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export type UserSummary = Pick<User, '_id' | 'name' | 'email'> & Partial<Pick<User, 'phone' | 'status' | 'department' | 'lastLoginAt'>>

export interface Grade {
  subject: string
  score: number
  maxScore: number
}

export interface Student {
  _id: string
  user: UserSummary
  rollNumber: string
  course: string
  year: number
  gender?: Gender
  dateOfBirth?: string
  address?: string
  guardianName?: string
  guardianPhone?: string
  status: StudentStatus
  assignedTeacher?: UserSummary | null
  grades: Grade[]
  attendance: { present: number; total: number }
  remarks?: string
  attendancePercent: number | null
  averageScore: number | null
  createdAt: string
  updatedAt: string
}

export interface AuthSession {
  user: User
  token: string | null
  pending?: boolean
}

export const AUDIENCES = ['all', 'students', 'teachers'] as const
export type Audience = (typeof AUDIENCES)[number]

export interface Announcement {
  _id: string
  title: string
  body: string
  audience: Audience
  course?: string
  pinned: boolean
  author: { _id: string; name: string; role: Role }
  createdAt: string
  updatedAt: string
}

export const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
export type Day = (typeof DAYS)[number]

export interface TimetableSlot {
  _id: string
  course: string
  year: number
  day: Day
  startTime: string
  endTime: string
  subject: string
  room?: string
  teacher?: { _id: string; name: string } | null
}

export const ATTENDANCE_STATUSES = ['present', 'absent', 'late'] as const
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number]

export interface AttendanceSheet {
  date: string
  marked: boolean
  students: { _id: string; name: string; rollNumber: string; course: string; status: AttendanceStatus | null }[]
}

export interface AttendanceHistory {
  month: string
  records: { date: string; status: AttendanceStatus }[]
  summary: { present: number; late: number; absent: number; total: number; percent: number | null }
}

export interface AttendanceOverview {
  date: string
  totals: { students: number; marked: number; present: number; late: number; absent: number; unassigned: number; evaluated: number }
  teachers: {
    teacher: { _id: string; name: string }
    students: number
    marked: number
    present: number
    late: number
    absent: number
    roster: { _id: string; name: string; rollNumber: string; status: AttendanceStatus | null }[]
  }[]
  lowAttendance: { _id: string; name: string; rollNumber: string; course: string; teacher: string | null; percent: number; attendance: { present: number; total: number } }[]
}

export type SubmissionStatus = 'submitted' | 'checked'
export type MyAssignmentStatus = 'pending' | 'overdue' | SubmissionStatus

interface AssignmentBase {
  _id: string
  title: string
  description?: string
  subject: string
  dueDate: string
  course?: string
  teacher: { _id: string; name: string }
  createdAt: string
}

export interface StudentAssignment extends AssignmentBase {
  myStatus: MyAssignmentStatus
  mySubmission: { status: SubmissionStatus; note?: string; submittedAt: string; checkedAt?: string } | null
}

export interface TeacherAssignment extends AssignmentBase {
  stats: { total: number; submitted: number; checked: number; pending: number }
  roster?: { student: { _id: string; rollNumber: string; name: string }; status: MyAssignmentStatus; note?: string; submittedAt?: string; checkedAt?: string }[]
}
