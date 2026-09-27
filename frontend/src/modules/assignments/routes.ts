import type { RouteRecordRaw } from 'vue-router'

export const assignmentRoutes: RouteRecordRaw[] = [
  { path: 'assignments', name: 'assignments', component: () => import('./views/AssignmentsView.vue'), meta: { title: 'Assignments' } },
]
