<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppLogo from '@/ui/AppLogo.vue'

/** Shown once per browser session: a short "setting up" beat before the hero reveals. */
const KEY = 'vidyara.preloaded'
const visible = ref(false)
const progress = ref(0)
const emit = defineEmits<{ done: [] }>()

onMounted(() => {
  let seen = false
  try { seen = sessionStorage.getItem(KEY) === '1' } catch { /* ignore */ }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (seen || reduce) { emit('done'); return }

  visible.value = true
  document.body.style.overflow = 'hidden'
  const start = performance.now()
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / 1400)
    progress.value = Math.round((1 - Math.pow(1 - t, 3)) * 100)
    if (t < 1) requestAnimationFrame(step)
    else window.setTimeout(finish, 250)
  }
  requestAnimationFrame(step)
})

const finish = () => {
  visible.value = false
  document.body.style.overflow = ''
  try { sessionStorage.setItem(KEY, '1') } catch { /* ignore */ }
  emit('done')
}
</script>

<template>
  <Transition name="pre">
    <div v-if="visible" class="pre" aria-hidden="true">
      <div class="pre__inner">
        <AppLogo light :size="56" hide-name />
        <p class="pre__word">Vidyara</p>
        <p class="pre__sub">Setting up your campus…</p>
        <div class="pre__bar"><span :style="{ width: `${progress}%` }" /></div>
        <p class="pre__pct mono">{{ progress }}%</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.pre { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; background: #0c1013; color: #f1ede3; }
.pre__inner { display: flex; flex-direction: column; align-items: center; gap: 10px; animation: fade-up 600ms var(--ease-out) both; }
.pre__word { font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 600; margin-top: 6px; letter-spacing: 0.02em; }
.pre__sub { font-size: var(--text-sm); color: rgba(241, 237, 227, 0.55); }
.pre__bar { width: 200px; height: 2px; background: rgba(255, 255, 255, 0.12); margin-top: 18px; border-radius: 2px; overflow: hidden; }
.pre__bar span { display: block; height: 100%; background: var(--saffron-500); transition: width 80ms linear; }
.pre__pct { font-size: var(--text-xs); color: rgba(241, 237, 227, 0.45); }
.pre-leave-active { transition: opacity 600ms var(--ease), transform 600ms var(--ease); }
.pre-leave-to { opacity: 0; transform: scale(1.04); }
</style>
