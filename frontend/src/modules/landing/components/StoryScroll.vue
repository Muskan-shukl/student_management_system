<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import AppIcon from '@/ui/AppIcon.vue'

/** Sticky "chapter" on the left, steps scroll past on the right; the active step lights up. */
export interface StoryStep { n: string; icon: string; title: string; text: string; bullets: string[] }
defineProps<{ steps: StoryStep[] }>()
const active = ref(0)
const items = ref<HTMLElement[]>([])
let io: IntersectionObserver | null = null

onMounted(() => {
  io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) active.value = Number((e.target as HTMLElement).dataset.i)
  }, { rootMargin: '-45% 0px -45% 0px' })
  items.value.forEach((el) => io!.observe(el))
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <div class="story">
    <aside class="story__sticky">
      <p class="story__now mono">{{ steps[active]?.n }}</p>
      <Transition name="fade" mode="out-in">
        <h3 :key="active" class="story__title">{{ steps[active]?.title }}</h3>
      </Transition>
      <div class="story__dots">
        <span v-for="(s, i) in steps" :key="s.n" :class="{ on: i === active, done: i < active }" />
      </div>
    </aside>
    <ol class="story__steps">
      <li v-for="(s, i) in steps" :key="s.n" :ref="(el) => { if (el) items[i] = el as HTMLElement }" :data-i="i" class="step" :class="{ 'step--on': i === active }">
        <div class="step__panel">
          <span class="step__icon"><AppIcon :name="s.icon" :size="22" /></span>
          <p class="step__n mono">{{ s.n }}</p>
          <h4 class="step__title">{{ s.title }}</h4>
          <p class="step__text">{{ s.text }}</p>
          <ul class="step__list"><li v-for="b in s.bullets" :key="b"><AppIcon name="check" :size="14" />{{ b }}</li></ul>
        </div>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.story { display: grid; grid-template-columns: 1fr 1.4fr; gap: var(--sp-12); align-items: start; }
.story__sticky { position: sticky; top: 110px; }
.story__now { font-size: clamp(4rem, 9vw, 7rem); line-height: 0.9; font-family: var(--font-display); font-weight: 700; color: var(--accent); letter-spacing: -0.04em; }
.story__title { font-size: var(--text-2xl); margin-top: var(--sp-4); max-width: 14ch; min-height: 2.4em; }
.story__dots { display: flex; gap: 8px; margin-top: var(--sp-6); }
.story__dots span { width: 34px; height: 3px; border-radius: 2px; background: var(--line-strong); transition: background var(--dur), width var(--dur); }
.story__dots span.done { background: var(--text-3); }
.story__dots span.on { background: var(--accent); width: 56px; }
.story__steps { display: flex; flex-direction: column; gap: var(--sp-8); }
.step { opacity: 0.35; transform: scale(0.98); transition: opacity var(--dur-slow) var(--ease), transform var(--dur-slow) var(--ease); }
.step--on { opacity: 1; transform: none; }
.step__panel { position: relative; padding: var(--sp-8); border: 1px solid var(--line); border-radius: var(--r-xl); background: var(--surface); }
.step--on .step__panel { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent), var(--shadow-lg); }
.step__icon { width: 52px; height: 52px; border-radius: 16px; display: grid; place-items: center; background: var(--accent-soft); color: var(--accent-text); margin-bottom: var(--sp-5); }
.step__n { position: absolute; top: var(--sp-6); right: var(--sp-6); color: var(--text-3); font-size: var(--text-sm); letter-spacing: 0.1em; }
.step__title { font-size: var(--text-2xl); margin-bottom: var(--sp-3); }
.step__text { color: var(--text-2); line-height: 1.65; }
.step__list { margin-top: var(--sp-5); display: flex; flex-direction: column; gap: 8px; }
.step__list li { display: flex; align-items: center; gap: 8px; font-size: var(--text-sm); color: var(--text-2); }
.step__list svg { color: var(--accent-text); }
@media (max-width: 900px) { .story { grid-template-columns: 1fr; gap: var(--sp-6); } .story__sticky { position: static; } .story__title { min-height: 0; } .step { opacity: 1; transform: none; } }
</style>
