import type { RouteRecordRaw } from 'vue-router'

export const landingRoutes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: () => import('./views/LandingView.vue'), meta: { title: 'Student management, done right', public: true } },
]
