<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AppIcon from '@/ui/AppIcon.vue'

type Tone = 'accent' | 'info' | 'primary'
interface Moment { key: string; time: string; hour: number; minute: number; role: string; tone: Tone; icon: string; title: string; text: string }

const MOMENTS: Moment[] = [
  { key: 'approve', time: '08:55', hour: 8, minute: 55, role: 'Admin', tone: 'accent', icon: 'user-check', title: 'A new teacher signed up overnight.', text: 'Their account is waiting, not active. The admin checks the name and department, and approves with one click — nobody sees student data by accident.' },
  { key: 'register', time: '09:05', hour: 9, minute: 5, role: 'Teacher', tone: 'info', icon: 'calendar', title: 'Register marked from the classroom.', text: 'Phone in hand, the teacher taps Present, Late or Absent for each student. Percentages update instantly; anyone under 75% is flagged for the admin.' },
  { key: 'marks', time: '12:30', hour: 12, minute: 30, role: 'Teacher', tone: 'info', icon: 'trending', title: 'Unit test marks go in.', text: 'Subject by subject, out of the maximum you set. Averages are worked out for you and appear on the student’s own dashboard the same minute.' },
  { key: 'overview', time: '16:00', hour: 16, minute: 0, role: 'Admin', tone: 'accent', icon: 'alert', title: 'The overview says who needs a word.', text: 'Every teacher’s register for the day, side by side, plus the short list of students slipping below the attendance line — before it becomes a problem.' },
  { key: 'home', time: '20:15', hour: 20, minute: 15, role: 'Student', tone: 'primary', icon: 'hat', title: 'Homework check, from home.', text: 'The student opens their dashboard: tomorrow’s classes, one pending assignment, this week’s attendance. No asking, no guessing.' },
]

const active = ref(0)
const list = ref<HTMLElement | null>(null)
let io: IntersectionObserver | null = null

const hourDeg = computed(() => { const m = MOMENTS[active.value]!; return (m.hour % 12) * 30 + m.minute * 0.5 })
const minuteDeg = computed(() => MOMENTS[active.value]!.minute * 6)
const isNight = computed(() => { const h = MOMENTS[active.value]!.hour; return h >= 18 || h < 7 })

