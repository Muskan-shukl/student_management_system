<script setup lang="ts">
import { computed } from 'vue'
import type { AttendanceHistory } from '@/core/api/types'

/** Month grid: one cell per day, coloured by attendance status. */
const props = defineProps<{ history: AttendanceHistory }>()
const cells = computed(() => {
  const [y, m] = props.history.month.split('-').map(Number)
  const first = new Date(Date.UTC(y!, m! - 1, 1))
  const days = new Date(Date.UTC(y!, m!, 0)).getUTCDate()
  const lead = (first.getUTCDay() + 6) % 7 // Monday-first
  const byDay = new Map(props.history.records.map((r) => [new Date(r.date).getUTCDate(), r.status]))
  const today = new Date().toISOString().slice(0, 10)
  return [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: days }, (_, i) => {
      const d = i + 1
      const iso = `${props.history.month}-${String(d).padStart(2, '0')}`
      return { d, status: byDay.get(d) ?? null, today: iso === today, future: iso > today }
    }),
  ]
})
const title = computed(() => new Date(props.history.month + '-01T00:00:00Z').toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' }))
</script>

<template>
  <div class="cal">
    <p class="cal__title">{{ title }}</p>
    <div class="cal__grid">
      <span v-for="d in ['M', 'T', 'W', 'T', 'F', 'S', 'S']" :key="d + Math.random()" class="cal__dow">{{ d }}</span>
      <span v-for="(c, i) in cells" :key="i" class="cell" :class="c ? [c.status ? `cell--${c.status}` : c.future ? 'cell--future' : 'cell--none', { 'cell--today': c.today }] : 'cell--blank'">{{ c?.d ?? '' }}</span>
    </div>
    <div class="cal__legend">
      <span><i class="cell--present" /> Present</span><span><i class="cell--late" /> Late</span><span><i class="cell--absent" /> Absent</span><span><i class="cell--none" /> Not marked</span>
    </div>
  </div>
</template>

<style scoped>
.cal__title { font-family: var(--font-display); font-size: var(--text-lg); font-weight: 600; margin-bottom: var(--sp-3); }
.cal__grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
.cal__dow { text-align: center; font-size: var(--text-xs); font-weight: 700; color: var(--text-3); padding-bottom: 4px; }
.cell { aspect-ratio: 1; display: grid; place-items: center; border-radius: var(--r-sm); font-size: var(--text-sm); font-weight: 600; font-variant-numeric: tabular-nums; animation: fade-in var(--dur-slow) both; }
.cell--blank { visibility: hidden; }
.cell--present { background: var(--success-soft); color: var(--success-text); }
.cell--late { background: var(--accent-soft); color: var(--accent-text); }
.cell--absent { background: var(--danger-soft); color: var(--danger-text); }
.cell--none { background: var(--surface-2); color: var(--text-2); border: 1.5px solid var(--line-strong); }
.cell--future { color: var(--text-3); opacity: 0.5; }
.cell--today { box-shadow: 0 0 0 2px var(--primary); }
.cal__legend { display: flex; flex-wrap: wrap; gap: var(--sp-4); margin-top: var(--sp-4); font-size: var(--text-xs); color: var(--text-2); }
.cal__legend span { display: inline-flex; align-items: center; gap: 6px; }
.cal__legend i { width: 12px; height: 12px; border-radius: 3px; display: inline-block; }
</style>
