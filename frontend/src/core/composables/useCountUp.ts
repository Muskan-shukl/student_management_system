import { ref, watch, type Ref } from 'vue'

/** Animates a number from 0 to the target whenever the target changes. */
export function useCountUp(target: Ref<number | null | undefined>, duration = 900) {
  const display = ref(0)
  let frame = 0

  watch(
    target,
    (value) => {
      cancelAnimationFrame(frame)
      const end = value ?? 0
      const start = performance.now()
      const from = display.value
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration)
        const eased = 1 - Math.pow(1 - t, 3)
        display.value = Math.round(from + (end - from) * eased)
        if (t < 1) frame = requestAnimationFrame(step)
      }
      frame = requestAnimationFrame(step)
    },
    { immediate: true }
  )
  return display
}
