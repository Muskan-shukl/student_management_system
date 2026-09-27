<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/ui/AppIcon.vue'

type Tone = 'accent' | 'info' | 'primary'
interface Role { key: string; tone: Tone; icon: string; title: string; tagline: string; points: string[] }
const ROLES: Role[] = [
  { key: 'admin', tone: 'accent', icon: 'shield', title: 'Administrator', tagline: 'Runs the system.', points: ['Approve or decline teacher sign-ups', 'Create staff accounts, change roles, disable access', 'Full student records and teacher assignments', 'Campus-wide numbers at a glance'] },
  { key: 'teacher', tone: 'info', icon: 'book', title: 'Teacher', tagline: 'Works with students.', points: ['Sees only the students assigned to them', 'Records grades subject by subject', 'Tracks attendance, flags anyone under 75%', 'Leaves remarks students can read'] },
  { key: 'student', tone: 'primary', icon: 'hat', title: 'Student', tagline: 'Sees what matters.', points: ['One dashboard: grades, attendance, teacher', 'Best subject and average, always current', 'Keeps their own contact details up to date', 'Changes their own password'] },
]
const active = ref(0)
</script>

<template>
  <div class="rs">
    <div class="rs__tabs" role="tablist">
      <button v-for="(r, i) in ROLES" :key="r.key" type="button" role="tab" :aria-selected="active === i" class="tab" :class="[`tab--${r.tone}`, { 'tab--on': active === i }]" @click="active = i">
        <span class="tab__icon"><AppIcon :name="r.icon" :size="18" /></span>
        <span class="tab__text"><strong>{{ r.title }}</strong><small>{{ r.tagline }}</small></span>
        <AppIcon name="chevron-right" :size="16" class="tab__chev" />
      </button>
    </div>

    <div class="rs__panel" :class="`rs__panel--${ROLES[active]!.tone}`">
      <Transition name="swap" mode="out-in">
        <div :key="active" class="panel">
          <ul class="panel__points">
            <li v-for="(p, i) in ROLES[active]!.points" :key="p" :style="{ '--i': i }"><AppIcon name="check" :size="15" /><span>{{ p }}</span></li>
          </ul>

          <!-- role-specific miniature -->
          <div class="mini">
            <template v-if="active === 0">
              <p class="mini__t">Pending approvals</p>
              <div v-for="(n, i) in ['Rajat Verma', 'Neha Iyer']" :key="n" class="mini__row" :style="{ '--i': i }">
                <span class="mini__av">{{ n.split(' ').map((w) => w[0]).join('') }}</span>
                <span class="mini__name">{{ n }}<small>Teacher · Computer Science</small></span>
                <span class="mini__btn mini__btn--ok"><AppIcon name="check" :size="12" /> Approve</span>
              </div>
              <p class="mini__t mini__t--mt">Students by course</p>
              <div v-for="(c, i) in [['B.Tech CSE', 68], ['BCA', 44], ['MCA', 22]]" :key="String(c[0])" class="mini__bar" :style="{ '--i': i + 2, '--w': `${c[1]}%` }"><span>{{ c[0] }}</span><i /><b>{{ c[1] }}</b></div>
            </template>
            <template v-else-if="active === 1">
              <p class="mini__t">Needs attention · attendance &lt; 75%</p>
              <div v-for="(s, i) in [['Arpita Singh', 62], ['Varun Mehta', 71]]" :key="String(s[0])" class="mini__row" :style="{ '--i': i }">
                <span class="mini__av">{{ String(s[0]).split(' ').map((w) => w[0]).join('') }}</span>
                <span class="mini__name">{{ s[0] }}<small>{{ s[1] }}% present</small></span>
                <span class="mini__pill mini__pill--warn">Low</span>
              </div>
              <p class="mini__t mini__t--mt">Grade entry</p>
              <div class="mini__grade" style="--i: 2"><span>Data Structures</span><span class="mini__input">84</span><span class="mini__slash">/ 100</span></div>
              <div class="mini__grade" style="--i: 3"><span>Operating Systems</span><span class="mini__input mini__input--typing">7<i /></span><span class="mini__slash">/ 100</span></div>
            </template>
            <template v-else>
              <div class="idcard" style="--i: 0">
                <div class="idcard__top"><span>STUDENT ID</span><span class="mini__pill mini__pill--ok">Active</span></div>
                <p class="idcard__roll">STU-2026-0001</p>
                <p class="idcard__course">B.Tech CSE · 2nd year</p>
                <div class="idcard__foot"><span class="mini__av mini__av--light">RV</span><span>Rajat Verma<small>Your teacher</small></span></div>
              </div>
              <div class="mini__kpis" style="--i: 1">
                <div><small>Average</small><strong>81%</strong></div>
                <div><small>Attendance</small><strong>88%</strong></div>
                <div><small>Best</small><strong>Maths III</strong></div>
              </div>
            </template>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.rs { display: grid; grid-template-columns: 360px 1fr; gap: var(--sp-6); align-items: stretch; }
