<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AppIcon from '@/ui/AppIcon.vue'

type Tone = 'accent' | 'info' | 'primary'
interface Feature { key: string; tone: Tone; icon: string; title: string; line: string; badge?: string; window: string }

const FEATURES: Feature[] = [
  { key: 'approve', tone: 'accent', icon: 'user-check', title: 'Approve before access', line: 'New teachers see nothing until you say yes.', window: 'Pending approvals' },
  { key: 'scoped', tone: 'primary', icon: 'shield', title: 'Scoped by design', line: 'Everyone sees only their slice of the campus.', window: 'Who sees what' },
  { key: 'attendance', tone: 'info', icon: 'calendar', title: 'Attendance that warns you', line: 'Marked in class, flagged the same second.', badge: 'Live', window: 'Today’s register' },
  { key: 'timetable', tone: 'accent', icon: 'clock', title: 'A timetable that says no', line: 'Clashes are refused before they happen.', window: 'Monday · timetable' },
  { key: 'assignments', tone: 'info', icon: 'edit', title: 'Assignments & submissions', line: 'Who has turned it in, at a glance.', window: 'Linked list · due Fri' },
  { key: 'find', tone: 'primary', icon: 'search', title: 'Find anyone, export anything', line: 'Search, filter, and export to CSV in a click.', window: 'Students' },
]

const CYCLE = 4000
const active = ref(0)
const hovering = ref(false)
const feat = computed(() => FEATURES[active.value]!)
const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
let timer: number | undefined

const startCycle = () => {
  if (timer) window.clearInterval(timer)
  if (reduce) return
  timer = window.setInterval(() => { if (!hovering.value) active.value = (active.value + 1) % FEATURES.length }, CYCLE)
}
const pick = (i: number) => { active.value = i; startCycle() }
onMounted(startCycle)
onBeforeUnmount(() => { if (timer) window.clearInterval(timer) })
</script>

