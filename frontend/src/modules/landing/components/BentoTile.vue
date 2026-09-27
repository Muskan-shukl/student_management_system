<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/ui/AppIcon.vue'

/** Feature tile with a soft spotlight that follows the cursor. */
defineProps<{ icon: string; title: string; text: string; wide?: boolean }>()
const el = ref<HTMLElement | null>(null)
const onMove = (e: PointerEvent) => {
  const r = el.value?.getBoundingClientRect()
  if (!r) return
  el.value!.style.setProperty('--mx', `${e.clientX - r.left}px`)
  el.value!.style.setProperty('--my', `${e.clientY - r.top}px`)
}
</script>

<template>
  <article ref="el" class="tile" :class="{ 'tile--wide': wide }" @pointermove="onMove">
    <div class="tile__spot" />
    <div class="tile__body">
      <span class="tile__icon"><AppIcon :name="icon" :size="18" /></span>
      <h4 class="tile__title">{{ title }}</h4>
      <p class="tile__text">{{ text }}</p>
    </div>
    <div v-if="$slots.default" class="tile__demo"><slot /></div>
  </article>
</template>

<style scoped>
.tile { --mx: 50%; --my: 50%; position: relative; overflow: hidden; display: flex; flex-direction: column; border: 1px solid var(--line); border-radius: var(--r-lg); background: var(--surface); transition: border-color var(--dur), transform var(--dur) var(--ease), box-shadow var(--dur); }
.tile:hover { border-color: var(--line-strong); transform: translateY(-3px); box-shadow: var(--shadow-md); }
.tile--wide { grid-column: span 2; flex-direction: row; align-items: stretch; }
.tile__spot { position: absolute; inset: 0; background: radial-gradient(260px circle at var(--mx) var(--my), var(--primary-soft), transparent 70%); opacity: 0; transition: opacity var(--dur); pointer-events: none; }
.tile:hover .tile__spot { opacity: 0.9; }
.tile__body { position: relative; padding: var(--sp-6); flex: 1; }
.tile__icon { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; background: var(--primary-soft); color: var(--primary-text); margin-bottom: var(--sp-4); transition: transform var(--dur) var(--ease-spring); }
.tile:hover .tile__icon { transform: rotate(-8deg) scale(1.08); }
.tile__title { font-size: var(--text-lg); margin-bottom: var(--sp-2); }
.tile__text { font-size: var(--text-sm); color: var(--text-2); line-height: 1.6; }
.tile__demo { position: relative; flex: 1; display: grid; place-items: center; padding: var(--sp-5); background: var(--bg); border-left: 1px solid var(--line); min-width: 0; }
@media (max-width: 960px) { .tile--wide { grid-column: auto; flex-direction: column; } .tile__demo { border-left: 0; border-top: 1px solid var(--line); } }
</style>
