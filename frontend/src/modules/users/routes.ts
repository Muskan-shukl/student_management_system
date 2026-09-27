import type { RouteRecordRaw } from 'vue-router'

export const userRoutes: RouteRecordRaw[] = [
  { path: 'users', name: 'users', component: () => import('./views/UsersView.vue'), meta: { title: 'Users', roles: ['admin'] } },
]
