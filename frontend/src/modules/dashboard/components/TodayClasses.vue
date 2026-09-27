<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppCard from '@/ui/AppCard.vue'
import AppButton from '@/ui/AppButton.vue'
import AppEmpty from '@/ui/AppEmpty.vue'
import AppSkeleton from '@/ui/AppSkeleton.vue'
import type { TimetableSlot } from '@/core/api/types'
import { formatTime } from '@/core/utils/format'

defineProps<{ slots: TimetableSlot[] | undefined; loading: boolean }>()
const router = useRouter()
const isNow = (s: TimetableSlot) => { const t = new Date().toTimeString().slice(0, 5); return s.startTime <= t && t < s.endTime }
</script>

<template>
  <AppCard title="Today's classes">
    <template #actions><AppButton size="sm" variant="ghost" icon-right="arrow-right" @click="router.push('/timetable')">Week</AppButton></template>
    <div v-if="loading" class="rows"><AppSkeleton v-for="i in 3" :key="i" height="40px" /></div>
    <AppEmpty v-else-if="!slots?.length" compact icon="calendar" title="No classes today" />
    <ul v-else class="rows">
      <li v-for="s in slots" :key="s._id" class="slot" :class="{ 'slot--now': isNow(s) }">
        <span class="slot__time mono">{{ formatTime(s.startTime) }}</span>
        <div class="slot__body"><p class="slot__subject">{{ s.subject }}</p><p class="slot__meta">{{ [s.room, s.teacher?.name].filter(Boolean).join(' · ') }}</p></div>
        <span v-if="isNow(s)" class="slot__now">Now</span>
      </li>
    </ul>
  </AppCard>
</template>

<style scoped>
.rows { display: flex; flex-direction: column; gap: var(--sp-2); }
.slot { display: flex; align-items: center; gap: var(--sp-3); padding: var(--sp-3); border-radius: var(--r-md); border: 1px solid var(--line); }
.slot--now { border-color: var(--primary); background: var(--primary-soft); }
.slot__time { font-size: var(--text-xs); font-weight: 600; min-width: 64px; }
.slot__body { flex: 1; min-width: 0; }
.slot__subject { font-weight: 600; font-size: var(--text-sm); }
.slot__meta { font-size: var(--text-xs); color: var(--text-3); }
.slot__now { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--primary-text); }
</style>
