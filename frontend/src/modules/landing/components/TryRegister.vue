<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AppIcon from '@/ui/AppIcon.vue'

type Status = 'present' | 'late' | 'absent'
interface Row { id: number; name: string; roll: string; status: Status | null }

const STATUS: { value: Status; label: string; icon: string }[] = [
  { value: 'present', label: 'Present', icon: 'check' },
  { value: 'late', label: 'Late', icon: 'clock' },
  { value: 'absent', label: 'Absent', icon: 'x' },
]
const fresh = (): Row[] => [
  { id: 1, name: 'Neha Sharma', roll: 'STU-2026-0001', status: null },
  { id: 2, name: 'Priya Desai', roll: 'STU-2026-0002', status: null },
  { id: 3, name: 'Rohan Iyer', roll: 'STU-2026-0003', status: null },
  { id: 4, name: 'Simran Kaur', roll: 'STU-2026-0004', status: null },
]

const rows = ref<Row[]>(fresh())
const saved = ref(false)
const burst = ref(0)

const marked = computed(() => rows.value.filter((r) => r.status).length)
const present = computed(() => rows.value.filter((r) => r.status === 'present' || r.status === 'late').length)
const pct = computed(() => (marked.value ? Math.round((present.value / marked.value) * 100) : 0))
const R = 44
const C = 2 * Math.PI * R
const dash = computed(() => C - (C * pct.value) / 100)

const set = (row: Row, s: Status) => { if (saved.value) return; row.status = row.status === s ? null : s }
const allPresent = () => { if (saved.value) return; rows.value.forEach((r) => (r.status = 'present')) }
const save = () => { if (!marked.value || saved.value) return; saved.value = true; burst.value++ }
const reset = () => { rows.value = fresh(); saved.value = false }

/* ---------- self-playing demo ---------- */
const root = ref<HTMLElement | null>(null)
const auto = ref(false)
const taken = ref(false)
const cursor = ref<{ row: number; col: number } | null>(null)
const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
let token = 0
let io: IntersectionObserver | null = null

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const PLAN: [number, Status][] = [[0, 'present'], [1, 'present'], [2, 'late'], [3, 'present']]

async function runDemo() {
  if (taken.value || reduce || auto.value) return
  const my = ++token
  auto.value = true
  while (my === token) {
    reset()
    await sleep(650); if (my !== token) return
    for (const [ri, st] of PLAN) {
      cursor.value = { row: ri, col: STATUS.findIndex((s) => s.value === st) }
      await sleep(620); if (my !== token) return
      const r = rows.value[ri]; if (r) r.status = st
      await sleep(220); if (my !== token) return
    }
    cursor.value = null
    await sleep(520); if (my !== token) return
    save()
    await sleep(2800); if (my !== token) return
  }
}
function stopDemo() { token++; auto.value = false; cursor.value = null }
/** Any real interaction hands control to the visitor and ends the auto-play for good. */
function takeOver() { if (taken.value) return; taken.value = true; stopDemo() }

const onSet = (row: Row, s: Status) => { takeOver(); set(row, s) }
const onAll = () => { takeOver(); allPresent() }
const onSave = () => { takeOver(); save() }
const onReset = () => { takeOver(); reset() }

onMounted(() => {
  if (!root.value || !('IntersectionObserver' in window)) return
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { if (!taken.value) runDemo() }
        else stopDemo()
      }
    },
    { threshold: 0.4 }
  )
  io.observe(root.value)
})
onBeforeUnmount(() => { io?.disconnect(); stopDemo() })
</script>

