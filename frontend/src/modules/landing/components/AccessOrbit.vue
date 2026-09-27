<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AppIcon from '@/ui/AppIcon.vue'

/**
 * "Who sees what": the role in the middle, every kind of data on a slowly
 * turning ring around it. It cycles admin → teacher → student on its own
 * (pausing while the visitor hovers); clicking a role restarts the timer.
 */
type Level = 'full' | 'own' | 'none'
type Tone = 'accent' | 'info' | 'primary'
interface Role { key: string; title: string; tone: Tone; icon: string; line: string; access: Record<string, Level> }
interface Node { key: string; icon: string; label: string }

const NODES: Node[] = [
  { key: 'students', icon: 'students', label: 'Student records' },
  { key: 'attendance', icon: 'calendar', label: 'Attendance' },
  { key: 'grades', icon: 'trending', label: 'Grades' },
  { key: 'timetable', icon: 'clock', label: 'Timetable' },
  { key: 'assignments', icon: 'edit', label: 'Assignments' },
  { key: 'notices', icon: 'inbox', label: 'Announcements' },
  { key: 'approvals', icon: 'user-check', label: 'Teacher approvals' },
  { key: 'users', icon: 'shield', label: 'Accounts & roles' },
]

const ROLES: Role[] = [
  { key: 'admin', title: 'Admin', tone: 'accent', icon: 'shield', line: 'Sees the whole campus.',
    access: { students: 'full', attendance: 'full', grades: 'full', timetable: 'full', assignments: 'full', notices: 'full', approvals: 'full', users: 'full' } },
  { key: 'teacher', title: 'Teacher', tone: 'info', icon: 'book', line: 'Sees only the students assigned to them.',
    access: { students: 'own', attendance: 'own', grades: 'own', timetable: 'own', assignments: 'own', notices: 'full', approvals: 'none', users: 'none' } },
  { key: 'student', title: 'Student', tone: 'primary', icon: 'hat', line: 'Sees themselves, and nothing else.',
    access: { students: 'own', attendance: 'own', grades: 'own', timetable: 'own', assignments: 'own', notices: 'full', approvals: 'none', users: 'none' } },
]

const LEVEL_LABEL: Record<Level, string> = { full: 'Full access', own: 'Own records only', none: 'Not visible' }
const CYCLE = 4200

const active = ref(0)
const hovering = ref(false)
const role = computed(() => ROLES[active.value]!)
const angle = ref(0)
let raf = 0
let last = 0
let timer: number | undefined
const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const spin = (t: number) => {
  if (last) angle.value = (angle.value + (t - last) * 0.004) % 360
  last = t
  raf = requestAnimationFrame(spin)
}
const startCycle = () => {
  if (timer) window.clearInterval(timer)
  if (reduce) return
  timer = window.setInterval(() => { if (!hovering.value) active.value = (active.value + 1) % ROLES.length }, CYCLE)
}
/** Manual pick: switch and restart the timer so it doesn't jump immediately after. */
const pick = (i: number) => { active.value = i; startCycle() }

onMounted(() => { if (!reduce) raf = requestAnimationFrame(spin); startCycle() })
onBeforeUnmount(() => { cancelAnimationFrame(raf); if (timer) window.clearInterval(timer) })

const pos = (i: number) => {
  const a = ((i / NODES.length) * 360 + angle.value) * (Math.PI / 180)
  return { x: 50 + Math.cos(a) * 41, y: 50 + Math.sin(a) * 41 }
}
const summary = computed(() => {
  const full = NODES.filter((n) => role.value.access[n.key] === 'full').length
  const own = NODES.filter((n) => role.value.access[n.key] === 'own').length
  const none = NODES.length - full - own
  return { full, own, none }
})
</script>

