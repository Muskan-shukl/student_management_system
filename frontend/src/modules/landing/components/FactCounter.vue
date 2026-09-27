<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useCountUp } from '@/core/composables/useCountUp'

const props = defineProps<{ value: number; prefix?: string; suffix?: string; label: string; delay?: number }>()
const el = ref<HTMLElement | null>(null)
const target = ref<number | null>(null)
const display = useCountUp(target, 1400)

onMounted(() => {
  if (!el.value || !('IntersectionObserver' in window)) { target.value = props.value; return }
  const io = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting) { window.setTimeout(() => (target.value = props.value), props.delay ?? 0); io.disconnect() }
  }, { threshold: 0.5 })
  io.observe(el.value)
})
</script>

<template>
  <div ref="el" class="fact">
    <p class="fact__v"><span class="text-3">{{ prefix }}</span>{{ display }}<span class="fact__suffix">{{ suffix }}</span></p>
    <p class="fact__l">{{ label }}</p>
  </div>
</template>

<style scoped>
.fact { padding: var(--sp-6) var(--sp-4); text-align: center; }
.fact__v { font-family: var(--font-display); font-size: var(--text-3xl); font-weight: 600; color: var(--primary-text); line-height: 1; font-variant-numeric: tabular-nums; }
.fact__suffix { font-size: 0.6em; margin-left: 2px; color: var(--accent-text); }
.fact__l { font-size: var(--text-sm); color: var(--text-2); margin-top: var(--sp-2); }
</style>