onMounted(() => {
  if (!('IntersectionObserver' in window)) return
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) active.value = Number((e.target as HTMLElement).dataset.index)
      }
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
  )
  list.value?.querySelectorAll<HTMLElement>('.moment').forEach((el) => io?.observe(el))
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <div class="day">
    <div class="day__clock">
      <div class="clock" :class="{ 'clock--night': isNight }" :style="{ '--h': `${hourDeg}deg`, '--m': `${minuteDeg}deg` }">
        <svg viewBox="0 0 200 200" class="clock__face" aria-hidden="true">
          <circle cx="100" cy="100" r="96" class="clock__ring" />
          <g class="clock__ticks">
            <line v-for="n in 12" :key="n" x1="100" y1="12" x2="100" y2="22" :transform="`rotate(${n * 30} 100 100)`" />
          </g>
          <line x1="100" y1="100" x2="100" y2="52" class="clock__hand clock__hand--h" />
          <line x1="100" y1="100" x2="100" y2="34" class="clock__hand clock__hand--m" />
          <circle cx="100" cy="100" r="5" class="clock__pin" />
        </svg>
        <span class="clock__sky"><AppIcon :name="isNight ? 'moon' : 'sun'" :size="16" /></span>
        <Transition name="time" mode="out-in">
          <p :key="active" class="clock__time mono">{{ MOMENTS[active]!.time }}</p>
        </Transition>
        <p class="clock__role" :class="`clock__role--${MOMENTS[active]!.tone}`">{{ MOMENTS[active]!.role }}</p>
      </div>
      <ol class="dots">
        <li v-for="(m, i) in MOMENTS" :key="m.time" :class="{ 'is-on': i === active, 'is-past': i < active }" />
      </ol>
    </div>

    <ol ref="list" class="moments">
      <li
        v-for="(m, i) in MOMENTS"
        :key="m.time"
        :data-index="i"
        class="moment"
        :class="[`moment--${m.tone}`, { 'moment--on': i === active }]"
      >
        <div class="moment__card">
          <div class="moment__rail" />
          <div class="moment__body">
            <div class="moment__top">
              <span class="moment__icon"><AppIcon :name="m.icon" :size="18" /></span>
              <span class="moment__role">{{ m.role }}</span>
              <span class="moment__time mono">{{ m.time }}</span>
            </div>
            <h3 class="moment__title">{{ m.title }}</h3>
            <p class="moment__text">{{ m.text }}</p>
          </div>

          <div class="moment__vis" aria-hidden="true">
            <!-- APPROVE -->
            <div v-if="m.key === 'approve'" class="ui ui--approve">
              <div class="ui__row">
                <span class="ui__av">KM</span>
                <span class="ui__who">Karan Malhotra<small>Teacher · Computer Science</small></span>
              </div>
              <button type="button" class="ui__approve"><AppIcon name="check" :size="13" /> Approve</button>
            </div>

            <!-- REGISTER -->
            <div v-else-if="m.key === 'register'" class="ui ui--register">
              <div class="ui__pctrow"><span>Present today</span><b class="mono">96%</b></div>
              <div class="ui__bar"><i style="width: 96%" /></div>
              <ul class="ui__stats">
                <li class="ui__stat ui__stat--ok"><b>24</b>present</li>
                <li class="ui__stat ui__stat--warn"><b>1</b>late</li>
                <li class="ui__stat ui__stat--bad"><b>0</b>absent</li>
              </ul>
            </div>

            <!-- MARKS -->
            <div v-else-if="m.key === 'marks'" class="ui ui--marks">
              <p class="ui__label">Data Structures</p>
              <div class="ui__score"><span class="ui__num">84</span><span class="ui__max">/ 100</span></div>
              <div class="ui__bar"><i style="width: 84%" /></div>
              <p class="ui__note">Class average 78%</p>
            </div>

            <!-- OVERVIEW -->
            <div v-else-if="m.key === 'overview'" class="ui ui--flag">
              <p class="ui__label">Below the 75% line</p>
              <div class="ui__frow"><span class="ui__av">PD</span><span class="ui__fname">Priya Desai</span><span class="ui__pill ui__pill--warn">62%</span></div>
              <div class="ui__frow"><span class="ui__av">RI</span><span class="ui__fname">Rohan Iyer</span><span class="ui__pill ui__pill--warn">71%</span></div>
            </div>

            <!-- HOME -->
            <div v-else class="ui ui--home">
              <p class="ui__label">Tomorrow</p>
              <div class="ui__crow"><b class="mono">09:00</b><span>Data Structures</span><small>Lab 2</small></div>
              <div class="ui__crow"><b class="mono">11:00</b><span>Mathematics III</span><small>B-104</small></div>
              <span class="ui__pill ui__pill--due"><AppIcon name="edit" :size="11" /> 1 assignment due Friday</span>
            </div>
          </div>
        </div>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.day { display: grid; grid-template-columns: 300px 1fr; gap: var(--sp-12); align-items: start; }
.day__clock { position: sticky; top: 110px; display: flex; flex-direction: column; align-items: center; gap: var(--sp-6); }

