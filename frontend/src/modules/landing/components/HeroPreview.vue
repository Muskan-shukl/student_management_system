<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import AppIcon from '@/ui/AppIcon.vue'

/** A hand-built miniature of the dashboard; tilts gently toward the cursor. */
const wrap = ref<HTMLElement | null>(null)
const tilt = ref({ x: 0, y: 0 })
const onMove = (e: PointerEvent) => {
  const rect = wrap.value?.getBoundingClientRect()
  if (!rect) return
  const px = (e.clientX - rect.left) / rect.width - 0.5
  const py = (e.clientY - rect.top) / rect.height - 0.5
  tilt.value = { x: py * -6, y: px * 8 }
}
const reset = () => (tilt.value = { x: 0, y: 0 })
onMounted(() => { window.addEventListener('pointermove', onMove, { passive: true }) })
onBeforeUnmount(() => window.removeEventListener('pointermove', onMove))

const grades = [
  { subject: 'Data Structures', pct: 84 },
  { subject: 'Operating Systems', pct: 71 },
  { subject: 'Mathematics III', pct: 92 },
]
const r = 42
const c = 2 * Math.PI * r
</script>

<template>
  <div ref="wrap" class="stage" @pointerleave="reset">
    <div class="scene" :style="{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }">
      <div class="window">
        <aside class="window__side">
          <span class="dot dot--brand" />
          <span v-for="i in 4" :key="i" class="side-item" :class="{ 'side-item--on': i === 1 }" />
        </aside>
        <div class="window__main">
          <div class="win-head">
            <div><p class="win-eyebrow">Good morning</p><p class="win-title">Muskan Shukla</p></div>
            <span class="win-avatar">MS</span>
          </div>
          <div class="tiles">
            <div class="tile"><span class="tile__ic tile__ic--p"><AppIcon name="students" :size="13" /></span><div><p class="tile__l">Students</p><p class="tile__v">248</p></div></div>
            <div class="tile"><span class="tile__ic tile__ic--i"><AppIcon name="book" :size="13" /></span><div><p class="tile__l">Teachers</p><p class="tile__v">19</p></div></div>
            <div class="tile"><span class="tile__ic tile__ic--a"><AppIcon name="clock" :size="13" /></span><div><p class="tile__l">Pending</p><p class="tile__v">3</p></div></div>
          </div>
          <div class="panels">
            <div class="panel">
              <p class="panel__t">Grades</p>
              <div v-for="(g, i) in grades" :key="g.subject" class="bar" :style="{ '--i': i, '--w': `${g.pct}%` }">
                <div class="bar__h"><span>{{ g.subject }}</span><span class="mono">{{ g.pct }}%</span></div>
                <div class="bar__t"><span class="bar__f" /></div>
              </div>
            </div>
            <div class="panel panel--ring">
              <p class="panel__t">Attendance</p>
              <div class="ring">
                <svg viewBox="0 0 100 100"><circle cx="50" cy="50" :r="r" class="ring__t" /><circle cx="50" cy="50" :r="r" class="ring__b" :style="{ strokeDasharray: c, '--c': c }" /></svg>
                <span class="ring__v">88%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="chip chip--1"><span class="chip__dot chip__dot--g" /> Teacher approved</div>
      <div class="chip chip--2"><span class="chip__dot chip__dot--a" /> Grades updated</div>
      <div class="chip chip--3"><AppIcon name="shield" :size="14" /> Role-checked</div>
    </div>
  </div>
</template>

<style scoped>
.stage { perspective: 1400px; width: 100%; max-width: 560px; margin-left: auto; }
.scene { position: relative; transform-style: preserve-3d; transition: transform 400ms var(--ease-out); animation: rise 900ms var(--ease-out) both; }
@keyframes rise { from { opacity: 0; transform: translateY(30px) rotateX(6deg); } to { opacity: 1; transform: none; } }