.rs__tabs { display: flex; flex-direction: column; gap: var(--sp-3); }
.tab { --tone: var(--primary); --tone-soft: var(--primary-soft); --tone-text: var(--primary-text); display: flex; align-items: center; gap: var(--sp-3); padding: var(--sp-4) var(--sp-5); text-align: left; background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-lg); transition: all var(--dur) var(--ease); position: relative; overflow: hidden; }
.tab--accent { --tone: var(--accent); --tone-soft: var(--accent-soft); --tone-text: var(--accent-text); }
.tab--info { --tone: var(--info); --tone-soft: var(--info-soft); --tone-text: var(--info-text); }
.tab::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--tone); transform: scaleY(0); transition: transform var(--dur) var(--ease-spring); }
.tab:hover { border-color: var(--line-strong); transform: translateX(4px); }
.tab--on { border-color: var(--tone); box-shadow: var(--shadow-sm); transform: translateX(6px); }
.tab--on::before { transform: scaleY(1); }
.tab__icon { width: 44px; height: 44px; border-radius: 13px; display: grid; place-items: center; background: var(--tone-soft); color: var(--tone-text); flex-shrink: 0; transition: transform var(--dur) var(--ease-spring); }
.tab--on .tab__icon { transform: rotate(-8deg) scale(1.06); }
.tab__text { display: flex; flex-direction: column; flex: 1; }
.tab__text strong { font-family: var(--font-display); font-size: var(--text-lg); font-weight: 600; }
.tab__text small { color: var(--text-3); font-size: var(--text-sm); }
.tab__chev { color: var(--text-3); opacity: 0; transform: translateX(-6px); transition: all var(--dur); }
.tab--on .tab__chev { opacity: 1; transform: none; color: var(--tone-text); }

.rs__panel { --tone: var(--primary); --tone-soft: var(--primary-soft); --tone-text: var(--primary-text); position: relative; border-radius: var(--r-xl); border: 1px solid var(--line); background: var(--surface); padding: var(--sp-6); overflow: hidden; transition: background var(--dur); min-height: 380px; }
.rs__panel--accent { --tone: var(--accent); --tone-soft: var(--accent-soft); --tone-text: var(--accent-text); }
.rs__panel--info { --tone: var(--info); --tone-soft: var(--info-soft); --tone-text: var(--info-text); }
.rs__panel::after { content: ''; position: absolute; right: -120px; bottom: -160px; width: 360px; height: 360px; border-radius: 50%; background: var(--tone-soft); opacity: 0.7; transition: background var(--dur-slow); pointer-events: none; }
.panel { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-6); align-items: start; }
.panel__points { display: flex; flex-direction: column; gap: var(--sp-3); }
.panel__points li { display: flex; gap: var(--sp-2); align-items: flex-start; font-size: var(--text-md); color: var(--text-2); line-height: 1.5; animation: fade-up var(--dur-slow) var(--ease-out) both; animation-delay: calc(var(--i) * 70ms); }
.panel__points svg { color: var(--tone-text); margin-top: 4px; flex-shrink: 0; }