<template>
  <div
    class="orbit"
    :class="[`orbit--${role.tone}`, { 'orbit--paused': hovering || reduce }]"
    :style="{ '--cycle': `${CYCLE}ms` }"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
  >
    <div class="orbit__stage">
      <span class="orbit__halo" />

      <svg class="orbit__lines" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <radialGradient id="orbGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="var(--tone)" stop-opacity="0.14" />
            <stop offset="100%" stop-color="var(--tone)" stop-opacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="41" fill="url(#orbGlow)" />
        <circle cx="50" cy="50" r="41" class="orbit__ring" />
        <circle cx="50" cy="50" r="41" class="orbit__ring orbit__ring--dash" />
        <line v-for="(n, i) in NODES" :key="n.key" x1="50" y1="50" :x2="pos(i).x" :y2="pos(i).y" class="orbit__line" :class="`orbit__line--${role.access[n.key]}`" />
      </svg>

      <button
        v-for="(n, i) in NODES"
        :key="n.key"
        type="button"
        class="node"
        :class="`node--${role.access[n.key]}`"
        :style="{ left: `${pos(i).x}%`, top: `${pos(i).y}%` }"
        :title="`${n.label} · ${LEVEL_LABEL[role.access[n.key]!]}`"
      >
        <span class="node__icon"><AppIcon :name="n.icon" :size="16" /></span>
        <span class="node__label">{{ n.label }}</span>
        <span class="node__state">{{ LEVEL_LABEL[role.access[n.key]!] }}</span>
      </button>

      <div class="core">
        <span class="core__glow" />
        <svg v-if="!reduce" class="core__count" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="47" class="core__count-bg" />
          <circle :key="active" cx="50" cy="50" r="47" class="core__count-fill" />
        </svg>
        <Transition name="core" mode="out-in">
          <div :key="role.key" class="core__inner">
            <span class="core__icon"><AppIcon :name="role.icon" :size="26" /></span>
            <p class="core__title">{{ role.title }}</p>
            <p class="core__line">{{ role.line }}</p>
          </div>
        </Transition>
      </div>
    </div>

    <div class="orbit__side">
      <div class="roles" role="tablist">
        <button v-for="(r, i) in ROLES" :key="r.key" type="button" role="tab" :aria-selected="active === i" class="role" :class="[`role--${r.tone}`, { 'role--on': active === i }]" @click="pick(i)">
          <span class="role__icon"><AppIcon :name="r.icon" :size="15" /></span>
          <span>{{ r.title }}</span>
          <svg v-if="active === i && !reduce" class="role__timer" viewBox="0 0 36 36" aria-hidden="true">
            <circle cx="18" cy="18" r="15" class="role__timer-bg" />
            <circle :key="active" cx="18" cy="18" r="15" class="role__timer-fill" />
          </svg>
        </button>
      </div>

      <div class="legend">
        <div class="legend__row"><i class="legend__dot legend__dot--full" /><b>{{ summary.full }}</b> full access</div>
        <div class="legend__row"><i class="legend__dot legend__dot--own" /><b>{{ summary.own }}</b> own records only</div>
        <div class="legend__row"><i class="legend__dot legend__dot--none" /><b>{{ summary.none }}</b> not visible at all</div>
      </div>

      <Transition name="fade" mode="out-in">
        <ul :key="role.key" class="facts">
          <template v-if="role.key === 'admin'">
            <li><AppIcon name="check" :size="14" /> Approves or declines every teacher sign-up</li>
            <li><AppIcon name="check" :size="14" /> Assigns students to teachers, one by one or in bulk</li>
            <li><AppIcon name="check" :size="14" /> Sees every register and every low-attendance flag</li>
          </template>
          <template v-else-if="role.key === 'teacher'">
            <li><AppIcon name="check" :size="14" /> Marks attendance and enters grades for their students</li>
            <li><AppIcon name="check" :size="14" /> Sets and checks assignments for their courses</li>
            <li><AppIcon name="x" :size="14" /> Cannot see other teachers’ students or manage accounts</li>
          </template>
          <template v-else>
            <li><AppIcon name="check" :size="14" /> Their own grades, attendance, timetable and homework</li>
            <li><AppIcon name="check" :size="14" /> Updates their own contact details and password</li>
            <li><AppIcon name="x" :size="14" /> Cannot see any other student, ever</li>
          </template>
        </ul>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.orbit { --tone: var(--primary); --tone-soft: var(--primary-soft); --tone-text: var(--primary-text); display: grid; grid-template-columns: 1.25fr 1fr; gap: var(--sp-10); align-items: center; }
.orbit--accent { --tone: var(--accent); --tone-soft: var(--accent-soft); --tone-text: var(--accent-text); }
.orbit--info { --tone: var(--info); --tone-soft: var(--info-soft); --tone-text: var(--info-text); }

