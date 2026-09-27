import type { RouteRecordRaw } from 'vue-router'

export const announcementRoutes: RouteRecordRaw[] = [
  { path: 'announcements', name: 'announcements', component: () => import('./views/AnnouncementsView.vue'), meta: { title: 'Announcements' } },
]
