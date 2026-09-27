import { ref, watch, type Ref } from 'vue'

/** Returns a ref that lags `source` by `delay` ms — ideal for search inputs. */
export function useDebouncedRef<T>(source: Ref<T>, delay = 350) {
  const debounced = ref(source.value) as Ref<T>
  let timer: number | undefined
  watch(source, (value) => {
    window.clearTimeout(timer)
    timer = window.setTimeout(() => (debounced.value = value), delay)
  })
  return debounced
}