.orbit__stage { position: relative; aspect-ratio: 1; max-width: 550px; width: 100%; margin: 0 auto; }
.orbit__halo { position: absolute; inset: 8%; border-radius: 50%; background: radial-gradient(circle at 50% 42%, color-mix(in srgb, var(--tone) 16%, transparent), transparent 68%); filter: blur(18px); transition: background var(--dur-slow); pointer-events: none; }
.orbit__lines { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.orbit__ring { fill: none; stroke: var(--line-strong); stroke-width: 0.3; opacity: 0.7; }
.orbit__ring--dash { stroke: var(--tone); stroke-dasharray: 0.6 2.4; stroke-width: 0.6; opacity: 0.7; transition: stroke var(--dur-slow); animation: spin-ring 40s linear infinite; transform-origin: 50% 50%; }
.orbit--paused .orbit__ring--dash { animation-play-state: paused; }
@keyframes spin-ring { to { transform: rotate(360deg); } }
.orbit__line { stroke-width: 0.3; transition: stroke var(--dur-slow), opacity var(--dur-slow); }
.orbit__line--full { stroke: var(--tone); opacity: 0.5; }
.orbit__line--own { stroke: var(--tone); opacity: 0.32; stroke-dasharray: 1.2 1.2; }
.orbit__line--none { stroke: var(--line-strong); opacity: 0.3; stroke-dasharray: 0.6 1.6; }

.node { position: absolute; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; gap: 4px; width: 120px; text-align: center; color: var(--text); transition: opacity var(--dur-slow), filter var(--dur-slow); }
.node__icon { width: 48px; height: 48px; border-radius: 16px; display: grid; place-items: center; background: var(--surface); border: 1.5px solid var(--line-strong); color: var(--text-2); box-shadow: var(--shadow-sm); transition: all var(--dur-slow) var(--ease-spring); }
.node__label { font-size: var(--text-xs); font-weight: 600; line-height: 1.2; }
.node__state { font-size: 10px; color: var(--text-3); transition: color var(--dur-slow); }
.node--full .node__icon { background: var(--tone); border-color: transparent; color: var(--on-primary); transform: scale(1.1) rotate(-4deg); box-shadow: 0 0 0 5px color-mix(in srgb, var(--tone) 16%, transparent), 0 12px 26px -8px color-mix(in srgb, var(--tone) 65%, transparent); }
.orbit--accent .node--full .node__icon { color: var(--ink-900); }
.node--full .node__state { color: var(--tone-text); font-weight: 600; }
.node--own .node__icon { background: var(--tone-soft); border-color: color-mix(in srgb, var(--tone) 45%, transparent); color: var(--tone-text); }
.node--own .node__state { color: var(--tone-text); }
.node--none { opacity: 0.4; }
.node--none .node__icon { border-style: dashed; background: transparent; }
.node:hover { opacity: 1; }
.node:hover .node__icon { transform: scale(1.14); }

.core { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 210px; height: 210px; border-radius: 50%; display: grid; place-items: center; text-align: center; }
.core__glow { position: absolute; inset: -6%; border-radius: 50%; background: conic-gradient(from 0deg, color-mix(in srgb, var(--tone) 60%, transparent), transparent 30%, color-mix(in srgb, var(--tone) 35%, transparent) 60%, transparent 85%); filter: blur(10px); opacity: 0.55; animation: spin-glow 8s linear infinite; transition: background var(--dur-slow); }
.orbit--paused .core__glow { animation-play-state: paused; }
@keyframes spin-glow { to { transform: rotate(360deg); } }
.core::after { content: ''; position: absolute; inset: 8px; border-radius: 50%; background: var(--surface); border: 1px solid var(--line); box-shadow: var(--shadow-md), inset 0 1px 0 rgba(255, 255, 255, 0.6); }
.core__count { position: absolute; inset: 8px; width: calc(100% - 16px); height: calc(100% - 16px); transform: rotate(-90deg); z-index: 1; pointer-events: none; }
.core__count-bg { fill: none; stroke: var(--surface-3); stroke-width: 2; }
.core__count-fill { fill: none; stroke: var(--tone); stroke-width: 2; stroke-linecap: round; stroke-dasharray: 295.3; stroke-dashoffset: 295.3; animation: countdown var(--cycle) linear forwards; transition: stroke var(--dur-slow); }
.orbit--paused .core__count-fill { animation-play-state: paused; }
@keyframes countdown { to { stroke-dashoffset: 0; } }
.core__inner { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 18px; }
.core__icon { width: 56px; height: 56px; border-radius: 18px; display: grid; place-items: center; background: var(--tone-soft); color: var(--tone-text); margin-bottom: 6px; box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--tone) 20%, transparent); transition: background var(--dur-slow), color var(--dur-slow); }
.core__title { font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 600; }
.core__line { font-size: 11px; color: var(--text-3); line-height: 1.3; max-width: 150px; }
.core-enter-active, .core-leave-active { transition: opacity var(--dur), transform var(--dur) var(--ease-out); }
.core-enter-from { opacity: 0; transform: scale(0.88) translateY(6px); }
.core-leave-to { opacity: 0; transform: scale(1.08); }

