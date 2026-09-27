import { ref, shallowRef } from 'vue'
import { toApiError, type ApiError } from '@/core/api/http'

/** Tracks loading / error state around an async loader. Re-run with `run()`. */
export function useAsync<T, A extends unknown[] = []>(loader: (...args: A) => Promise<T>) {
  const data = shallowRef<T | null>(null)
  const loading = ref(false)
  const error = ref<ApiError | null>(null)
  let latest = 0

  const run = async (...args: A) => {
    const ticket = ++latest
    loading.value = true
    error.value = null
    try {
      const result = await loader(...args)
      if (ticket === latest) data.value = result
      return result
    } catch (err) {
      if (ticket === latest) error.value = toApiError(err)
      return null
    } finally {
      if (ticket === latest) loading.value = false
    }
  }

  return { data, loading, error, run }
}
