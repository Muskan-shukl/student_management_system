<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/ui/AppIcon.vue'

defineProps<{ icon: string; title: string; text: string; tag?: string }>()

const el = ref<HTMLElement | null>(null)
const onMove = (e: MouseEvent) => {
  const r = el.value?.getBoundingClientRect()
  if (!r || !el.value) return
  el.value.style.setProperty('--mx', `${e.clientX - r.left}px`)
  el.value.style.setProperty('--my', `${e.clientY - r.top}px`)
}
</script>

<template>
  <article ref="el" class="spot" @mousemove="onMove">
    <span class="spot__glow" />
    <span class="spot__border" />
    <div class="spot__body">
      <span class="spot__icon"><AppIcon :name="icon" :size="20" /></span>
      <div class="spot__head">
        <h3 class="spot__title">{{ title }}</h3>
        <span v-if="tag" class="spot__tag">{{ tag }}</span>
      </div>
      <p class="spot__text">{{ text }}</p>
      <div v-if="$slots.default" class="spot__demo"><slot /></div>
    </div>
  </article>
</template>

<style scoped>
.spot { --mx: 50%; --my: 50%; position: relative; border-radius: var(--r-xl); background: var(--surface); border: 1px solid var(--line); overflow: hidden; height: 100%; transition: transform var(--dur) var(--ease), box-shadow var(--dur); }
.spot:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
.spot__glow { position: absolute; inset: 0; background: radial-gradient(380px circle at var(--mx) var(--my), color-mix(in srgb, var(--primary) 14%, transparent), transparent 60%); opacity: 0; transition: opacity var(--dur-slow); pointer-events: none; }
.spot__border { position: absolute; inset: 0; border-radius: inherit; padding: 1px; background: radial-gradient(260px circle at var(--mx) var(--my), var(--primary), transparent 70%); -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; opacity: 0; transition: opacity var(--dur-slow); pointer-events: none; }
.spot:hover .spot__glow, .spot:hover .spot__border { opacity: 1; }
.spot__body { position: relative; padding: var(--sp-6); display: flex; flex-direction: column; height: 100%; }
.spot__icon { width: 44px; height: 44px; border-radius: 13px; display: grid; place-items: center; background: var(--primary-soft); color: var(--primary-text); margin-bottom: var(--sp-5); transition: transform var(--dur-slow) var(--ease-spring); }
.spot:hover .spot__icon { transform: rotate(-6deg) scale(1.06); }
.spot__head { display: flex; align-items: center; gap: var(--sp-2); flex-wrap: wrap; margin-bottom: var(--sp-2); }
.spot__title { font-size: var(--text-xl); }
.spot__tag { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 8px; border-radius: var(--r-full); background: var(--accent-soft); color: var(--accent-text); }
.spot__text { color: var(--text-2); font-size: var(--text-sm); line-height: 1.65; }
.spot__demo { margin-top: auto; padding-top: var(--sp-5); }
</style>
