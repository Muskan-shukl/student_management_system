<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppButton from '@/ui/AppButton.vue'
import AppCard from '@/ui/AppCard.vue'
import AppAvatar from '@/ui/AppAvatar.vue'
import AppBadge from '@/ui/AppBadge.vue'
import AppEmpty from '@/ui/AppEmpty.vue'
import AppSkeleton from '@/ui/AppSkeleton.vue'
import AppProgress from '@/ui/AppProgress.vue'
import AppIcon from '@/ui/AppIcon.vue'
import GradeList from '../components/GradeList.vue'
import AcademicEditor from '../components/AcademicEditor.vue'
import StudentFormModal from '../components/StudentFormModal.vue'
import AttendanceCalendar from '@/modules/attendance/components/AttendanceCalendar.vue'
import { attendanceApi } from '@/modules/attendance/api'
import { monthInput } from '@/core/utils/format'
import { useAuthStore } from '@/core/stores/auth'
import { useAsync } from '@/core/composables/useAsync'
import { useToast } from '@/core/composables/useToast'
import { useConfirm } from '@/core/composables/useConfirm'
import { toApiError } from '@/core/api/http'
import type { Student } from '@/core/api/types'
import { STUDENT_STATUS_TONE } from '@/core/utils/constants'
import { capitalize, formatDate, ordinalYear, relativeTime } from '@/core/utils/format'
import { studentsApi } from '../api'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const confirm = useConfirm()

const id = route.params.id as string
const { data: student, loading, error, run } = useAsync(async () => (await studentsApi.get(id)).data)
onMounted(run)

const editing = ref(false)
const editModal = ref(false)

const month = ref(monthInput())
const history = useAsync(async (m: string) => (await attendanceApi.student(id, m)).data)
onMounted(() => history.run(month.value))
const shiftMonth = (n: number) => { const [y, m] = month.value.split('-').map(Number); month.value = monthInput(new Date(Date.UTC(y!, m! - 1 + n, 1))); history.run(month.value) }

const onAcademicSaved = (s: Student) => { student.value = s; editing.value = false }
const onProfileSaved = (s: Student) => { student.value = s; editModal.value = false }

const remove = async () => {
  if (!student.value) return
  const ok = await confirm({ title: `Delete ${student.value.user.name}?`, description: 'This permanently removes the student profile and their login.', confirmLabel: 'Delete', tone: 'danger' })
  if (!ok) return
  try {
    await studentsApi.remove(id)
    toast.success('Student deleted')
    router.replace('/students')
  } catch (err) {
    toast.error('Could not delete', toApiError(err).message)
  }
}
</script>

