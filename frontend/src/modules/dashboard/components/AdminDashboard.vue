<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppStat from '@/ui/AppStat.vue'
import AppCard from '@/ui/AppCard.vue'
import AppAvatar from '@/ui/AppAvatar.vue'
import AppButton from '@/ui/AppButton.vue'
import AppEmpty from '@/ui/AppEmpty.vue'
import AppSkeleton from '@/ui/AppSkeleton.vue'
import AppBadge from '@/ui/AppBadge.vue'
import AppIcon from '@/ui/AppIcon.vue'
import AppTrend from '@/ui/AppTrend.vue'
import NoticeList from './NoticeList.vue'
import { useToast } from '@/core/composables/useToast'
import { toApiError } from '@/core/api/http'
import { relativeTime, ordinalYear, percent } from '@/core/utils/format'
import { usersApi } from '@/modules/users/api'
import type { AdminDashboard } from '../api'

const props = defineProps<{ data: AdminDashboard | null; loading: boolean }>()
const emit = defineEmits<{ refresh: [] }>()
const router = useRouter()
const toast = useToast()
const busy = ref<string | null>(null)

const maxCourse = computed(() => Math.max(1, ...(props.data?.students.byCourse.map((c) => c.count) ?? [1])))
const todayPct = computed(() => {
  const t = props.data?.today
  return t && t.marked ? Math.round(((t.present + t.late) / t.marked) * 100) : null
})

const QUICK = [
  { label: 'Add student', icon: 'plus', to: '/students?new=1' },
  { label: 'Add staff', icon: 'users', to: '/users?new=1' },
  { label: 'Post announcement', icon: 'inbox', to: '/announcements?new=1' },
  { label: 'Edit timetable', icon: 'clock', to: '/timetable' },
  { label: 'Attendance overview', icon: 'calendar', to: '/attendance' },
]

const decide = async (id: string, status: 'active' | 'disabled') => {
  busy.value = id
  try {
    await usersApi.update(id, { status })
    toast.success(status === 'active' ? 'Teacher approved' : 'Request declined')
    emit('refresh')
  } catch (err) {
    toast.error('Action failed', toApiError(err).message)
  } finally {
    busy.value = null
  }
}
</script>

