<script setup lang="ts">
import { computed } from 'vue'
import { formatDate } from '@/core/utils/format'

/** Small bar trend for a series of {date, percent}. Bars below the threshold turn amber. */
const props = defineProps<{ points: { date: string; percent: number; total?: number }[]; threshold?: number; height?: number }>()
const H = computed(() => props.height ?? 120)
const bars = computed(() => props.points.map((p) => ({ ...p, h: Math.max(4, (p.percent / 100) * (H.value - 24)) })))
const avg = computed(() => (props.points.length ? Math.round(props.points.reduce((n, p) => n + p.percent, 0) / props.points.length) : null))
</script>

<template>
  <div class="trend">
    <div class="trend__bars" :style="{ height: `${H}px` }">
      <div v-for="(b, i) in bars" :key="b.date" class="trend__col" :style="{ '--i': i }" :title="`${formatDate(b.date)} · ${b.percent}%${b.total ? ` of ${b.total}` : ''}`">
        <span class="trend__val">{{ b.percent }}</span>
        <span class="trend__bar" :class="{ 'trend__bar--low': threshold !== undefined && b.percent < threshold }" :style="{ height: `${b.h}px` }" />
        <span class="trend__day">{{ new Date(b.date).getUTCDate() }}</span>
      </div>
      <span v-if="threshold !== undefined" class="trend__line" :style="{ bottom: `${20 + (threshold / 100) * (H - 24)}px` }"><i>{{ threshold }}%</i></span>
    </div>
    <p v-if="avg !== null" class="trend__avg">Average <b>{{ avg }}%</b> over {{ points.length }} school day{{ points.length === 1 ? '' : 's' }}</p>
  </div>
</template>

<style scoped>
.trend__bars { position: relative; display: flex; align-items: flex-end; gap: 6px; }
.trend__col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 4px; height: 100%; min-width: 0; }
.trend__val { font-size: 10px; font-weight: 600; color: var(--text-3); font-variant-numeric: tabular-nums; }
.trend__bar { width: 100%; max-width: 28px; border-radius: 6px 6px 3px 3px; background: linear-gradient(180deg, var(--pine-500), var(--primary)); transform-origin: bottom; animation: grow var(--dur-slow) var(--ease-out) both; animation-delay: calc(var(--i) * 40ms); }
.trend__bar--low { background: linear-gradient(180deg, var(--saffron-500), var(--saffron-600)); }
.trend__day { font-size: 10px; color: var(--text-3); }
.trend__line { position: absolute; left: 0; right: 0; border-top: 1px dashed var(--line-strong); pointer-events: none; }
.trend__line i { position: absolute; right: 0; top: -9px; font-size: 9px; font-style: normal; color: var(--text-3); background: var(--surface); padding: 0 4px; }
.trend__avg { font-size: var(--text-xs); color: var(--text-3); margin-top: var(--sp-3); }
@keyframes grow { from { transform: scaleY(0); } }
</style>
