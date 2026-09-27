import { reactive, readonly } from 'vue'

export type ToastTone = 'success' | 'error' | 'info'
export interface Toast {
  id: number
  tone: ToastTone
  title: string
  description?: string
}

const state = reactive<{ items: Toast[] }>({ items: [] })
let seq = 0

const push = (tone: ToastTone, title: string, description?: string, duration = 3800) => {
  const id = ++seq
  state.items.push({ id, tone, title, description })
  window.setTimeout(() => dismiss(id), duration)
  return id
}

const dismiss = (id: number) => {
  const index = state.items.findIndex((t) => t.id === id)
  if (index !== -1) state.items.splice(index, 1)
}

export const useToast = () => ({
  items: readonly(state).items,
  success: (title: string, description?: string) => push('success', title, description),
  error: (title: string, description?: string) => push('error', title, description, 5200),
  info: (title: string, description?: string) => push('info', title, description),
  dismiss,
})
