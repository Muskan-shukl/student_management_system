<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppStat from '@/ui/AppStat.vue'
import AppCard from '@/ui/AppCard.vue'
import AppAvatar from '@/ui/AppAvatar.vue'
import AppButton from '@/ui/AppButton.vue'
import AppEmpty from '@/ui/AppEmpty.vue'
import AppSkeleton from '@/ui/AppSkeleton.vue'
import AppProgress from '@/ui/AppProgress.vue'
import AppBadge from '@/ui/AppBadge.vue'
import AppIcon from '@/ui/AppIcon.vue'
import TodayClasses from './TodayClasses.vue'
import NoticeList from './NoticeList.vue'
import { ordinalYear, percent } from '@/core/utils/format'
import type { TeacherDashboard } from '../api'

defineProps<{ data: TeacherDashboard | null; loading: boolean }>()
const router = useRouter()
</script>

<template>
  <div class="grid">
    <div class="stats">
      <AppStat class="reveal" style="--i: 1" label="Assigned students" :value="data?.assigned" icon="students" :loading="loading" />
      <AppStat class="reveal" style="--i: 2" label="Avg. attendance" :value="data?.averageAttendance" suffix="%" icon="calendar" tone="info" :loading="loading" />
      <AppStat class="reveal" style="--i: 3" label="Avg. score" :value="data?.averageScore" suffix="%" icon="trending" tone="accent" :loading="loading" />
      <AppStat class="reveal" style="--i: 4" label="Not graded yet" :value="data?.ungraded" icon="edit" tone="danger" :loading="loading" hint="Students without grades" />
    </div>

    <div class="reveal span-3 actions" style="--i: 5">
      <button type="button" class="action" :class="{ 'action--done': data?.attendanceMarkedToday }" @click="router.push('/attendance')">
        <span class="action__icon"><AppIcon :name="data?.attendanceMarkedToday ? 'check' : 'calendar'" :size="18" /></span>
        <span class="action__text"><b>{{ data?.attendanceMarkedToday ? 'Today\'s register is done' : 'Mark today\'s attendance' }}</b><small>{{ data?.attendanceMarkedToday ? 'Open to make corrections' : 'Not marked yet' }}</small></span>
        <AppIcon name="arrow-right" :size="16" />
      </button>
      <button type="button" class="action" :class="{ 'action--done': !data?.submissionsToCheck }" @click="router.push('/assignments')">
        <span class="action__icon"><AppIcon name="edit" :size="18" /></span>
        <span class="action__text"><b>{{ data?.submissionsToCheck ? `${data.submissionsToCheck} submission${data.submissionsToCheck === 1 ? '' : 's'} to check` : 'No submissions waiting' }}</b><small>Assignments</small></span>
        <AppIcon name="arrow-right" :size="16" />
      </button>
    </div>

    <AppCard class="reveal" style="--i: 5" title="Needs attention" subtitle="Attendance below 75%">
      <div v-if="loading" class="rows"><AppSkeleton v-for="i in 3" :key="i" height="44px" /></div>
      <AppEmpty v-else-if="!data?.lowAttendance.length" compact icon="check" title="All clear" description="Every student is above the attendance threshold." />
      <ul v-else class="rows">
        <li v-for="s in data.lowAttendance" :key="s._id" class="row row--link" @click="router.push(`/students/${s._id}`)">
          <AppAvatar :name="s.user.name" />
          <div class="row__text">
            <p class="row__title">{{ s.user.name }}</p>
            <AppProgress :value="s.attendancePercent" />
          </div>
          <span class="mono row__pct">{{ percent(s.attendancePercent) }}</span>
        </li>
      </ul>
    </AppCard>

    <AppCard class="reveal span-2" style="--i: 6" title="Your students">
      <template #actions><AppButton size="sm" variant="ghost" icon-right="arrow-right" @click="router.push('/students')">View all</AppButton></template>
      <div v-if="loading" class="rows"><AppSkeleton v-for="i in 4" :key="i" height="44px" /></div>
      <AppEmpty v-else-if="!data?.recentStudents.length" compact icon="students" title="No students assigned yet" description="An administrator will assign students to you. Check back soon." />
      <ul v-else class="rows">
        <li v-for="s in data.recentStudents" :key="s._id" class="row row--link" @click="router.push(`/students/${s._id}`)">
          <AppAvatar :name="s.user.name" />
          <div class="row__text">
            <p class="row__title">{{ s.user.name }} <span class="mono text-3 text-xs">{{ s.rollNumber }}</span></p>
            <p class="row__sub">{{ s.course }} · {{ ordinalYear(s.year) }}</p>
          </div>
          <AppBadge v-if="s.grades.length" tone="success">{{ s.averageScore }}% avg</AppBadge>
          <AppBadge v-else tone="warning">Ungraded</AppBadge>
        </li>
      </ul>
    </AppCard>

    <TodayClasses class="reveal" style="--i: 7" :slots="data?.todayClasses" :loading="loading" />
    <NoticeList class="reveal span-2" style="--i: 8" :items="data?.announcements" :loading="loading" />
  </div>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--sp-5); }
.stats { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--sp-4); }
.span-2 { grid-column: span 2; }
.span-3 { grid-column: 1 / -1; }
.actions { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-4); }
.action { display: flex; align-items: center; gap: var(--sp-3); padding: var(--sp-4) var(--sp-5); text-align: left; background: var(--accent-soft); border: 1px solid transparent; border-radius: var(--r-lg); color: var(--text); transition: transform var(--dur) var(--ease), box-shadow var(--dur); }
.action:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.action--done { background: var(--surface); border-color: var(--line); }
.action__icon { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; background: var(--accent); color: var(--ink-900); flex-shrink: 0; }
.action--done .action__icon { background: var(--success-soft); color: var(--success-text); }
.action__text { flex: 1; display: flex; flex-direction: column; }
.action__text b { font-size: var(--text-sm); }
.action__text small { font-size: var(--text-xs); color: var(--text-3); }
.rows { display: flex; flex-direction: column; gap: var(--sp-2); }
.row { display: flex; align-items: center; gap: var(--sp-3); padding: var(--sp-3); border-radius: var(--r-md); transition: background var(--dur-fast); }
.row--link { cursor: pointer; }
.row--link:hover { background: var(--surface-2); }
.row__text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.row__title { font-weight: 600; font-size: var(--text-sm); }
.row__sub { font-size: var(--text-xs); color: var(--text-3); }
.row__pct { font-size: var(--text-sm); font-weight: 600; }
@media (max-width: 1100px) { .stats { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 900px) { .grid { grid-template-columns: 1fr; } .span-2 { grid-column: auto; } .actions { grid-template-columns: 1fr; } }
@media (max-width: 480px) { .stats { grid-template-columns: 1fr; } }
</style>
