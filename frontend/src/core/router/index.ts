import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import type { Role } from '@/core/api/types'
import { useAuthStore } from '@/core/stores/auth'
import { landingRoutes } from '@/modules/landing/routes'
import { authRoutes } from '@/modules/auth/routes'
import { dashboardRoutes } from '@/modules/dashboard/routes'
import { studentRoutes } from '@/modules/students/routes'
import { userRoutes } from '@/modules/users/routes'
import { profileRoutes } from '@/modules/profile/routes'
import { announcementRoutes } from '@/modules/announcements/routes'
import { assignmentRoutes } from '@/modules/assignments/routes'
import { attendanceRoutes } from '@/modules/attendance/routes'
import { timetableRoutes } from '@/modules/timetable/routes'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    /** Anyone can view, signed in or not (landing page). */
    public?: boolean
    /** Route is for signed-out visitors (login, signup). */
    guestOnly?: boolean
    /** Restrict to these roles; omit = any authenticated user. */
    roles?: Role[]
  }
}

const routes: RouteRecordRaw[] = [
  ...landingRoutes,
  ...authRoutes,
  {
    path: '/',
    component: () => import('@/layouts/AppShell.vue'),
    children: [...dashboardRoutes, ...studentRoutes, ...userRoutes, ...attendanceRoutes, ...assignmentRoutes, ...announcementRoutes, ...timetableRoutes, ...profileRoutes],
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/modules/dashboard/views/NotFoundView.vue') },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.bootstrap()

  if (to.meta.public || to.name === 'not-found') return true
  if (to.meta.guestOnly) return auth.isAuthenticated ? { name: 'dashboard' } : true

  if (!auth.isAuthenticated) return { name: 'login', query: to.fullPath !== '/dashboard' ? { redirect: to.fullPath } : {} }
  if (to.meta.roles && auth.role && !to.meta.roles.includes(auth.role)) return { name: 'dashboard' }
  return true
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · Vidyara` : 'Vidyara'
})
