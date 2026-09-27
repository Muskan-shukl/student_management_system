<script setup lang="ts">
import AppProgress from '@/ui/AppProgress.vue'
import type { Grade } from '@/core/api/types'

defineProps<{ grades: Grade[] }>()
const pct = (g: Grade) => Math.round((g.score / g.maxScore) * 100)
</script>

<template>
  <ul class="grades">
    <li v-for="(g, i) in grades" :key="g.subject" class="grade" :style="{ '--i': i }">
      <div class="grade__head">
        <span class="grade__subject">{{ g.subject }}</span>
        <span class="grade__score mono">{{ g.score }}<span class="text-3">/{{ g.maxScore }}</span></span>
      </div>
      <AppProgress :value="pct(g)" />
    </li>
  </ul>
</template>

<style scoped>
.grades { display: flex; flex-direction: column; gap: var(--sp-3); }
.grade { animation: fade-up var(--dur-slow) var(--ease-out) both; animation-delay: calc(var(--i) * 50ms); }
.grade__head { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: var(--text-sm); }
.grade__subject { font-weight: 500; }
.grade__score { font-weight: 600; }
</style>
