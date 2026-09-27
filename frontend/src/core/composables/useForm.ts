import { reactive, ref, computed } from 'vue'
import type { ZodType } from 'zod'
import type { FieldError } from '@/core/api/types'
import { toApiError } from '@/core/api/http'

type Errors<T> = Partial<Record<keyof T, string>>

/**
 * Zod-backed form state: values, per-field errors, touched tracking,
 * server-error mapping and a guarded submit handler.
 */
export function useForm<T extends Record<string, unknown>>(schema: ZodType<T>, initial: NoInfer<T>) {
  const values = reactive({ ...initial }) as T
  const errors = reactive({}) as Errors<T>
  const touched = reactive({}) as Partial<Record<keyof T, boolean>>
  const submitting = ref(false)
  const formError = ref<string | null>(null)

  const clearErrors = () => {
    for (const key of Object.keys(errors)) delete errors[key as keyof T]
    formError.value = null
  }

  const validate = (): T | null => {
    const result = schema.safeParse(values)
    clearErrors()
    if (result.success) return result.data
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof T | undefined
      if (key && !errors[key]) errors[key] = issue.message
    }
    return null
  }

  const validateField = (field: keyof T) => {
    touched[field] = true
    const result = schema.safeParse(values)
    const issue = result.success ? undefined : result.error.issues.find((i) => i.path[0] === field)
    if (issue) errors[field] = issue.message
    else delete errors[field]
  }

  const setServerErrors = (fieldErrors: FieldError[]) => {
    for (const { field, message } of fieldErrors) {
      const key = field as keyof T
      if (key in values) errors[key] = message
    }
  }

  const reset = (next: Partial<T> = {}) => {
    Object.assign(values, initial, next)
    for (const key of Object.keys(touched)) delete touched[key as keyof T]
    clearErrors()
  }

  const handleSubmit = (onValid: (data: T) => Promise<void> | void) => async () => {
    for (const key of Object.keys(values)) touched[key as keyof T] = true
    const data = validate()
    if (!data) return
    submitting.value = true
    formError.value = null
    try {
      await onValid(data)
    } catch (err) {
      const apiError = toApiError(err)
      setServerErrors(apiError.errors)
      if (!apiError.errors.length || apiError.status !== 400) formError.value = apiError.message
    } finally {
      submitting.value = false
    }
  }

  const isValid = computed(() => schema.safeParse(values).success)

  return { values, errors, touched, submitting, formError, isValid, validate, validateField, setServerErrors, reset, handleSubmit }
}