<template>
  <div
    class="show"
    :class="[`show--${feat.tone}`, { 'show--paused': hovering || reduce }]"
    :style="{ '--cycle': `${CYCLE}ms` }"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
  >
    <!-- left: selectable feature list -->
    <ul class="list" role="tablist">
      <li v-for="(f, i) in FEATURES" :key="f.key">
        <button type="button" role="tab" :aria-selected="active === i" class="feat" :class="[`feat--${f.tone}`, { 'feat--on': active === i }]" @click="pick(i)">
          <span class="feat__icon"><AppIcon :name="f.icon" :size="18" /></span>
          <span class="feat__text">
            <b>{{ f.title }} <em v-if="f.badge" class="feat__badge">{{ f.badge }}</em></b>
            <small>{{ f.line }}</small>
          </span>
          <AppIcon name="arrow-right" :size="16" class="feat__chev" />
          <span v-if="active === i && !reduce" class="feat__timer" :key="active" />
        </button>
      </li>
    </ul>

    <!-- right: app-window preview -->
    <div class="pane">
      <div class="win">
        <div class="win__bar">
          <span class="win__dots"><i /><i /><i /></span>
          <Transition name="lbl" mode="out-in"><span :key="feat.key" class="win__title">{{ feat.window }}</span></Transition>
          <span class="win__tone" />
        </div>
        <Transition name="pv" mode="out-in">
          <div :key="feat.key" class="win__body">
            <!-- APPROVE -->
            <template v-if="feat.key === 'approve'">
              <p class="pv__label">2 teachers waiting</p>
              <div class="pv__prow">
                <span class="pv__av">KM</span>
                <span class="pv__who">Karan Malhotra<small>Teacher · Computer Science</small></span>
                <button type="button" class="pv__x"><AppIcon name="x" :size="13" /></button>
                <button type="button" class="pv__ok"><AppIcon name="check" :size="12" /> Approve</button>
              </div>
              <div class="pv__prow">
                <span class="pv__av">SN</span>
                <span class="pv__who">Sana Nair<small>Teacher · Mathematics</small></span>
                <button type="button" class="pv__x"><AppIcon name="x" :size="13" /></button>
                <button type="button" class="pv__ok"><AppIcon name="check" :size="12" /> Approve</button>
              </div>
            </template>

            <!-- SCOPED -->
            <template v-else-if="feat.key === 'scoped'">
              <div class="pv__scope pv__scope--a"><span class="pv__sic"><AppIcon name="shield" :size="15" /></span><b>Admin</b><span class="pv__stag">The whole campus</span></div>
              <div class="pv__scope pv__scope--i"><span class="pv__sic"><AppIcon name="book" :size="15" /></span><b>Teacher</b><span class="pv__stag">Only their students</span></div>
              <div class="pv__scope pv__scope--p"><span class="pv__sic"><AppIcon name="hat" :size="15" /></span><b>Student</b><span class="pv__stag">Only themselves</span></div>
            </template>

            <!-- ATTENDANCE -->
            <template v-else-if="feat.key === 'attendance'">
              <div class="pv__attgrid">
                <div class="pv__big"><b class="mono">91%</b><small>present today</small></div>
                <ul class="pv__chips">
                  <li class="pv__chip pv__chip--ok"><b>24</b> present</li>
                  <li class="pv__chip pv__chip--warn"><b>1</b> late</li>
                  <li class="pv__chip pv__chip--bad"><b>2</b> absent</li>
                </ul>
              </div>
              <div class="pv__flag"><span class="pv__av">PD</span><span class="pv__who">Priya Desai</span><span class="pv__low">62% · flagged</span></div>
            </template>

            <!-- TIMETABLE -->
            <template v-else-if="feat.key === 'timetable'">
              <p class="pv__label">Adding Mon 9–10</p>
              <div class="pv__slot">09:00–10:00 · Data Structures <small>Lab 2</small></div>
              <div class="pv__slot pv__slot--x"><AppIcon name="x" :size="13" /> Blocked — Karan already teaches then</div>
            </template>

            <!-- ASSIGNMENTS -->
            <template v-else-if="feat.key === 'assignments'">
              <div class="pv__asrow"><span>Submitted</span><b class="mono">18 / 24</b></div>
              <div class="pv__bar"><i style="width: 75%" /></div>
              <div class="pv__srow"><span class="pv__av">NS</span><span class="pv__who">Neha Sharma</span><span class="pv__tick pv__tick--ok"><AppIcon name="check" :size="11" /> Checked</span></div>
              <div class="pv__srow"><span class="pv__av">RI</span><span class="pv__who">Rohan Iyer</span><span class="pv__tick">Submitted</span></div>
              <div class="pv__srow"><span class="pv__av">SK</span><span class="pv__who">Simran Kaur</span><span class="pv__tick pv__tick--pend">Pending</span></div>
            </template>

            <!-- FIND -->
            <template v-else>
              <div class="pv__search"><AppIcon name="search" :size="14" /> Search name, roll or email…</div>
              <div class="pv__res"><span class="pv__av">NS</span><span class="pv__who">Neha Sharma<small>STU-2026-0001</small></span></div>
              <div class="pv__res"><span class="pv__av">RI</span><span class="pv__who">Rohan Iyer<small>STU-2026-0003</small></span></div>
              <div class="pv__foot"><span class="pv__filters"><span>Course</span><span>Year</span><span>Unassigned</span></span><button type="button" class="pv__export"><AppIcon name="arrow-right" :size="12" /> CSV</button></div>
            </template>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.show { --tone: var(--primary); --tone-soft: var(--primary-soft); --tone-text: var(--primary-text); display: grid; grid-template-columns: 0.92fr 1.08fr; gap: var(--sp-8); align-items: center; }
.show--accent { --tone: var(--accent); --tone-soft: var(--accent-soft); --tone-text: var(--accent-text); }
.show--info { --tone: var(--info); --tone-soft: var(--info-soft); --tone-text: var(--info-text); }

