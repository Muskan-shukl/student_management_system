import type { RouteRecordRaw } from 'vue-router'

export const authRoutes: RouteRecordRaw[] = [
  { path: '/login', name: 'login', component: () => import('./views/LoginView.vue'), meta: { title: 'Sign in', guestOnly: true } },
  { path: '/signup', name: 'signup', component: () => import('./views/SignupView.vue'), meta: { title: 'Create account', guestOnly: true } },
  { path: '/forgot-password', name: 'forgot-password', component: () => import('./views/ForgotPasswordView.vue'), meta: { title: 'Forgot password', guestOnly: true } },
  { path: '/reset-password', name: 'reset-password', component: () => import('./views/ResetPasswordView.vue'), meta: { title: 'Reset password', guestOnly: true } },
]
