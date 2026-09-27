import type { RouteRecordRaw } from 'vue-router'

export const timetableRoutes: RouteRecordRaw[] = [
  { path: 'timetable', name: 'timetable', component: () => import('./views/TimetableView.vue'), meta: { title: 'Timetable' } },
]