.orbit__side { display: flex; flex-direction: column; gap: var(--sp-6); }
.roles { display: flex; gap: var(--sp-2); padding: 5px; border-radius: var(--r-full); background: var(--surface-3); box-shadow: inset 0 1px 2px rgba(20, 24, 31, 0.05); }
.role { position: relative; flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 11px 12px; border-radius: var(--r-full); font-size: var(--text-sm); font-weight: 600; color: var(--text-2); transition: all var(--dur); }
.role:hover:not(.role--on) { color: var(--text); }
.role__icon { display: grid; place-items: center; }
.role--on { background: var(--surface); color: var(--text); box-shadow: var(--shadow-sm); }
.role--on.role--accent { color: var(--accent-text); }
.role--on.role--info { color: var(--info-text); }
.role--on.role--primary { color: var(--primary-text); }
.role__timer { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; }
.role__timer-bg { fill: none; stroke: none; }
.role__timer-fill { fill: none; stroke: var(--tone); stroke-width: 1.5; stroke-linecap: round; stroke-dasharray: 94.2; stroke-dashoffset: 94.2; opacity: 0; }

.legend { display: flex; flex-direction: column; gap: 10px; padding: var(--sp-5); border-radius: var(--r-lg); background: linear-gradient(160deg, color-mix(in srgb, var(--tone) 7%, var(--surface)), var(--surface)); border: 1px solid var(--line); font-size: var(--text-sm); color: var(--text-2); box-shadow: var(--shadow-xs); transition: background var(--dur-slow); }
.legend__row { display: flex; align-items: center; gap: 10px; }
.legend__row b { color: var(--text); font-family: var(--font-display); font-size: var(--text-xl); min-width: 20px; }
.legend__dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.legend__dot--full { background: var(--tone); box-shadow: 0 0 0 3px color-mix(in srgb, var(--tone) 18%, transparent); }
.legend__dot--own { background: var(--tone-soft); border: 1.5px solid var(--tone); }
.legend__dot--none { border: 1.5px dashed var(--line-strong); }
.facts { display: flex; flex-direction: column; gap: 11px; font-size: var(--text-sm); color: var(--text-2); }
.facts li { display: flex; gap: 10px; align-items: flex-start; line-height: 1.5; }
.facts li :deep(svg) { flex-shrink: 0; margin-top: 3px; color: var(--tone-text); }

@media (max-width: 960px) {
  .orbit { grid-template-columns: 1fr; gap: var(--sp-8); }
  .orbit__stage { max-width: 460px; }
  .node { width: 92px; }
  .node__label { font-size: 11px; }
  .node__state { display: none; }
  .node__icon { width: 42px; height: 42px; border-radius: 13px; }
  .core { width: 168px; height: 168px; }
  .core__line { display: none; }
  .core__title { font-size: var(--text-xl); }
}
@media (max-width: 480px) {
  .orbit__stage { max-width: 340px; }
  .node { width: 72px; }
  .node__icon { width: 36px; height: 36px; border-radius: 11px; }
  .core { width: 132px; height: 132px; }
  .core__icon { width: 42px; height: 42px; border-radius: 13px; }
  .core__title { font-size: var(--text-md); }
}
</style>