<template>
  <div class="grid">
    <div class="quick reveal">
      <button v-for="q in QUICK" :key="q.label" type="button" class="quick__btn" @click="router.push(q.to)">
        <span class="quick__icon"><AppIcon :name="q.icon" :size="16" /></span>{{ q.label }}
      </button>
    </div>

    <div class="stats">
      <AppStat class="reveal" style="--i: 1" label="Students" :value="data?.students.total" icon="students" :loading="loading" :hint="data ? `${data.students.active} active · ${data.students.unassigned} unassigned` : ''" />
      <AppStat class="reveal" style="--i: 2" label="Teachers" :value="data?.users.teachers" icon="book" tone="info" :loading="loading" :hint="data?.users.pendingTeachers ? `${data.users.pendingTeachers} awaiting approval` : 'All approved'" />
      <AppStat class="reveal" style="--i: 3" label="Today's attendance" :value="todayPct" suffix="%" icon="calendar" :tone="todayPct !== null && todayPct < 75 ? 'danger' : 'primary'" :loading="loading" :hint="data ? `${data.today.marked} of ${data.today.students} marked` : ''" />
      <AppStat class="reveal" style="--i: 4" label="Assignments" :value="data?.assignments" icon="edit" tone="accent" :loading="loading" hint="Across all teachers" />
    </div>

    <AppCard class="reveal span-2" style="--i: 5" title="Attendance trend" subtitle="Campus-wide, last 14 school days">
      <template #actions><AppButton size="sm" variant="ghost" icon-right="arrow-right" @click="router.push('/attendance')">Overview</AppButton></template>
      <div v-if="loading"><AppSkeleton height="140px" /></div>
      <AppEmpty v-else-if="!data?.attendanceTrend.length" compact icon="calendar" title="No attendance recorded yet" description="Teachers mark daily registers from their Attendance page." />
      <AppTrend v-else :points="data.attendanceTrend" :threshold="75" />
    </AppCard>

    <AppCard class="reveal" style="--i: 6" title="Pending approvals" subtitle="New teachers waiting">
      <template #actions><AppButton size="sm" variant="ghost" icon-right="arrow-right" @click="router.push('/users?status=pending')">All</AppButton></template>
      <div v-if="loading" class="rows"><AppSkeleton v-for="i in 2" :key="i" height="44px" /></div>
      <AppEmpty v-else-if="!data?.pendingTeachers.length" compact icon="user-check" title="Nothing pending" />
      <TransitionGroup v-else tag="ul" name="list" class="rows">
        <li v-for="t in data.pendingTeachers" :key="t._id" class="row row--stack">
          <div class="row__line"><AppAvatar :name="t.name" :size="32" /><div class="row__text"><p class="row__title">{{ t.name }}</p><p class="row__sub truncate">{{ t.department || t.email }}</p></div></div>
          <div class="row__actions">
            <AppButton size="sm" variant="secondary" icon="x" :disabled="busy === t._id" @click="decide(t._id, 'disabled')">Decline</AppButton>
            <AppButton size="sm" icon="check" :loading="busy === t._id" @click="decide(t._id, 'active')">Approve</AppButton>
          </div>
        </li>
      </TransitionGroup>
    </AppCard>

    <AppCard class="reveal span-2" style="--i: 7" title="Teachers" subtitle="Workload and today's register">
      <template #actions><AppButton size="sm" variant="ghost" icon-right="arrow-right" @click="router.push('/users?role=teacher')">Manage</AppButton></template>
      <div v-if="loading" class="rows"><AppSkeleton v-for="i in 3" :key="i" height="44px" /></div>
      <AppEmpty v-else-if="!data?.teachers.length" compact icon="book" title="No teachers yet" description="Add a teacher from the Users page." />
      <ul v-else class="rows">
        <li v-for="t in data.teachers" :key="t._id" class="row">
          <AppAvatar :name="t.name" />
          <div class="row__text"><p class="row__title">{{ t.name }}</p><p class="row__sub">{{ t.department || 'No department' }}</p></div>
          <span class="metric"><b>{{ t.students }}</b><small>students</small></span>
          <span class="metric"><b>{{ t.markedToday ? percent(t.todayAttendance) : '—' }}</b><small>today</small></span>
          <AppBadge v-if="t.students === 0" tone="neutral" dot>No students</AppBadge>
          <AppBadge v-else :tone="t.markedToday ? 'success' : 'warning'" dot>{{ t.markedToday ? 'Marked today' : 'Not marked' }}</AppBadge>
        </li>
      </ul>
    </AppCard>

    <AppCard class="reveal" style="--i: 8" title="Students by course">
      <div v-if="loading" class="rows"><AppSkeleton v-for="i in 4" :key="i" height="28px" /></div>
      <AppEmpty v-else-if="!data?.students.byCourse.length" compact icon="book" title="No students yet" />
      <ul v-else class="bars">
        <li v-for="(c, i) in data.students.byCourse" :key="c.course" class="bars__item" :style="{ '--i': i }">
          <div class="bars__head"><span class="truncate">{{ c.course }}</span><span class="mono text-3">{{ c.count }}</span></div>
          <div class="bars__track"><span class="bars__fill" :style="{ width: `${(c.count / maxCourse) * 100}%` }" /></div>
        </li>
      </ul>
    </AppCard>

    <AppCard class="reveal span-2" style="--i: 9" title="Recently added students">
      <template #actions><AppButton size="sm" variant="ghost" icon-right="arrow-right" @click="router.push('/students')">All students</AppButton></template>
      <div v-if="loading" class="rows"><AppSkeleton v-for="i in 3" :key="i" height="44px" /></div>
      <AppEmpty v-else-if="!data?.recentStudents.length" compact icon="students" title="No students yet"><AppButton icon="plus" @click="router.push('/students?new=1')">Add student</AppButton></AppEmpty>
      <ul v-else class="rows">
        <li v-for="s in data.recentStudents" :key="s._id" class="row row--link" @click="router.push(`/students/${s._id}`)">
          <AppAvatar :name="s.user.name" />
          <div class="row__text"><p class="row__title">{{ s.user.name }} <span class="mono text-3 text-xs">{{ s.rollNumber }}</span></p><p class="row__sub truncate">{{ s.course }} · {{ ordinalYear(s.year) }}</p></div>
          <AppBadge v-if="s.assignedTeacher" tone="info">{{ s.assignedTeacher.name }}</AppBadge>
          <AppBadge v-else tone="warning">Unassigned</AppBadge>
          <span class="row__meta text-3 text-xs">{{ relativeTime(s.createdAt) }}</span>
        </li>
      </ul>
    </AppCard>

    <NoticeList class="reveal" style="--i: 10" :items="data?.announcements" :loading="loading" />
  </div>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--sp-5); }
