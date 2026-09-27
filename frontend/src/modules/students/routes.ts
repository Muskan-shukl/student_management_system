import type { RouteRecordRaw } from 'vue-router'

export const studentRoutes: RouteRecordRaw[] = [
  { path: 'students', name: 'students', component: () => import('./views/StudentsView.vue'), meta: { title: 'Students', roles: ['admin', 'teacher'] } },
  { path: 'students/:id', name: 'student-detail', component: () => import('./views/StudentDetailView.vue'), meta: { title: 'Student', roles: ['admin', 'teacher'] } },
  { path: 'academics', name: 'academics', component: () => import('./views/MyAcademicsView.vue'), meta: { title: 'My academics', roles: ['student'] } },
]
