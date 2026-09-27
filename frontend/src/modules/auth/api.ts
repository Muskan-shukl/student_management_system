import { http } from '@/core/api/http'
import type { AuthSession, User } from '@/core/api/types'
import type { ChangePasswordInput, ForgotPasswordInput, LoginInput, ProfileInput, SignupInput } from './schemas'

export const authApi = {
  signup: (input: SignupInput) => http.post<AuthSession>('/auth/signup', input),
  login: (input: LoginInput) => http.post<AuthSession>('/auth/login', input),
  logout: () => http.post<null>('/auth/logout'),
  me: () => http.get<User>('/auth/me'),
  updateProfile: (input: Partial<ProfileInput>) => http.patch<User>('/auth/me', input),
  changePassword: (input: Pick<ChangePasswordInput, 'currentPassword' | 'newPassword'>) =>
    http.patch<AuthSession>('/auth/password', input),
  forgotPassword: (input: ForgotPasswordInput) => http.post<null>('/auth/forgot-password', input),
  resetPassword: (input: { token: string; password: string }) => http.post<null>('/auth/reset-password', input),
}
