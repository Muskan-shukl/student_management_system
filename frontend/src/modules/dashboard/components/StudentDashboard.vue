<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppCard from '@/ui/AppCard.vue'
import AppStat from '@/ui/AppStat.vue'
import AppProgress from '@/ui/AppProgress.vue'
import AppEmpty from '@/ui/AppEmpty.vue'
import AppAvatar from '@/ui/AppAvatar.vue'
import AppButton from '@/ui/AppButton.vue'
import AppSkeleton from '@/ui/AppSkeleton.vue'
import AppBadge from '@/ui/AppBadge.vue'
import GradeList from '@/modules/students/components/GradeList.vue'
import TodayClasses from './TodayClasses.vue'
import NoticeList from './NoticeList.vue'
import AppIcon from '@/ui/AppIcon.vue'
import { dueLabel, ordinalYear } from '@/core/utils/format'
import { STUDENT_STATUS_TONE } from '@/core/utils/constants'
import type { StudentDashboard } from '../api'

defineProps<{ data: StudentDashboard | null; loading: boolean }>()
const router = useRouter()
</script>

<template>
  <div class="grid">
    <AppCard class="reveal id" style="--i: 1" flush>
      <div v-if="loading" class="id__body"><AppSkeleton :lines="3" /></div>
      <div v-else-if="data?.profile" class="id__body">
        <div class="id__top">
          <p class="id__label">Student ID</p>
          <AppBadge :tone="STUDENT_STATUS_TONE[data.profile.status]" dot>{{ data.profile.status }}</AppBadge>
        </div>
        <p class="id__roll mono">{{ data.profile.rollNumber }}</p>
        <p class="id__course">{{ data.profile.course }}</p>
        <p class="id__year">{{ ordinalYear(data.profile.year) }}</p>
        <div class="id__teacher">
          <template v-if="data.profile.assignedTeacher">
            <AppAvatar :name="data.profile.assignedTeacher.name" :size="30" />
            <div><p class="id__tname">{{ data.profile.assignedTeacher.name }}</p><p class="id__tsub">Your teacher</p></div>
          </template>
          <p v-else class="id__tsub">No teacher assigned yet</p>
        </div>
      </div>
    </AppCard>

    <div class="stats">
      <AppStat class="reveal" style="--i: 2" label="Average score" :value="data?.averageScore" suffix="%" icon="trending" tone="accent" :loading="loading" :hint="data ? `${data.gradedSubjects} subjects graded` : ''" />
      <AppStat class="reveal" style="--i: 3" label="Best subject" :value="data?.bestSubject ? Math.round((data.bestSubject.score / data.bestSubject.maxScore) * 100) : null" suffix="%" icon="award" :loading="loading" :hint="data?.bestSubject?.subject ?? 'No grades yet'" />
    </div>

    <AppCard class="reveal attendance" style="--i: 4" title="Attendance">
      <div class="attendance__body">
        <AppProgress ring :value="data?.attendancePercent" :size="128" label="present" />
        <p v-if="data?.profile?.attendance.total" class="text-2 text-sm">{{ data.profile.attendance.present }} of {{ data.profile.attendance.total }} classes attended</p>
        <p v-else class="text-3 text-sm">Attendance hasn't been recorded yet.</p>
      </div>
    </AppCard>

    <AppCard class="reveal span-2" style="--i: 5" title="Grades">
      <template #actions><AppButton size="sm" variant="ghost" icon-right="arrow-right" @click="router.push('/academics')">Full report</AppButton></template>
      <div v-if="loading"><AppSkeleton :lines="4" height="18px" /></div>
      <AppEmpty v-else-if="!data?.profile?.grades.length" compact icon="book" title="No grades yet" description="Your teacher hasn't published grades for you yet." />
      <GradeList v-else :grades="data.profile.grades" />
    </AppCard>

    <AppCard v-if="data?.profile?.remarks" class="reveal span-3 remarks" style="--i: 6" title="Teacher's remarks">
      <blockquote class="remarks__q">“{{ data.profile.remarks }}”</blockquote>
    </AppCard>

    <TodayClasses class="reveal" style="--i: 7" :slots="data?.todayClasses" :loading="loading" />

    <AppCard class="reveal" style="--i: 8" title="To do" :subtitle="data?.pendingCount ? `${data.pendingCount} assignment${data.pendingCount === 1 ? '' : 's'} pending` : undefined">
      <template #actions><AppButton size="sm" variant="ghost" icon-right="arrow-right" @click="router.push('/assignments')">All</AppButton></template>
      <div v-if="loading"><AppSkeleton :lines="3" /></div>
      <AppEmpty v-else-if="!data?.pendingAssignments.length" compact icon="check" title="All caught up" description="No pending assignments." />
      <ul v-else class="todo">
        <li v-for="a in data.pendingAssignments" :key="a._id" class="todo__item" :class="{ 'todo__item--late': a.overdue }">
          <span class="todo__icon"><AppIcon :name="a.overdue ? 'alert' : 'edit'" :size="14" /></span>
          <div class="todo__body"><p class="todo__title">{{ a.title }}</p><p class="todo__meta">{{ a.subject }} · {{ dueLabel(a.dueDate) }}</p></div>
        </li>
      </ul>
    </AppCard>

    <NoticeList class="reveal" style="--i: 9" :items="data?.announcements" :loading="loading" />
  </div>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--sp-5); }