<template>
  <div>
    <button type="button" class="back reveal" @click="router.back()"><AppIcon name="arrow-left" :size="16" /> Back</button>

    <AppEmpty v-if="error" icon="alert" :title="error.status === 404 ? 'Student not found' : 'Something went wrong'" :description="error.status === 404 ? 'This student may have been removed, or is not assigned to you.' : error.message">
      <AppButton variant="secondary" icon="arrow-left" @click="router.push('/students')">All students</AppButton>
    </AppEmpty>

    <template v-else>
      <header class="hero reveal" style="--i: 1">
        <template v-if="loading || !student">
          <AppSkeleton width="72px" height="72px" radius="40%" />
          <div class="hero__text"><AppSkeleton width="220px" height="28px" /><AppSkeleton width="160px" /></div>
        </template>
        <template v-else>
          <AppAvatar :name="student.user.name" :size="72" />
          <div class="hero__text">
            <div class="hero__title">
              <h1>{{ student.user.name }}</h1>
              <AppBadge :tone="STUDENT_STATUS_TONE[student.status]" dot>{{ student.status }}</AppBadge>
            </div>
            <p class="text-2">
              <span class="mono">{{ student.rollNumber }}</span> · {{ student.course }} · {{ ordinalYear(student.year) }}
            </p>
          </div>
          <div v-if="auth.isAdmin" class="hero__actions">
            <AppButton variant="secondary" icon="edit" @click="editModal = true">Edit profile</AppButton>
            <AppButton variant="danger" icon="trash" @click="remove">Delete</AppButton>
          </div>
        </template>
      </header>

      <div class="grid">
        <AppCard class="reveal" style="--i: 2" title="Profile">
          <div v-if="loading || !student"><AppSkeleton :lines="6" height="16px" /></div>
          <dl v-else class="dl">
            <div><dt><AppIcon name="mail" :size="14" /> Email</dt><dd class="truncate">{{ student.user.email }}</dd></div>
            <div><dt><AppIcon name="phone" :size="14" /> Phone</dt><dd>{{ student.user.phone || '—' }}</dd></div>
            <div><dt><AppIcon name="calendar" :size="14" /> Date of birth</dt><dd>{{ formatDate(student.dateOfBirth) }}</dd></div>
            <div><dt><AppIcon name="users" :size="14" /> Gender</dt><dd>{{ student.gender ? capitalize(student.gender) : '—' }}</dd></div>
            <div><dt><AppIcon name="map-pin" :size="14" /> Address</dt><dd>{{ student.address || '—' }}</dd></div>
            <div><dt><AppIcon name="shield" :size="14" /> Guardian</dt><dd>{{ student.guardianName || '—' }}<span v-if="student.guardianPhone" class="text-3"> · {{ student.guardianPhone }}</span></dd></div>
            <div><dt><AppIcon name="book" :size="14" /> Teacher</dt><dd>{{ student.assignedTeacher?.name ?? 'Unassigned' }}</dd></div>
            <div><dt><AppIcon name="clock" :size="14" /> Last login</dt><dd>{{ relativeTime(student.user.lastLoginAt) }}</dd></div>
          </dl>
        </AppCard>

        <AppCard class="reveal span-2" style="--i: 3" title="Academic record" :subtitle="editing ? 'Changes are visible to the student immediately' : undefined">
          <template v-if="!editing && student" #actions>
            <AppButton size="sm" variant="secondary" icon="edit" @click="editing = true">Update</AppButton>
          </template>

          <div v-if="loading || !student"><AppSkeleton :lines="5" height="18px" /></div>
          <AcademicEditor v-else-if="editing" :student="student" @saved="onAcademicSaved" @cancel="editing = false" />
          <div v-else class="record">
            <div class="record__stats">
              <div class="kpi"><AppProgress ring :value="student.attendancePercent" :size="96" label="attendance" /><p class="text-3 text-xs">{{ student.attendance.present }} / {{ student.attendance.total }} classes</p></div>
              <div class="kpi"><AppProgress ring :value="student.averageScore" :size="96" label="avg score" /><p class="text-3 text-xs">{{ student.grades.length }} subject{{ student.grades.length === 1 ? '' : 's' }}</p></div>
            </div>
            <div class="record__grades">
              <AppEmpty v-if="!student.grades.length" compact icon="book" title="No grades recorded" description="Click Update to add subjects and scores.">
                <AppButton size="sm" icon="plus" @click="editing = true">Add grades</AppButton>
              </AppEmpty>
              <GradeList v-else :grades="student.grades" />
              <div v-if="student.remarks" class="remarks"><p class="remarks__label">Remarks</p><p>{{ student.remarks }}</p></div>
            </div>
          </div>
        </AppCard>
      </div>
    </template>

    <AppCard v-if="!error" class="reveal cal" style="--i: 4" title="Attendance record" :subtitle="history.data.value ? `${history.data.value.summary.present + history.data.value.summary.late} of ${history.data.value.summary.total} classes overall` : undefined">
      <template #actions>
        <button type="button" class="mbtn" aria-label="Previous month" @click="shiftMonth(-1)"><AppIcon name="chevron-left" /></button>
        <button type="button" class="mbtn" aria-label="Next month" :disabled="month >= monthInput()" @click="shiftMonth(1)"><AppIcon name="chevron-right" /></button>
      </template>
      <div v-if="history.loading.value || !history.data.value"><AppSkeleton height="240px" /></div>
      <AttendanceCalendar v-else :history="history.data.value" />
    </AppCard>

    <StudentFormModal v-if="auth.isAdmin" :open="editModal" :student="student" @close="editModal = false" @saved="onProfileSaved" />
  </div>
</template>

<style scoped>
.back { display: inline-flex; align-items: center; gap: 6px; color: var(--text-3); font-size: var(--text-sm); font-weight: 500; margin-bottom: var(--sp-4); transition: color var(--dur-fast); }
.back:hover { color: var(--text); }
.hero { display: flex; align-items: center; gap: var(--sp-5); margin-bottom: var(--sp-6); flex-wrap: wrap; }
.hero__text { flex: 1; min-width: 200px; display: flex; flex-direction: column; gap: 6px; }
.hero__title { display: flex; align-items: center; gap: var(--sp-3); flex-wrap: wrap; }
.hero__title h1 { font-size: var(--text-2xl); }
.hero__actions { display: flex; gap: var(--sp-2); }
.grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--sp-5); align-items: start; }
.span-2 { grid-column: span 2; }
.dl { display: flex; flex-direction: column; gap: var(--sp-3); }
.dl > div { display: flex; flex-direction: column; gap: 2px; }
.dl dt { display: flex; align-items: center; gap: 6px; font-size: var(--text-xs); color: var(--text-3); font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
.dl dd { margin: 0; font-size: var(--text-sm); }
.record { display: grid; grid-template-columns: auto 1fr; gap: var(--sp-6); }
.record__stats { display: flex; flex-direction: column; gap: var(--sp-4); padding-right: var(--sp-6); border-right: 1px solid var(--line); }
.kpi { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.remarks { margin-top: var(--sp-5); padding: var(--sp-4); background: var(--accent-soft); border-radius: var(--r-md); font-size: var(--text-sm); }
.cal { margin-top: var(--sp-5); max-width: 560px; }
.mbtn { width: 32px; height: 32px; display: grid; place-items: center; border-radius: var(--r-sm); border: 1px solid var(--line-strong); color: var(--text-2); }
.mbtn:hover:not(:disabled) { background: var(--surface-2); }
.mbtn:disabled { opacity: 0.4; }
.remarks__label { font-size: var(--text-xs); font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--accent-text); margin-bottom: 4px; }
@media (max-width: 900px) { .grid { grid-template-columns: 1fr; } .span-2 { grid-column: auto; } }
@media (max-width: 600px) { .record { grid-template-columns: 1fr; } .record__stats { flex-direction: row; justify-content: center; padding: 0 0 var(--sp-4); border-right: 0; border-bottom: 1px solid var(--line); } }
</style>
