import type { RouteRecordRaw } from 'vue-router'

export const attendanceRoutes: RouteRecordRaw[] = [
  { path: 'attendance', name: 'attendance', component: () => import('./views/AttendanceView.vue'), meta: { title: 'Attendance', roles: ['admin', 'teacher', 'student'] } },
]