.stats { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--sp-4); }
.span-2 { grid-column: span 2; }
.quick { grid-column: 1 / -1; display: flex; gap: var(--sp-2); flex-wrap: wrap; }
.quick__btn { display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px 8px 8px; border-radius: var(--r-full); background: var(--surface); border: 1px solid var(--line); font-size: var(--text-sm); font-weight: 600; color: var(--text-2); transition: all var(--dur-fast) var(--ease); }
.quick__btn:hover { border-color: var(--primary); color: var(--primary-text); transform: translateY(-1px); box-shadow: var(--shadow-sm); }
.quick__icon { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; background: var(--primary-soft); color: var(--primary-text); }
.rows { display: flex; flex-direction: column; gap: var(--sp-2); position: relative; }
.row { display: flex; align-items: center; gap: var(--sp-3); padding: var(--sp-3); border-radius: var(--r-md); transition: background var(--dur-fast); }
.row--link { cursor: pointer; }
.row--link:hover { background: var(--surface-2); }
.row--stack { flex-direction: column; align-items: stretch; border: 1px solid var(--line); }
.row__line { display: flex; align-items: center; gap: var(--sp-3); }
.row__text { flex: 1; min-width: 0; }
.row__title { font-weight: 600; font-size: var(--text-sm); }
.row__sub { font-size: var(--text-xs); color: var(--text-3); }
.row__actions { display: flex; gap: var(--sp-2); justify-content: flex-end; }
.row__meta { white-space: nowrap; }
.metric { display: flex; flex-direction: column; align-items: flex-end; min-width: 64px; }
.metric b { font-family: var(--font-display); font-size: var(--text-lg); line-height: 1; }
.metric small { font-size: 10px; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.06em; }
.bars { display: flex; flex-direction: column; gap: var(--sp-3); }
.bars__item { animation: fade-up var(--dur-slow) var(--ease-out) both; animation-delay: calc(var(--i) * 60ms); }
.bars__head { display: flex; justify-content: space-between; gap: var(--sp-3); font-size: var(--text-sm); font-weight: 500; margin-bottom: 6px; }
.bars__track { height: 8px; border-radius: var(--r-full); background: var(--surface-3); overflow: hidden; }
.bars__fill { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--primary), var(--pine-500)); transition: width var(--dur-slow) var(--ease-out); }
@media (max-width: 1100px) { .stats { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 900px) { .grid { grid-template-columns: 1fr; } .span-2 { grid-column: auto; } .row__meta { display: none; } .metric { display: none; } }
@media (max-width: 480px) { .stats { grid-template-columns: 1fr; } }
</style>