.window {
  display: grid; grid-template-columns: 52px 1fr;
  border-radius: 22px; overflow: hidden;
  background: var(--surface); border: 1px solid var(--line);
  box-shadow: var(--shadow-lg), 0 0 0 1px rgba(255, 255, 255, 0.4) inset;
}
.window__side { background: var(--pine-900); padding: 14px 0; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.dot { width: 22px; height: 22px; border-radius: 8px; }
.dot--brand { background: var(--accent); margin-bottom: 8px; }
.side-item { width: 22px; height: 6px; border-radius: 3px; background: rgba(255, 255, 255, 0.16); }
.side-item--on { background: rgba(255, 255, 255, 0.55); }
.window__main { padding: 18px; display: flex; flex-direction: column; gap: 14px; }
.win-head { display: flex; align-items: center; justify-content: space-between; }
.win-eyebrow { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--primary-text); }
.win-title { font-family: var(--font-display); font-size: 17px; font-weight: 600; }
.win-avatar { width: 28px; height: 28px; border-radius: 40%; display: grid; place-items: center; font-size: 10px; font-weight: 700; background: var(--info-soft); color: var(--info-text); font-family: var(--font-display); }
.tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.tile { display: flex; gap: 8px; align-items: center; padding: 10px; border: 1px solid var(--line); border-radius: 12px; background: var(--surface-2); }
.tile__ic { width: 24px; height: 24px; border-radius: 7px; display: grid; place-items: center; flex-shrink: 0; }
.tile__ic--p { background: var(--primary-soft); color: var(--primary-text); }
.tile__ic--i { background: var(--info-soft); color: var(--info-text); }
.tile__ic--a { background: var(--accent-soft); color: var(--accent-text); }
.tile__l { font-size: 9px; color: var(--text-3); font-weight: 600; }
.tile__v { font-family: var(--font-display); font-size: 15px; font-weight: 600; line-height: 1.1; }
.panels { display: grid; grid-template-columns: 1.4fr 1fr; gap: 8px; }
.panel { border: 1px solid var(--line); border-radius: 12px; padding: 12px; }
.panel__t { font-family: var(--font-display); font-size: 12px; font-weight: 600; margin-bottom: 8px; }
.bar { margin-bottom: 8px; }
.bar__h { display: flex; justify-content: space-between; font-size: 9px; font-weight: 500; margin-bottom: 3px; }
.bar__t { height: 4px; border-radius: 3px; background: var(--surface-3); overflow: hidden; }
.bar__f { display: block; height: 100%; width: var(--w); border-radius: inherit; background: var(--primary); transform-origin: left; animation: grow 1.2s var(--ease-out) both; animation-delay: calc(500ms + var(--i) * 120ms); }
@keyframes grow { from { transform: scaleX(0); } }
.panel--ring { display: flex; flex-direction: column; align-items: center; }
.ring { position: relative; width: 74px; height: 74px; }
.ring svg { transform: rotate(-90deg); width: 100%; height: 100%; }
.ring__t { fill: none; stroke: var(--surface-3); stroke-width: 9; }
.ring__b { fill: none; stroke: var(--primary); stroke-width: 9; stroke-linecap: round; stroke-dashoffset: calc(var(--c) * 0.12); animation: ring 1.4s var(--ease-out) 600ms both; }
@keyframes ring { from { stroke-dashoffset: var(--c); } }
.ring__v { position: absolute; inset: 0; display: grid; place-items: center; font-family: var(--font-display); font-size: 14px; font-weight: 600; }

.chip {
  position: absolute; display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 14px; border-radius: var(--r-full);
  background: var(--surface); border: 1px solid var(--line);
  box-shadow: var(--shadow-md); font-size: 12px; font-weight: 600;
  animation: float 6s var(--ease) infinite; transform: translateZ(40px);
}
.chip--1 { top: -18px; left: -26px; --rot: -3deg; }
.chip--2 { bottom: 34px; right: -30px; --rot: 2deg; animation-delay: -2s; }
.chip--3 { bottom: -18px; left: 60px; --rot: 1deg; animation-delay: -4s; color: var(--primary-text); }
.chip__dot { width: 8px; height: 8px; border-radius: 50%; }
.chip__dot--g { background: var(--success); box-shadow: 0 0 0 4px var(--success-soft); }
.chip__dot--a { background: var(--accent); box-shadow: 0 0 0 4px var(--accent-soft); }

@media (max-width: 960px) { .stage { margin: 0 auto; max-width: 520px; } .chip--1 { left: 8px; } .chip--2 { right: 8px; } }
@media (max-width: 480px) { .chip--3 { display: none; } .tiles { grid-template-columns: 1fr 1fr; } .tile:last-child { display: none; } }
</style>
