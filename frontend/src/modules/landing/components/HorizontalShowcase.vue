<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppIcon from '@/ui/AppIcon.vue'

export interface ShowcaseItem { icon: string; kicker: string; title: string; text: string }
const props = defineProps<{ items: ShowcaseItem[] }>()
const track = ref<HTMLElement | null>(null)
const current = ref(1)

const update = () => {
  const el = track.value
  if (!el) return
  const card = el.querySelector<HTMLElement>('.card')
  if (!card) return
  const step = card.offsetWidth + 20
  current.value = Math.min(props.items.length, Math.round(el.scrollLeft / step) + 1)
}
const scrollBy = (dir: 1 | -1) => {
  const el = track.value
  const card = el?.querySelector<HTMLElement>('.card')
  if (el && card) el.scrollBy({ left: dir * (card.offsetWidth + 20), behavior: 'smooth' })
}
onMounted(update)
</script>

<template>
  <div class="hs">
    <div class="hs__bar">
      <p class="hs__count mono"><b>{{ String(current).padStart(2, '0') }}</b> / {{ String(items.length).padStart(2, '0') }}</p>
      <div class="hs__nav">
        <button type="button" aria-label="Previous" @click="scrollBy(-1)"><AppIcon name="arrow-left" :size="16" /></button>
        <button type="button" aria-label="Next" @click="scrollBy(1)"><AppIcon name="arrow-right" :size="16" /></button>
      </div>
    </div>
    <div ref="track" class="hs__track" @scroll.passive="update">
      <article v-for="(it, i) in items" :key="it.title" class="card" :style="{ '--i': i }">
        <span class="card__index mono">{{ String(i + 1).padStart(2, '0') }}</span>
        <span class="card__icon"><AppIcon :name="it.icon" :size="22" /></span>
        <p class="card__kicker">{{ it.kicker }}</p>
        <h3 class="card__title">{{ it.title }}</h3>
        <p class="card__text">{{ it.text }}</p>
      </article>
      <div class="hs__spacer" />
    </div>
  </div>
</template>

<style scoped>
.hs__bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--sp-5); }
.hs__count { font-size: var(--text-lg); color: var(--text-3); }
.hs__count b { color: var(--text); font-size: var(--text-2xl); font-family: var(--font-display); }
.hs__nav { display: flex; gap: 8px; }
.hs__nav button { width: 44px; height: 44px; border-radius: 50%; border: 1px solid var(--line-strong); color: var(--text); display: grid; place-items: center; transition: all var(--dur-fast); }
.hs__nav button:hover { background: var(--accent); color: var(--ink-900); border-color: var(--accent); }
.hs__track { display: flex; gap: 20px; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: var(--sp-4); margin: 0 calc(-1 * var(--sp-6)); padding-left: var(--sp-6); scrollbar-width: none; }
.hs__track::-webkit-scrollbar { display: none; }
.hs__spacer { flex: 0 0 1px; }
.card { flex: 0 0 min(340px, 78vw); scroll-snap-align: start; position: relative; padding: var(--sp-6); border: 1px solid var(--line); border-radius: var(--r-xl); background: var(--surface); transition: transform var(--dur) var(--ease), border-color var(--dur); }
.card:hover { transform: translateY(-4px); border-color: var(--accent); }
.card__index { position: absolute; top: var(--sp-5); right: var(--sp-5); font-size: 3rem; line-height: 1; font-family: var(--font-display); font-weight: 700; color: var(--line-strong); }
.card__icon { width: 48px; height: 48px; border-radius: 14px; display: grid; place-items: center; background: var(--accent-soft); color: var(--accent-text); margin-bottom: var(--sp-8); }
.card__kicker { font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-3); margin-bottom: var(--sp-2); }
.card__title { font-size: var(--text-xl); margin-bottom: var(--sp-3); }
.card__text { color: var(--text-2); font-size: var(--text-sm); line-height: 1.65; }
</style>