<template>
  <div ref="root" class="try" :class="{ 'try--saved': saved, 'try--auto': auto }">
    <div class="try__sheet">
      <div class="try__bar">
        <div>
          <p class="try__date">Today’s register</p>
          <p class="text-3 text-xs">{{ marked }} of {{ rows.length }} marked</p>
        </div>
        <Transition name="fade" mode="out-in">
          <span v-if="auto && !taken" key="auto" class="try__badge"><span class="try__blink" /> Auto demo playing</span>
          <button v-else key="btn" type="button" class="try__ghost" :disabled="saved" @click="onAll"><AppIcon name="check" :size="14" /> All present</button>
        </Transition>
      </div>

      <ul class="rows">
        <li v-for="(r, i) in rows" :key="r.id" class="row" :class="{ 'row--done': r.status, 'row--aim': cursor && cursor.row === i }" :style="{ '--i': i }">
          <span class="row__av">{{ r.name.split(' ').map((w) => w[0]).join('') }}</span>
          <span class="row__who"><b>{{ r.name }}</b><small class="mono">{{ r.roll }}</small></span>
          <span class="seg" role="radiogroup" :aria-label="`Attendance for ${r.name}`">
            <button
              v-for="(o, j) in STATUS"
              :key="o.value"
              type="button"
              role="radio"
              :aria-checked="r.status === o.value"
              class="seg__btn"
              :class="[`seg__btn--${o.value}`, { 'seg__btn--on': r.status === o.value, 'seg__btn--aim': cursor && cursor.row === i && cursor.col === j }]"
              :disabled="saved"
              @click="onSet(r, o.value)"
            >
              <AppIcon :name="o.icon" :size="13" /><span>{{ o.label }}</span>
            </button>
          </span>
        </li>
      </ul>

      <div class="try__foot">
        <Transition name="fade" mode="out-in">
          <p v-if="saved" key="ok" class="try__ok"><AppIcon name="check" :size="15" /> Saved · {{ marked }} students · visible to admin and students now</p>
          <p v-else-if="auto && !taken" key="auto" class="text-3 text-sm">Watch it fill in — or jump in and mark it yourself.</p>
          <p v-else key="hint" class="text-3 text-sm">Tap a status for each student, then save. This is a demo — nothing is stored.</p>
        </Transition>
        <div class="try__actions">
          <button v-if="saved" type="button" class="try__ghost" @click="onReset"><AppIcon name="refresh" :size="14" /> Try again</button>
          <button type="button" class="try__save" :class="{ 'try__save--pulse': auto && marked && !saved }" :disabled="!marked || saved" @click="onSave">Save register <AppIcon name="arrow-right" :size="15" /></button>
        </div>
      </div>
    </div>

    <div class="try__ring">
      <div class="ring" :key="burst">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" :r="R" class="ring__bg" />
          <circle cx="50" cy="50" :r="R" class="ring__fg" :class="{ 'ring__fg--low': marked && pct < 75 }" :style="{ strokeDasharray: C, strokeDashoffset: dash }" />
        </svg>
        <div class="ring__center">
          <span class="ring__pct mono">{{ marked ? `${pct}%` : '—' }}</span>
          <span class="ring__lbl">present today</span>
        </div>
        <span v-for="n in 12" :key="n" class="spark" :style="{ '--n': n }" />
      </div>
      <ul class="legend">
        <li><i class="legend__dot legend__dot--present" /> Present <b class="mono">{{ rows.filter((r) => r.status === 'present').length }}</b></li>
        <li><i class="legend__dot legend__dot--late" /> Late <b class="mono">{{ rows.filter((r) => r.status === 'late').length }}</b></li>
        <li><i class="legend__dot legend__dot--absent" /> Absent <b class="mono">{{ rows.filter((r) => r.status === 'absent').length }}</b></li>
      </ul>
      <p class="legend__note" :class="{ 'legend__note--warn': marked && pct < 75 }">
        <AppIcon :name="marked && pct < 75 ? 'alert' : 'shield'" :size="14" />
        {{ marked && pct < 75 ? 'Below the 75% line — the admin would see this flagged.' : 'Anyone under 75% is flagged automatically.' }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.try { display: grid; grid-template-columns: 1.5fr 1fr; gap: var(--sp-6); align-items: stretch; }
.try__sheet { background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-xl); box-shadow: var(--shadow-sm); overflow: hidden; display: flex; flex-direction: column; }
.try__bar { display: flex; align-items: center; justify-content: space-between; gap: var(--sp-3); padding: var(--sp-4) var(--sp-5); border-bottom: 1px solid var(--line); }
.try__date { font-family: var(--font-display); font-weight: 600; font-size: var(--text-lg); }
.try__badge { display: inline-flex; align-items: center; gap: 7px; padding: 6px 12px; border-radius: var(--r-full); background: var(--primary-soft); color: var(--primary-text); font-size: 11px; font-weight: 700; white-space: nowrap; }
.try__blink { width: 7px; height: 7px; border-radius: 50%; background: var(--primary); box-shadow: 0 0 0 0 var(--primary); animation: blink 1.4s var(--ease) infinite; }
@keyframes blink { 70% { box-shadow: 0 0 0 6px transparent; } 100% { box-shadow: 0 0 0 0 transparent; } }
.try__ghost { display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: var(--r-sm); border: 1px solid var(--line-strong); font-size: var(--text-xs); font-weight: 600; color: var(--text-2); background: var(--surface); transition: all var(--dur-fast); }
.try__ghost:hover:not(:disabled) { background: var(--surface-2); color: var(--text); }
.try__ghost:disabled { opacity: 0.5; }
.rows { display: flex; flex-direction: column; }
.row { position: relative; display: flex; align-items: center; gap: var(--sp-3); padding: var(--sp-3) var(--sp-5); border-bottom: 1px solid var(--line); transition: background var(--dur); }
.row--done { background: color-mix(in srgb, var(--success-soft) 45%, transparent); }
.row--aim { background: color-mix(in srgb, var(--primary-soft) 55%, transparent); }
.row__av { width: 36px; height: 36px; border-radius: 40%; display: grid; place-items: center; background: var(--primary-soft); color: var(--primary-text); font-family: var(--font-display); font-weight: 600; font-size: 12px; flex-shrink: 0; }
.row__who { flex: 1; display: flex; flex-direction: column; min-width: 0; font-size: var(--text-sm); line-height: 1.2; }
.row__who small { color: var(--text-3); font-size: 11px; }
.seg { display: flex; padding: 3px; background: var(--surface-3); border-radius: var(--r-md); gap: 2px; }
.seg__btn { position: relative; display: inline-flex; align-items: center; gap: 5px; padding: 6px 10px; border-radius: calc(var(--r-md) - 3px); font-size: var(--text-xs); font-weight: 600; color: var(--text-3); transition: all var(--dur-fast) var(--ease); }
.seg__btn:hover:not(:disabled) { color: var(--text); }
.seg__btn--on { background: var(--surface); box-shadow: var(--shadow-sm); transform: scale(1.03); }
.seg__btn--on.seg__btn--present { color: var(--success-text); }
.seg__btn--on.seg__btn--late { color: var(--accent-text); }
.seg__btn--on.seg__btn--absent { color: var(--danger-text); }
.seg__btn--aim { box-shadow: 0 0 0 2px var(--primary); animation: tap 620ms var(--ease-out); }
@keyframes tap { 0%, 100% { transform: scale(1); } 55% { transform: scale(0.9); } }