.mini { background: var(--bg); border: 1px solid var(--line); border-radius: var(--r-lg); padding: var(--sp-4); box-shadow: var(--shadow-sm); font-size: var(--text-sm); }
.mini > * { animation: fade-up var(--dur-slow) var(--ease-out) both; animation-delay: calc(var(--i, 0) * 90ms + 120ms); }
.mini__t { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-3); margin-bottom: var(--sp-2); }
.mini__t--mt { margin-top: var(--sp-4); }
.mini__row { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: var(--r-md); background: var(--surface); margin-bottom: 6px; }
.mini__av { width: 30px; height: 30px; border-radius: 40%; display: grid; place-items: center; font-family: var(--font-display); font-weight: 600; font-size: 11px; background: var(--tone-soft); color: var(--tone-text); flex-shrink: 0; }
.mini__av--light { background: rgba(255, 255, 255, 0.2); color: #fff; }
.mini__name { flex: 1; display: flex; flex-direction: column; font-weight: 600; line-height: 1.2; }
.mini__name small { font-weight: 400; color: var(--text-3); font-size: 11px; }
.mini__btn { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; padding: 5px 9px; border-radius: var(--r-sm); }
.mini__btn--ok { background: var(--primary); color: var(--on-primary); }
.mini__pill { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: var(--r-full); }
.mini__pill--warn { background: var(--danger-soft); color: var(--danger-text); }
.mini__pill--ok { background: rgba(255, 255, 255, 0.18); color: #fff; }
.mini__bar { display: grid; grid-template-columns: 90px 1fr 28px; gap: 8px; align-items: center; font-size: 11px; margin-bottom: 6px; }
.mini__bar i { height: 6px; border-radius: 3px; background: var(--surface-3); position: relative; overflow: hidden; }
.mini__bar i::after { content: ''; position: absolute; inset: 0; width: var(--w); background: var(--tone); border-radius: inherit; transform-origin: left; animation: grow 1s var(--ease-out) both; animation-delay: calc(var(--i) * 90ms + 200ms); }
.mini__bar b { text-align: right; font-family: var(--font-mono); font-weight: 600; }
@keyframes grow { from { transform: scaleX(0); } }
.mini__grade { display: grid; grid-template-columns: 1fr auto auto; gap: 8px; align-items: center; padding: 6px 0; border-top: 1px solid var(--line); font-size: 12px; }
.mini__input { min-width: 44px; padding: 5px 8px; border: 1px solid var(--line-strong); border-radius: 6px; background: var(--surface); font-family: var(--font-mono); text-align: right; }
.mini__input--typing { border-color: var(--tone); box-shadow: 0 0 0 3px var(--tone-soft); }
.mini__input--typing i { display: inline-block; width: 1px; height: 12px; background: var(--text); margin-left: 1px; vertical-align: -2px; animation: blink 1s steps(1) infinite; }
@keyframes blink { 50% { opacity: 0; } }
.mini__slash { color: var(--text-3); font-size: 11px; }
.idcard { border-radius: var(--r-md); padding: var(--sp-4); background: linear-gradient(145deg, var(--pine-800), var(--pine-900)); color: rgba(244, 242, 236, 0.8); }
.idcard__top { display: flex; justify-content: space-between; align-items: center; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; }
.idcard__roll { font-family: var(--font-display); font-size: var(--text-xl); color: #fff; margin-top: var(--sp-3); }
.idcard__course { font-size: 12px; }
.idcard__foot { display: flex; align-items: center; gap: 8px; margin-top: var(--sp-4); font-size: 12px; color: #fff; font-weight: 600; }
.idcard__foot span:last-child { display: flex; flex-direction: column; }
.idcard__foot small { font-weight: 400; color: rgba(244, 242, 236, 0.7); font-size: 10px; }
.mini__kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: var(--sp-3); }
.mini__kpis div { background: var(--surface); border-radius: var(--r-sm); padding: 8px; display: flex; flex-direction: column; }
.mini__kpis small { font-size: 10px; color: var(--text-3); }
.mini__kpis strong { font-family: var(--font-display); font-size: 15px; }

.swap-enter-active { transition: opacity var(--dur) var(--ease-out), transform var(--dur) var(--ease-out); }
.swap-leave-active { transition: opacity var(--dur-fast) var(--ease); }
.swap-enter-from { opacity: 0; transform: translateY(10px); }
.swap-leave-to { opacity: 0; }

@media (max-width: 960px) { .rs { grid-template-columns: 1fr; } .rs__tabs { flex-direction: row; overflow-x: auto; padding-bottom: 4px; } .tab { min-width: 220px; } .tab--on, .tab:hover { transform: none; } .tab__chev { display: none; } }
@media (max-width: 640px) { .panel { grid-template-columns: 1fr; } .tab { min-width: 180px; padding: var(--sp-3); } .tab__text strong { font-size: var(--text-md); } .tab__text small { display: none; } }
</style>
