const TOKEN_KEY = 'vidyara.token'
const THEME_KEY = 'vidyara.theme'

const safe = {
  get(key: string) {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key: string, value: string | null) {
    try {
      value === null ? localStorage.removeItem(key) : localStorage.setItem(key, value)
    } catch {
      /* storage unavailable (private mode) — ignore */
    }
  },
}

export const tokenStorage = {
  get: () => safe.get(TOKEN_KEY),
  set: (token: string | null) => safe.set(TOKEN_KEY, token),
}

export const themeStorage = {
  get: () => safe.get(THEME_KEY),
  set: (theme: string | null) => safe.set(THEME_KEY, theme),
}