.stats { display: grid; grid-template-columns: 1fr; gap: var(--sp-4); grid-column: span 2; }
.span-2 { grid-column: span 2; }
.span-3 { grid-column: 1 / -1; }

.id { background: linear-gradient(145deg, var(--pine-800), var(--pine-900)); color: rgba(244, 242, 236, 0.8); border: 0; position: relative; overflow: hidden; }
.id::after { content: ''; position: absolute; right: -40px; top: -40px; width: 180px; height: 180px; border-radius: 50%; background: rgba(232, 163, 61, 0.18); }
.id__body { padding: var(--sp-5); position: relative; z-index: 1; display: flex; flex-direction: column; height: 100%; }
.id__top { display: flex; justify-content: space-between; align-items: center; }
.id__label { font-size: var(--text-xs); letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; }
.id__roll { font-family: var(--font-display); font-size: var(--text-2xl); color: #fff; margin-top: var(--sp-4); }
.id__course { color: #fff; font-weight: 600; margin-top: var(--sp-2); }
.id__year { font-size: var(--text-sm); }
.id__teacher { display: flex; align-items: center; gap: var(--sp-3); margin-top: auto; padding-top: var(--sp-5); }
.id__tname { color: #fff; font-weight: 600; font-size: var(--text-sm); }
.id__tsub { font-size: var(--text-xs); }

.attendance__body { display: flex; flex-direction: column; align-items: center; gap: var(--sp-4); text-align: center; }
.remarks__q { margin: 0; font-family: var(--font-display); font-size: var(--text-lg); font-style: italic; line-height: 1.5; color: var(--text-2); }
.todo { display: flex; flex-direction: column; gap: var(--sp-2); }
.todo__item { display: flex; align-items: center; gap: var(--sp-3); padding: var(--sp-3); border: 1px solid var(--line); border-radius: var(--r-md); }
.todo__item--late { border-color: var(--danger); }
.todo__icon { width: 28px; height: 28px; border-radius: 8px; display: grid; place-items: center; background: var(--surface-3); color: var(--text-2); flex-shrink: 0; }
.todo__item--late .todo__icon { background: var(--danger-soft); color: var(--danger-text); }
.todo__title { font-weight: 600; font-size: var(--text-sm); }
.todo__meta { font-size: var(--text-xs); color: var(--text-3); }

@media (max-width: 900px) { .grid { grid-template-columns: 1fr; } .stats, .span-2 { grid-column: auto; } .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 480px) { .stats { grid-template-columns: 1fr; } }
</style>