.try__foot { margin-top: auto; padding: var(--sp-4) var(--sp-5); display: flex; align-items: center; justify-content: space-between; gap: var(--sp-4); flex-wrap: wrap; }
.try__ok { display: inline-flex; align-items: center; gap: 8px; font-size: var(--text-sm); font-weight: 600; color: var(--success-text); }
.try__actions { display: flex; gap: var(--sp-2); margin-left: auto; }
.try__save { display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 var(--sp-5); border-radius: var(--r-md); background: var(--primary); color: var(--on-primary); font-weight: 600; font-size: var(--text-sm); transition: all var(--dur-fast); }
.try__save:hover:not(:disabled) { background: var(--primary-hover); transform: translateY(-1px); }
.try__save:disabled { opacity: 0.45; }
.try__save--pulse { animation: savepulse 1.4s var(--ease) infinite; }
@keyframes savepulse { 0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--primary) 45%, transparent); } 50% { box-shadow: 0 0 0 7px transparent; } }

.try__ring { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--sp-5); padding: var(--sp-6); border-radius: var(--r-xl); background: var(--surface); border: 1px solid var(--line); }
.ring { position: relative; width: 180px; height: 180px; }
.ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.ring__bg { fill: none; stroke: var(--surface-3); stroke-width: 9; }
.ring__fg { fill: none; stroke: var(--primary); stroke-width: 9; stroke-linecap: round; transition: stroke-dashoffset 700ms var(--ease-out), stroke var(--dur); }
.ring__fg--low { stroke: var(--danger); }
.ring__center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.ring__pct { font-family: var(--font-display); font-size: var(--text-3xl); font-weight: 600; line-height: 1; }
.ring__lbl { font-size: var(--text-xs); color: var(--text-3); margin-top: 4px; }
.spark { position: absolute; left: 50%; top: 50%; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); opacity: 0; --a: calc(var(--n) * 30deg); }
.try--saved .spark { animation: spark 900ms var(--ease-out) both; animation-delay: calc(var(--n) * 12ms); }
.try--saved .spark:nth-child(odd) { background: var(--primary); }
@keyframes spark { 0% { opacity: 1; transform: translate(-50%, -50%) rotate(var(--a)) translateY(-70px) scale(0.4); } 100% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--a)) translateY(-120px) scale(1.2); } }
.legend { display: flex; gap: var(--sp-4); font-size: var(--text-xs); color: var(--text-2); }
.legend li { display: inline-flex; align-items: center; gap: 6px; }
.legend b { color: var(--text); }
.legend__dot { width: 8px; height: 8px; border-radius: 50%; }
.legend__dot--present { background: var(--success); }
.legend__dot--late { background: var(--accent); }
.legend__dot--absent { background: var(--danger); }
.legend__note { display: flex; align-items: center; gap: 8px; font-size: var(--text-xs); color: var(--text-3); text-align: left; padding: 8px 12px; border-radius: var(--r-sm); background: var(--surface-2); transition: all var(--dur); }
.legend__note--warn { background: var(--danger-soft); color: var(--danger-text); }

@media (max-width: 900px) {
  .try { grid-template-columns: 1fr; }
  .seg__btn span { display: none; }
  .seg__btn { padding: 7px 9px; }
  .try__badge { font-size: 10px; padding: 5px 9px; }
}
</style>
