<script setup lang="ts">
import AppIcon from '@/ui/AppIcon.vue'

interface Item { icon: string; who: string; what: string; when: string; tone: 'ok' | 'warn' | 'info' }
const FEED: Item[] = [
  { icon: 'check', who: 'Karan Malhotra', what: 'marked the 9am register', when: '09:02', tone: 'ok' },
  { icon: 'user-check', who: 'Admin', what: 'approved a new teacher', when: '09:10', tone: 'info' },
  { icon: 'trending', who: 'Neha Sharma', what: 'scored 84 in Data Structures', when: '11:40', tone: 'ok' },
  { icon: 'alert', who: 'Priya Desai', what: 'dropped below 75% attendance', when: '12:05', tone: 'warn' },
  { icon: 'edit', who: 'Rohan Iyer', what: 'submitted “Linked list”', when: '14:20', tone: 'info' },
  { icon: 'calendar', who: 'Timetable', what: 'clash blocked: Mon 9–10 already taken', when: '15:00', tone: 'warn' },
  { icon: 'inbox', who: 'Admin', what: 'posted “Unit test next week”', when: '16:30', tone: 'info' },
  { icon: 'hat', who: 'Simran Kaur', what: 'checked tomorrow’s classes', when: '20:15', tone: 'ok' },
]
</script>

<template>
  <div class="ticker" aria-hidden="true">
    <div class="ticker__fade ticker__fade--l" /><div class="ticker__fade ticker__fade--r" />
    <div class="ticker__track">
      <template v-for="n in 2" :key="n">
        <span v-for="it in FEED" :key="`${n}-${it.when}`" class="chip" :class="`chip--${it.tone}`">
          <i class="chip__icon"><AppIcon :name="it.icon" :size="13" /></i>
          <b>{{ it.who }}</b> {{ it.what }}
          <span class="chip__when mono">{{ it.when }}</span>
        </span>
      </template>
    </div>
  </div>
</template>

<style scoped>
.ticker { position: relative; overflow: hidden; padding: var(--sp-4) 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); background: var(--surface); }
.ticker__fade { position: absolute; top: 0; bottom: 0; width: 120px; z-index: 1; pointer-events: none; }
.ticker__fade--l { left: 0; background: linear-gradient(90deg, var(--surface), transparent); }
.ticker__fade--r { right: 0; background: linear-gradient(-90deg, var(--surface), transparent); }
.ticker__track { display: flex; gap: var(--sp-3); width: max-content; animation: feed 46s linear infinite; }
.ticker:hover .ticker__track { animation-play-state: paused; }
@keyframes feed { to { transform: translateX(-50%); } }
.chip { display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px 8px 8px; border-radius: var(--r-full); border: 1px solid var(--line); background: var(--bg); font-size: var(--text-sm); color: var(--text-2); white-space: nowrap; }
.chip b { color: var(--text); font-weight: 600; }
.chip__icon { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; }
.chip--ok .chip__icon { background: var(--success-soft); color: var(--success-text); }
.chip--warn .chip__icon { background: var(--accent-soft); color: var(--accent-text); }
.chip--info .chip__icon { background: var(--info-soft); color: var(--info-text); }
.chip__when { font-size: var(--text-xs); color: var(--text-3); margin-left: 4px; }
</style>