.clock { position: relative; width: 240px; height: 240px; }
.clock__face { width: 100%; height: 100%; }
.clock__ring { fill: var(--surface); stroke: var(--line-strong); stroke-width: 2; transition: fill var(--dur-slow); }
.clock--night .clock__ring { fill: var(--pine-900); }
.clock__ticks line { stroke: var(--text-3); stroke-width: 2; stroke-linecap: round; }
.clock--night .clock__ticks line { stroke: rgba(255, 255, 255, 0.45); }
.clock__hand { stroke: var(--text); stroke-width: 5; stroke-linecap: round; transform-origin: 100px 100px; transition: transform 1100ms var(--ease-spring), stroke var(--dur-slow); }
.clock__hand--h { transform: rotate(var(--h)); }
.clock__hand--m { stroke-width: 3; stroke: var(--primary); transform: rotate(var(--m)); }
.clock--night .clock__hand { stroke: #fff; }
.clock--night .clock__hand--m { stroke: var(--accent); }
.clock__pin { fill: var(--accent); }
.clock__sky { position: absolute; top: 14px; right: 14px; width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; background: var(--accent-soft); color: var(--accent-text); box-shadow: var(--shadow-sm); }
.clock--night .clock__sky { background: var(--info-soft); color: var(--info-text); }
.clock__time { position: absolute; left: 50%; top: 58%; transform: translateX(-50%); font-size: var(--text-2xl); font-weight: 600; color: var(--text); }
.clock--night .clock__time { color: #fff; }
.clock__role { position: absolute; left: 50%; top: 78%; transform: translateX(-50%); font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; padding: 3px 10px; border-radius: var(--r-full); }
.clock__role--accent { background: var(--accent-soft); color: var(--accent-text); }
.clock__role--info { background: var(--info-soft); color: var(--info-text); }
.clock__role--primary { background: var(--primary-soft); color: var(--primary-text); }
.time-enter-active, .time-leave-active { transition: opacity var(--dur), transform var(--dur) var(--ease-out); }
.time-enter-from { opacity: 0; transform: translate(-50%, 8px); }
.time-leave-to { opacity: 0; transform: translate(-50%, -8px); }

.dots { display: flex; gap: 8px; }
.dots li { width: 8px; height: 8px; border-radius: 50%; background: var(--line-strong); transition: all var(--dur-slow) var(--ease); }
.dots li.is-past { background: var(--primary); opacity: 0.4; }
.dots li.is-on { background: var(--primary); width: 26px; border-radius: 4px; }

/* ---- moments (right side) ---- */
.moments { position: relative; display: flex; flex-direction: column; gap: var(--sp-8); padding-left: 44px; }
.moments::before { content: ''; position: absolute; left: 11px; top: 24px; bottom: 24px; width: 2px; background: var(--line-strong); }
.moment { --tone: var(--primary); --tone-soft: var(--primary-soft); --tone-text: var(--primary-text); position: relative; }
.moment--accent { --tone: var(--accent); --tone-soft: var(--accent-soft); --tone-text: var(--accent-text); }
.moment--info { --tone: var(--info); --tone-soft: var(--info-soft); --tone-text: var(--info-text); }
.moment::before { content: ''; position: absolute; left: -39px; top: 26px; width: 14px; height: 14px; border-radius: 50%; background: var(--bg); border: 3px solid var(--line-strong); transition: all var(--dur-slow) var(--ease-spring); z-index: 1; }
.moment--on::before { border-color: var(--tone); background: var(--tone); box-shadow: 0 0 0 6px var(--tone-soft); transform: scale(1.2); }
.moment--info.moment--on::before, .moment--accent.moment--on::before { box-shadow: 0 0 0 6px var(--tone-soft); }

.moment__card { position: relative; display: grid; grid-template-columns: 1.35fr 1fr; gap: var(--sp-5); align-items: center; padding: var(--sp-5) var(--sp-6) var(--sp-5) var(--sp-6); border-radius: var(--r-xl); background: var(--surface); border: 1px solid var(--line); overflow: hidden; opacity: 0.5; transform: scale(0.985); transition: opacity var(--dur-slow) var(--ease), transform var(--dur-slow) var(--ease-out), box-shadow var(--dur-slow), border-color var(--dur-slow); }
.moment--on .moment__card { opacity: 1; transform: none; box-shadow: var(--shadow-md); border-color: color-mix(in srgb, var(--tone) 28%, var(--line)); }
.moment__rail { position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--tone); opacity: 0; transition: opacity var(--dur-slow); }
.moment--on .moment__rail { opacity: 1; }

.moment__body { min-width: 0; }
.moment__top { display: flex; align-items: center; gap: var(--sp-3); margin-bottom: var(--sp-3); }
.moment__icon { width: 38px; height: 38px; border-radius: 12px; display: grid; place-items: center; background: var(--tone-soft); color: var(--tone-text); flex-shrink: 0; }
.moment__role { font-size: var(--text-xs); font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--tone-text); }
.moment__time { margin-left: auto; font-size: var(--text-xs); color: var(--text-3); }
.moment__title { font-size: var(--text-lg); margin-bottom: var(--sp-2); line-height: 1.25; }
.moment__text { color: var(--text-2); line-height: 1.6; font-size: var(--text-sm); }

