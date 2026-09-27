import type { ApiResponse, FieldError } from './types'
import { tokenStorage } from '@/core/utils/storage'

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:5000/api/v1'

export class ApiError extends Error {
  status: number
  errors: FieldError[]

  constructor(status: number, message: string, errors: FieldError[] = []) {
    super(message)
    this.status = status
    this.errors = errors
  }

  get isNetwork() {
    return this.status === 0
  }
}

type Query = Record<string, string | number | boolean | undefined | null>
interface RequestOptions {
  body?: unknown
  query?: Query
  signal?: AbortSignal
}

let onUnauthorized: (() => void) | null = null
/** Lets the auth store react (clear session, redirect) when a token is rejected. */
export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler
}

const buildUrl = (path: string, query?: Query) => {
  const url = new URL(BASE_URL + path)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  const token = tokenStorage.get()
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(buildUrl(path, options.query), {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    })
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err
    throw new ApiError(0, 'Cannot reach the server. Check your connection and try again.')
  }

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null

  if (!response.ok) {
    if (response.status === 401 && token) onUnauthorized?.()
    throw new ApiError(response.status, payload?.message ?? response.statusText, (payload as { errors?: FieldError[] } | null)?.errors ?? [])
  }
  return payload as ApiResponse<T>
}

export const http = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('POST', path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('PATCH', path, { ...options, body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>('DELETE', path, options),
}

/** Fetches a file (e.g. CSV) with auth and triggers a browser download. */
export async function download(path: string, query?: Query, filename = 'download') {
  const token = tokenStorage.get()
  const res = await fetch(buildUrl(path, query), { headers: token ? { Authorization: `Bearer ${token}` } : {} })
  if (!res.ok) {
    const payload = (await res.json().catch(() => null)) as { message?: string } | null
    throw new ApiError(res.status, payload?.message ?? res.statusText)
  }
  const blob = await res.blob()
  const name = res.headers.get('content-disposition')?.match(/filename="?([^"]+)"?/)?.[1] ?? filename
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: name })
  a.click()
  URL.revokeObjectURL(url)
}

export const toApiError = (err: unknown): ApiError =>
  err instanceof ApiError ? err : new ApiError(0, (err as Error)?.message || 'Something went wrong')
