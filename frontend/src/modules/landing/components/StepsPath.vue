<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import AppIcon from '@/ui/AppIcon.vue'

interface Step { n: string; icon: string; title: string; text: string; time: string }
const STEPS: Step[] = [
  { n: '01', icon: 'hat', title: 'Create the admin account', text: 'Sign up once as the administrator. No card, no setup call — you are in within a minute.', time: '1 min' },
  { n: '02', icon: 'user-check', title: 'Bring in your teachers', text: 'Add them yourself, or let them sign up and approve each one with a click. Pending accounts see nothing until then.', time: '5 min' },
  { n: '03', icon: 'students', title: 'Add students, assign teachers', text: 'Enter students with course and year, assign each to a teacher — one at a time or in bulk. Every student gets their own login.', time: '20 min' },
  { n: '04', icon: 'trending', title: 'Run the day', text: 'Registers, marks, timetable, assignments, notices. Everyone sees their part of it the moment it changes.', time: 'every day' },
]

const root = ref<HTMLElement | null>(null)
const visible = ref(false)
let io: IntersectionObserver | null = null
onMounted(() => {
  if (!root.value || !('IntersectionObserver' in window)) { visible.value = true; return }
  io = new IntersectionObserver((entries) => { if (entries[0]?.isIntersecting) { visible.value = true; io?.disconnect() } }, { threshold: 0.3 })
  io.observe(root.value)
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <div ref="root" class="steps" :class="{ 'steps--on': visible }">
    <svg class="steps__path" viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true">
      <path d="M40 60 C 180 60, 200 20, 330 20 S 470 100, 620 100 S 780 20, 960 60" class="steps__track" />
      <path d="M40 60 C 180 60, 200 20, 330 20 S 470 100, 620 100 S 780 20, 960 60" class="steps__draw" />
    </svg>
    <ol class="steps__list">
      <li v-for="(s, i) in STEPS" :key="s.n" class="step" :style="{ '--i': i }">
        <div class="step__node"><AppIcon :name="s.icon" :size="20" /><span class="step__n">{{ s.n }}</span></div>
        <div class="step__card">
          <span class="step__time"><AppIcon name="clock" :size="12" /> {{ s.time }}</span>
          <h4 class="step__title">{{ s.title }}</h4>
          <p class="step__text">{{ s.text }}</p>
        </div>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.steps { position: relative; }
.steps__path { position: absolute; left: 0; right: 0; top: 10px; width: 100%; height: 120px; pointer-events: none; }
.steps__track { fill: none; stroke: var(--line-strong); stroke-width: 2; stroke-dasharray: 6 8; }
.steps__draw { fill: none; stroke: var(--primary); stroke-width: 3; stroke-linecap: round; stroke-dasharray: 1400; stroke-dashoffset: 1400; transition: stroke-dashoffset 2.2s var(--ease-out) 200ms; }
.steps--on .steps__draw { stroke-dashoffset: 0; }
.steps__list { position: relative; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--sp-5); }
.step { display: flex; flex-direction: column; align-items: center; text-align: center; opacity: 0; transform: translateY(18px); transition: opacity var(--dur-slow) var(--ease-out), transform 600ms var(--ease-out); transition-delay: calc(var(--i) * 420ms + 300ms); }
.steps--on .step { opacity: 1; transform: none; }
.step__node { position: relative; width: 64px; height: 64px; border-radius: 50%; display: grid; place-items: center; background: var(--surface); border: 2px solid var(--line-strong); color: var(--text-3); box-shadow: 0 0 0 10px var(--bg); transition: all var(--dur-slow) var(--ease-spring); transition-delay: calc(var(--i) * 420ms + 500ms); }
.steps--on .step__node { background: var(--primary); border-color: var(--primary); color: var(--on-primary); }
.step__n { position: absolute; top: -8px; right: -8px; width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; background: var(--accent); color: var(--ink-900); font-family: var(--font-display); font-weight: 700; font-size: 11px; }
.step__card { margin-top: var(--sp-8); padding: var(--sp-5); border-radius: var(--r-lg); background: var(--surface); border: 1px solid var(--line); width: 100%; transition: transform var(--dur) var(--ease), box-shadow var(--dur); }
.step__card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
.step__time { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-3); margin-bottom: var(--sp-3); }
.step__title { font-size: var(--text-lg); margin-bottom: var(--sp-2); }
.step__text { color: var(--text-2); font-size: var(--text-sm); line-height: 1.6; }

@media (max-width: 960px) {
  .steps__path { display: none; }
  .steps__list { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 560px) {
  .steps__list { grid-template-columns: 1fr; }
  .step { flex-direction: row; text-align: left; align-items: flex-start; gap: var(--sp-4); }
  .step__node { flex-shrink: 0; width: 52px; height: 52px; box-shadow: none; }
  .step__card { margin-top: 0; }
}
</style>