/* ---- mini UI previews ---- */
.moment__vis { display: flex; align-items: center; justify-content: center; }
.ui { width: 100%; padding: var(--sp-4); border-radius: var(--r-lg); background: linear-gradient(160deg, color-mix(in srgb, var(--tone) 8%, var(--surface-2)), var(--surface-2)); border: 1px solid var(--line); box-shadow: var(--shadow-xs); font-size: var(--text-xs); }
.ui__label { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-3); margin-bottom: 10px; }
.ui__av { width: 30px; height: 30px; border-radius: 40%; display: grid; place-items: center; background: var(--tone-soft); color: var(--tone-text); font-family: var(--font-display); font-weight: 600; font-size: 11px; flex-shrink: 0; }
.ui__pill { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: var(--r-full); font-size: 11px; font-weight: 700; }
.ui__pill--warn { background: var(--danger-soft); color: var(--danger-text); }
.ui__pill--due { background: var(--tone-soft); color: var(--tone-text); margin-top: 10px; }

/* approve */
.ui--approve { display: flex; flex-direction: column; gap: 12px; }
.ui__row { display: flex; align-items: center; gap: 10px; }
.ui__who { display: flex; flex-direction: column; font-weight: 600; line-height: 1.2; color: var(--text); }
.ui__who small { font-weight: 400; color: var(--text-3); font-size: 10px; }
.ui__approve { align-self: flex-start; display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--r-md); background: var(--tone); color: var(--ink-900); font-weight: 700; font-size: 11px; box-shadow: 0 6px 16px -6px color-mix(in srgb, var(--tone) 70%, transparent); }

/* register / marks shared bar */
.ui__bar { height: 8px; border-radius: 999px; background: var(--surface-3); overflow: hidden; }
.ui__bar i { display: block; height: 100%; border-radius: 999px; background: var(--tone); }
.ui--register .ui__pctrow { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; color: var(--text-2); }
.ui--register .ui__pctrow b { font-family: var(--font-display); font-size: var(--text-lg); color: var(--text); }
.ui__stats { display: flex; gap: 6px; margin-top: 12px; }
.ui__stat { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 8px 4px; border-radius: var(--r-sm); background: var(--surface); border: 1px solid var(--line); font-size: 10px; color: var(--text-3); }
.ui__stat b { font-family: var(--font-display); font-size: var(--text-md); }
.ui__stat--ok b { color: var(--success-text); }
.ui__stat--warn b { color: var(--accent-text); }
.ui__stat--bad b { color: var(--danger-text); }

/* marks */
.ui--marks .ui__score { display: flex; align-items: baseline; gap: 6px; margin-bottom: 10px; }
.ui__num { font-family: var(--font-display); font-size: var(--text-3xl); font-weight: 600; color: var(--tone-text); line-height: 1; }
.ui__max { color: var(--text-3); font-size: var(--text-sm); }
.ui__note { margin-top: 8px; color: var(--text-3); font-size: 11px; }

/* overview flags */
.ui--flag { display: flex; flex-direction: column; gap: 8px; }
.ui__frow { display: flex; align-items: center; gap: 8px; padding: 7px 8px; border-radius: var(--r-sm); background: var(--surface); border: 1px solid var(--line); }
.ui__fname { flex: 1; font-weight: 600; color: var(--text); }

/* home */
.ui--home { display: flex; flex-direction: column; }
.ui__crow { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid var(--line); }
.ui__crow:last-of-type { border-bottom: 0; }
.ui__crow b { color: var(--text-2); }
.ui__crow span { flex: 1; font-weight: 600; color: var(--text); }
.ui__crow small { color: var(--text-3); }

@media (max-width: 960px) {
  .day { grid-template-columns: 1fr; gap: var(--sp-8); }
  .day__clock { position: static; }
  .clock { width: 190px; height: 190px; }
  .clock__time { font-size: var(--text-xl); }
  .moments { padding-left: 34px; gap: var(--sp-6); }
  .moments::before { left: 9px; }
  .moment::before { left: -30px; }
  .moment__card { grid-template-columns: 1fr; opacity: 1; transform: none; }
}
@media (max-width: 560px) {
  .moment__card { padding: var(--sp-5); }
}
</style>
