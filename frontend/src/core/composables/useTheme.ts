import { ref, watchEffect } from 'vue'
import { themeStorage } from '@/core/utils/storage'

export type Theme = 'light' | 'dark' | 'system'
const theme = ref<Theme>((themeStorage.get() as Theme) || 'system')
const media = window.matchMedia('(prefers-color-scheme: dark)')

const apply = () => {
  const resolved = theme.value === 'system' ? (media.matches ? 'dark' : 'light') : theme.value
  document.documentElement.dataset.theme = resolved
}

media.addEventListener('change', apply)
watchEffect(() => {
  themeStorage.set(theme.value)
  apply()
})

export const useTheme = () => ({ theme, setTheme: (value: Theme) => (theme.value = value) })
