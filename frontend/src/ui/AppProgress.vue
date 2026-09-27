<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ value: number | null | undefined; ring?: boolean; size?: number; label?: string }>()
const pct = computed(() => Math.max(0, Math.min(100, props.value ?? 0)))
const tone = computed(() => (props.value === null || props.value === undefined ? 'neutral' : pct.value >= 75 ? 'good' : pct.value >= 50 ? 'warn' : 'bad'))
const r = 42
const circumference = 2 * Math.PI * r
</script>

<template>
  <div v-if="ring" class="ring" :class="`ring--${tone}`" :style="{ '--size': `${size ?? 120}px` }">
    <svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" :r="r" class="ring__track" />
      <circle cx="50" cy="50" :r="r" class="ring__bar" :style="{ strokeDasharray: circumference, strokeDashoffset: circumference * (1 - pct / 100) }" />
    </svg>
    <div class="ring__center">
      <span class="ring__value mono">{{ value === null || value === undefined ? '—' : `${pct}%` }}</span>
      <span v-if="label" class="ring__label">{{ label }}</span>
    </div>
  </div>
  <div v-else class="bar" :class="`bar--${tone}`" role="progressbar" :aria-valuenow="pct">
    <span class="bar__fill" :style="{ width: `${pct}%` }" />
  </div>
</template>

<style scoped>
.bar { height: 6px; border-radius: var(--r-full); background: var(--surface-3); overflow: hidden; }
.bar__fill { display: block; height: 100%; border-radius: inherit; background: var(--tone); transition: width var(--dur-slow) var(--ease-out); }
.bar--good, .ring--good { --tone: var(--success); }
.bar--warn, .ring--warn { --tone: var(--accent); }
.bar--bad, .ring--bad { --tone: var(--danger); }
.bar--neutral, .ring--neutral { --tone: var(--text-3); }

.ring { position: relative; width: var(--size); height: var(--size); }
.ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.ring__track { fill: none; stroke: var(--surface-3); stroke-width: 9; }
.ring__bar { fill: none; stroke: var(--tone); stroke-width: 9; stroke-linecap: round; transition: stroke-dashoffset 1s var(--ease-out); }
.ring__center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.ring__value { font-family: var(--font-display); font-size: calc(var(--size) * 0.21); font-weight: 600; line-height: 1; }
.ring__label { font-size: clamp(9px, calc(var(--size) * 0.1), 12px); color: var(--text-3); margin-top: 3px; letter-spacing: 0.02em; }
</style>