/* left list */
.list { display: flex; flex-direction: column; gap: 8px; }
.feat { position: relative; width: 100%; display: flex; align-items: center; gap: var(--sp-3); padding: var(--sp-4); border-radius: var(--r-lg); text-align: left; color: var(--text); border: 1px solid transparent; transition: background var(--dur), border-color var(--dur), transform var(--dur); overflow: hidden; }
.feat--accent { --tone: var(--accent); --tone-soft: var(--accent-soft); --tone-text: var(--accent-text); }
.feat--info { --tone: var(--info); --tone-soft: var(--info-soft); --tone-text: var(--info-text); }
.feat--primary { --tone: var(--primary); --tone-soft: var(--primary-soft); --tone-text: var(--primary-text); }
.feat:hover { background: var(--surface-2); }
.feat--on { background: var(--surface); border-color: color-mix(in srgb, var(--tone) 30%, var(--line)); box-shadow: var(--shadow-sm); transform: translateX(4px); }
.feat__icon { width: 42px; height: 42px; border-radius: 13px; display: grid; place-items: center; background: var(--surface-3); color: var(--text-3); flex-shrink: 0; transition: all var(--dur) var(--ease-spring); }
.feat--on .feat__icon { background: var(--tone); color: var(--on-primary); transform: rotate(-6deg) scale(1.05); }
.feat--on.feat--accent .feat__icon { color: var(--ink-900); }
.feat__text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.feat__text b { font-size: var(--text-md); font-weight: 600; display: flex; align-items: center; gap: 8px; }
.feat__badge { font-style: normal; font-size: 9px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 2px 7px; border-radius: var(--r-full); background: var(--tone-soft); color: var(--tone-text); }
.feat__text small { font-size: var(--text-xs); color: var(--text-3); }
.feat__chev { color: var(--text-3); opacity: 0; transform: translateX(-6px); transition: all var(--dur); flex-shrink: 0; }
.feat--on .feat__chev { opacity: 1; transform: none; color: var(--tone-text); }
.feat__timer { position: absolute; left: 0; bottom: 0; height: 3px; width: 100%; transform-origin: left; background: var(--tone); animation: feat-timer var(--cycle) linear forwards; }
.show--paused .feat__timer { animation-play-state: paused; }
@keyframes feat-timer { from { transform: scaleX(0); } to { transform: scaleX(1); } }

/* right app window */
.pane { position: relative; }
.pane::before { content: ''; position: absolute; inset: -8% -6%; border-radius: var(--r-xl); background: radial-gradient(circle at 60% 40%, color-mix(in srgb, var(--tone) 16%, transparent), transparent 70%); filter: blur(20px); transition: background var(--dur-slow); z-index: 0; }
.win { position: relative; z-index: 1; border-radius: var(--r-xl); background: var(--surface); border: 1px solid var(--line); box-shadow: var(--shadow-lg); overflow: hidden; }
.win__bar { display: flex; align-items: center; gap: 10px; padding: 12px var(--sp-4); border-bottom: 1px solid var(--line); background: var(--surface-2); }
.win__dots { display: flex; gap: 6px; }
.win__dots i { width: 10px; height: 10px; border-radius: 50%; background: var(--line-strong); }
.win__dots i:first-child { background: #e0645c; } .win__dots i:nth-child(2) { background: #e6b34a; } .win__dots i:nth-child(3) { background: #7aa06f; }
.win__title { flex: 1; text-align: center; font-size: var(--text-xs); font-weight: 600; color: var(--text-2); }
.win__tone { width: 40px; height: 6px; border-radius: 999px; background: var(--tone); opacity: 0.8; transition: background var(--dur-slow); }
.win__body { padding: var(--sp-5); min-height: 250px; display: flex; flex-direction: column; gap: 10px; font-size: var(--text-sm); }
.lbl-enter-active, .lbl-leave-active { transition: opacity var(--dur); }
.lbl-enter-from, .lbl-leave-to { opacity: 0; }
.pv-enter-active, .pv-leave-active { transition: opacity var(--dur), transform var(--dur) var(--ease-out); }
.pv-enter-from { opacity: 0; transform: translateY(10px); }
.pv-leave-to { opacity: 0; transform: translateY(-8px); }

/* preview shared bits */
.pv__label { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-3); }
.pv__av { width: 32px; height: 32px; border-radius: 40%; display: grid; place-items: center; background: var(--tone-soft); color: var(--tone-text); font-family: var(--font-display); font-weight: 600; font-size: 11px; flex-shrink: 0; }
.pv__who { flex: 1; min-width: 0; display: flex; flex-direction: column; font-weight: 600; color: var(--text); line-height: 1.2; }
.pv__who small { font-weight: 400; color: var(--text-3); font-size: 10px; }

/* approve */
.pv__prow { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: var(--r-md); background: var(--surface-2); border: 1px solid var(--line); }
.pv__x { width: 30px; height: 30px; border-radius: var(--r-sm); display: grid; place-items: center; color: var(--text-3); border: 1px solid var(--line-strong); }
.pv__ok { display: inline-flex; align-items: center; gap: 5px; padding: 7px 12px; border-radius: var(--r-sm); background: var(--tone); color: var(--ink-900); font-weight: 700; font-size: 11px; }

