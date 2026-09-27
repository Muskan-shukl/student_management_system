import type { RouteRecordRaw } from 'vue-router'

export const profileRoutes: RouteRecordRaw[] = [
  { path: 'settings', name: 'settings', component: () => import('./views/SettingsView.vue'), meta: { title: 'Settings' } },
]
