import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { AuthSession, User } from '@/core/api/types'
import { setUnauthorizedHandler } from '@/core/api/http'
import { tokenStorage } from '@/core/utils/storage'
import { authApi } from '@/modules/auth/api'
import type { LoginInput, SignupInput } from '@/modules/auth/schemas'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(tokenStorage.get())
  const ready = ref(false)

  const isAuthenticated = computed(() => Boolean(user.value && token.value))
  const role = computed(() => user.value?.role ?? null)
  const isAdmin = computed(() => role.value === 'admin')
  const isTeacher = computed(() => role.value === 'teacher')
  const isStudent = computed(() => role.value === 'student')

  const setSession = (session: AuthSession | null) => {
    user.value = session?.user ?? null
    token.value = session?.token ?? null
    tokenStorage.set(token.value)
  }

  /** Restores the session from a stored token on app start. */
  const bootstrap = async () => {
    if (ready.value) return
    if (token.value) {
      try {
        const { data } = await authApi.me()
        user.value = data
      } catch {
        setSession(null)
      }
    }
    ready.value = true
  }

  const login = async (input: LoginInput) => {
    const { data } = await authApi.login(input)
    setSession(data)
    return data.user
  }

  const signup = async (input: SignupInput) => {
    const { data } = await authApi.signup(input)
    if (data.token) setSession(data)
    return data
  }

  const logout = async () => {
    try {
      if (token.value) await authApi.logout()
    } finally {
      setSession(null)
    }
  }

  const updateUser = (next: User) => {
    user.value = next
  }

  setUnauthorizedHandler(() => setSession(null))

  return { user, token, ready, isAuthenticated, role, isAdmin, isTeacher, isStudent, bootstrap, login, signup, logout, setSession, updateUser }
})