/* scoped */
.pv__scope { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: var(--r-md); border: 1px solid var(--line); font-weight: 600; }
.pv__sic { width: 30px; height: 30px; border-radius: 9px; display: grid; place-items: center; }
.pv__stag { margin-left: auto; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: var(--r-full); }
.pv__scope--a { background: color-mix(in srgb, var(--accent) 8%, var(--surface)); } .pv__scope--a .pv__sic { background: var(--accent-soft); color: var(--accent-text); } .pv__scope--a .pv__stag { background: var(--accent-soft); color: var(--accent-text); }
.pv__scope--i { background: color-mix(in srgb, var(--info) 8%, var(--surface)); } .pv__scope--i .pv__sic { background: var(--info-soft); color: var(--info-text); } .pv__scope--i .pv__stag { background: var(--info-soft); color: var(--info-text); }
.pv__scope--p { background: color-mix(in srgb, var(--primary) 8%, var(--surface)); } .pv__scope--p .pv__sic { background: var(--primary-soft); color: var(--primary-text); } .pv__scope--p .pv__stag { background: var(--primary-soft); color: var(--primary-text); }

/* attendance */
.pv__attgrid { display: flex; align-items: center; gap: var(--sp-4); }
.pv__big { display: flex; flex-direction: column; }
.pv__big b { font-family: var(--font-display); font-size: 2.6rem; font-weight: 600; color: var(--tone-text); line-height: 1; }
.pv__big small { font-size: 11px; color: var(--text-3); }
.pv__chips { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.pv__chip { display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-radius: var(--r-sm); background: var(--surface-2); border: 1px solid var(--line); font-size: 11px; color: var(--text-2); }
.pv__chip b { font-family: var(--font-display); }
.pv__chip--ok b { color: var(--success-text); } .pv__chip--warn b { color: var(--accent-text); } .pv__chip--bad b { color: var(--danger-text); }
.pv__flag { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: var(--r-md); background: var(--danger-soft); }
.pv__flag .pv__av { background: var(--surface); color: var(--danger-text); }
.pv__low { color: var(--danger-text); font-weight: 700; font-size: 11px; }

/* timetable */
.pv__slot { padding: 12px 14px; border-radius: var(--r-md); background: var(--surface-2); border: 1px solid var(--line); font-weight: 600; color: var(--text-2); }
.pv__slot small { color: var(--text-3); font-weight: 400; margin-left: 6px; }
.pv__slot--x { display: flex; align-items: center; gap: 8px; background: var(--danger-soft); border-color: transparent; color: var(--danger-text); }

/* assignments */
.pv__asrow { display: flex; justify-content: space-between; align-items: baseline; color: var(--text-2); }
.pv__asrow b { font-family: var(--font-display); font-size: var(--text-lg); color: var(--text); }
.pv__bar { height: 8px; border-radius: 999px; background: var(--surface-3); overflow: hidden; margin-bottom: 4px; }
.pv__bar i { display: block; height: 100%; border-radius: 999px; background: var(--tone); }
.pv__srow { display: flex; align-items: center; gap: 10px; }
.pv__tick { margin-left: auto; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: var(--r-full); background: var(--surface-3); color: var(--text-3); }
.pv__tick--ok { background: var(--success-soft); color: var(--success-text); }
.pv__tick--pend { background: var(--accent-soft); color: var(--accent-text); }

/* find */
.pv__search { display: flex; align-items: center; gap: 8px; padding: 11px 14px; border-radius: var(--r-md); background: var(--surface-2); border: 1px solid var(--line); color: var(--text-3); }
.pv__res { display: flex; align-items: center; gap: 10px; padding: 6px 2px; }
.pv__foot { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
.pv__filters { flex: 1; display: flex; gap: 6px; }
.pv__filters span { padding: 4px 11px; border-radius: var(--r-full); border: 1px solid var(--line-strong); color: var(--text-3); font-size: 11px; font-weight: 600; }
.pv__export { display: inline-flex; align-items: center; gap: 5px; padding: 7px 12px; border-radius: var(--r-sm); background: var(--tone); color: var(--on-primary); font-weight: 700; font-size: 11px; }
.show--accent .pv__export, .show--accent .pv__ok { color: var(--ink-900); }

@media (max-width: 900px) {
  .show { grid-template-columns: 1fr; gap: var(--sp-6); }
  .feat__chev { display: none; }
  .feat--on { transform: none; }
  .win__body { min-height: 210px; }
}
@media (max-width: 560px) {
  .feat__text small { display: none; }
  .feat { padding: 12px; }
  .pv__attgrid { flex-direction: column; align-items: stretch; }
}
</style>
