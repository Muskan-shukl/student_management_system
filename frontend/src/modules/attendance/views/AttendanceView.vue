<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AppPageHeader from '@/ui/AppPageHeader.vue'
import AppCard from '@/ui/AppCard.vue'
import AppButton from '@/ui/AppButton.vue'
import AppInput from '@/ui/AppInput.vue'
import AppAvatar from '@/ui/AppAvatar.vue'
import AppBadge from '@/ui/AppBadge.vue'
import AppEmpty from '@/ui/AppEmpty.vue'
import AppSkeleton from '@/ui/AppSkeleton.vue'
import AppStat from '@/ui/AppStat.vue'
import AppProgress from '@/ui/AppProgress.vue'
import AppIcon from '@/ui/AppIcon.vue'
import AppTable, { type Column } from '@/ui/AppTable.vue'
import { useRouter } from 'vue-router'
import AttendanceCalendar from '../components/AttendanceCalendar.vue'
import { useAuthStore } from '@/core/stores/auth'
import { useAsync } from '@/core/composables/useAsync'
import { useToast } from '@/core/composables/useToast'
import { toApiError } from '@/core/api/http'
import type { AttendanceStatus } from '@/core/api/types'
import { formatDate, monthInput, todayInput } from '@/core/utils/format'
import { attendanceApi } from '../api'

const auth = useAuthStore()
const toast = useToast()
const router = useRouter()

/* ---- teacher: daily sheet ---- */
const date = ref(todayInput())
const draft = ref<Record<string, AttendanceStatus | null>>({})
const saving = ref(false)
const sheet = useAsync(async (d: string) => (await attendanceApi.sheet(d)).data)
const loadSheet = async () => {
  const s = await sheet.run(date.value)
  draft.value = Object.fromEntries((s?.students ?? []).map((st) => [st._id, st.status]))
}
const setAll = (status: AttendanceStatus) => { for (const id of Object.keys(draft.value)) draft.value[id] = status }
const unmarked = computed(() => Object.values(draft.value).filter((v) => !v).length)
const counts = computed(() => {
  const v = Object.values(draft.value)
  return { present: v.filter((s) => s === 'present').length, late: v.filter((s) => s === 'late').length, absent: v.filter((s) => s === 'absent').length }
})
const save = async () => {
  const entries = Object.entries(draft.value).filter(([, s]) => s).map(([student, status]) => ({ student, status: status as AttendanceStatus }))
  if (!entries.length) return toast.error('Nothing to save', 'Mark at least one student.')
  saving.value = true
  try {
    const { data } = await attendanceApi.mark(date.value, entries)
    sheet.data.value = data
    toast.success('Attendance saved', `${formatDate(data.date)} · ${entries.length} students`)
  } catch (err) {
    toast.error('Could not save', toApiError(err).message)
  } finally {
    saving.value = false
  }
}

/* ---- admin: overview ---- */
const ovDate = ref(todayInput())
const overview = useAsync(async (d: string) => (await attendanceApi.overview(d)).data)
const ovPct = computed(() => { const t = overview.data.value?.totals; return t && t.marked ? Math.round(((t.present + t.late) / t.marked) * 100) : null })
const teacherCols: Column[] = [
  { key: 'teacher', label: 'Teacher', width: '180px' },
  { key: 'students', label: 'Students' },
  { key: 'marked', label: 'Marked', width: '140px' },
  { key: 'present', label: 'Present', width: '90px', align: 'right', hideBelow: 'sm' },
  { key: 'late', label: 'Late', width: '80px', align: 'right', hideBelow: 'sm' },
  { key: 'absent', label: 'Absent', width: '90px', align: 'right', hideBelow: 'sm' },
]
const teacherRows = computed(() => (overview.data.value?.teachers ?? []).map((t) => ({ ...t, _id: t.teacher._id })))

/* ---- student: history ---- */
const month = ref(monthInput())
const history = useAsync(async (m: string) => (await attendanceApi.me(m)).data)
const shiftMonth = (n: number) => {
  const [y, m] = month.value.split('-').map(Number)
  month.value = monthInput(new Date(Date.UTC(y!, m! - 1 + n, 1)))
}

onMounted(() => (auth.isTeacher ? loadSheet() : auth.isAdmin ? overview.run(ovDate.value) : history.run(month.value)))
watch(date, loadSheet)
watch(ovDate, (d) => overview.run(d))
watch(month, (m) => history.run(m))

const STATUS: { value: AttendanceStatus; label: string; icon: string }[] = [
  { value: 'present', label: 'Present', icon: 'check' },
  { value: 'late', label: 'Late', icon: 'clock' },
  { value: 'absent', label: 'Absent', icon: 'x' },
]
</script>

<template>
  <div>
    <!-- ============ TEACHER ============ -->
    <template v-if="auth.isTeacher">
      <AppPageHeader title="Attendance" description="Mark today's register, or pick another date to fix an earlier one.">
        <template #actions>
          <div class="datepick"><AppInput v-model="date" type="date" :max="todayInput()" /></div>
        </template>
      </AppPageHeader>

      <AppEmpty v-if="sheet.error.value" icon="alert" title="Couldn't load the register" :description="sheet.error.value.message"><AppButton icon="refresh" variant="secondary" @click="loadSheet">Try again</AppButton></AppEmpty>
      <AppCard v-else flush>
        <div class="bar">
          <div class="bar__info">
            <p class="bar__date">{{ formatDate(date) }}</p>
            <AppBadge v-if="sheet.data.value?.marked" tone="success" dot>Marked</AppBadge>
            <AppBadge v-else-if="sheet.data.value" tone="warning" dot>Not marked yet</AppBadge>
            <span class="text-3 text-sm">{{ counts.present }} present · {{ counts.late }} late · {{ counts.absent }} absent<template v-if="unmarked"> · {{ unmarked }} unmarked</template></span>
          </div>
          <div class="bar__actions">
            <AppButton size="sm" variant="ghost" icon="check" @click="setAll('present')">All present</AppButton>
            <AppButton size="sm" icon="check" :loading="saving" :disabled="!sheet.data.value?.students.length" @click="save">Save register</AppButton>
          </div>
        </div>

        <div v-if="sheet.loading.value" class="rows"><div v-for="i in 4" :key="i" class="row"><AppSkeleton width="60%" /></div></div>
        <AppEmpty v-else-if="!sheet.data.value?.students.length" compact icon="students" title="No students assigned" description="An administrator needs to assign students to you before you can mark attendance." />
        <ul v-else class="rows">
          <li v-for="(s, i) in sheet.data.value.students" :key="s._id" class="row reveal" :style="{ '--i': i }">
            <AppAvatar :name="s.name" />
            <div class="row__who"><p class="row__name">{{ s.name }}</p><p class="row__sub mono">{{ s.rollNumber }} · {{ s.course }}</p></div>
            <div class="seg" role="radiogroup" :aria-label="`Attendance for ${s.name}`">
              <button v-for="o in STATUS" :key="o.value" type="button" role="radio" :aria-checked="draft[s._id] === o.value" class="seg__btn" :class="[`seg__btn--${o.value}`, { 'seg__btn--on': draft[s._id] === o.value }]" @click="draft[s._id] = o.value">
                <AppIcon :name="o.icon" :size="14" /><span>{{ o.label }}</span>
              </button>
            </div>
          </li>
        </ul>
      </AppCard>
    </template>

    <!-- ============ ADMIN ============ -->
    <template v-else-if="auth.isAdmin">
      <AppPageHeader title="Attendance overview" description="Who has marked the register today, and who needs a word.">
        <template #actions><div class="datepick"><AppInput v-model="ovDate" type="date" :max="todayInput()" /></div></template>
      </AppPageHeader>
      <AppEmpty v-if="overview.error.value" icon="alert" title="Couldn't load overview" :description="overview.error.value.message"><AppButton icon="refresh" variant="secondary" @click="overview.run(ovDate)">Try again</AppButton></AppEmpty>
      <div v-else class="ov">
        <div class="ov__stats">
          <AppStat label="Registers marked" :value="overview.data.value?.totals.marked" icon="check" :loading="overview.loading.value" :hint="overview.data.value ? `of ${overview.data.value.totals.students} active students` : ''" />
          <AppStat label="Present today" :value="ovPct" suffix="%" icon="calendar" :tone="ovPct !== null && ovPct < 75 ? 'danger' : 'primary'" :loading="overview.loading.value" :hint="overview.data.value ? `${overview.data.value.totals.present} present · ${overview.data.value.totals.late} late · ${overview.data.value.totals.absent} absent` : ''" />
          <AppStat label="Unassigned students" :value="overview.data.value?.totals.unassigned" icon="alert" tone="accent" :loading="overview.loading.value" hint="Nobody can mark them" />
        </div>

        <AppCard title="By teacher" :subtitle="`Register for ${formatDate(ovDate)}`" flush>
          <AppTable :columns="teacherCols" :rows="teacherRows" :loading="overview.loading.value" :skeleton-rows="3">
            <template #cell-teacher="{ row }">
              <div class="who"><AppAvatar :name="row.teacher.name" :size="32" /><span class="who__name">{{ row.teacher.name }}</span></div>
            </template>
            <template #cell-students="{ row }">
              <div v-if="row.roster?.length" class="who__students">
                <span
                  v-for="st in row.roster"
                  :key="st._id"
                  class="student-chip"
                  :class="`student-chip--${st.status ?? 'none'}`"
                  :title="st.status ? `${st.status[0].toUpperCase()}${st.status.slice(1)} · ${st.rollNumber}` : `Not marked · ${st.rollNumber}`"
                  @click="router.push(`/students/${st._id}`)"
                >{{ st.name }}</span>
              </div>
              <span v-else class="mono">0</span>
            </template>
            <template #cell-marked="{ row }">
              <AppBadge v-if="row.marked === row.students" tone="success" dot>Complete</AppBadge>
              <AppBadge v-else-if="row.marked" tone="warning" dot>{{ row.marked }} / {{ row.students }}</AppBadge>
              <AppBadge v-else tone="danger" dot>Not marked</AppBadge>
            </template>
            <template #cell-present="{ row }"><span class="mono">{{ row.present }}</span></template>
            <template #cell-late="{ row }"><span class="mono">{{ row.late }}</span></template>
            <template #cell-absent="{ row }"><span class="mono">{{ row.absent }}</span></template>
            <template #empty><AppEmpty compact icon="book" title="No teachers with students" description="Assign students to teachers from the Students page." /></template>
          </AppTable>
        </AppCard>

        <AppCard title="Needs attention" subtitle="Overall attendance below 75%">
          <div v-if="overview.loading.value" class="rows"><AppSkeleton v-for="i in 3" :key="i" height="40px" /></div>
          <AppEmpty
            v-else-if="!overview.data.value?.lowAttendance.length"
            compact
            :icon="overview.data.value?.totals.evaluated ? 'check' : 'calendar'"
            :title="overview.data.value?.totals.evaluated ? 'Everyone is above 75%' : 'No attendance history yet'"
            :description="overview.data.value?.totals.evaluated ? '' : 'Nobody has a full attendance record yet — this fills in as teachers mark daily registers.'"
          />
          <ul v-else class="low">
            <li v-for="s in overview.data.value.lowAttendance" :key="s._id" class="low__row" @click="router.push(`/students/${s._id}`)">
              <AppAvatar :name="s.name" :size="32" />
              <div class="low__text"><p class="low__name">{{ s.name }} <span class="mono text-3 text-xs">{{ s.rollNumber }}</span></p><p class="text-3 text-xs">{{ s.course }}<template v-if="s.teacher"> · {{ s.teacher }}</template></p></div>
              <div class="low__bar"><AppProgress :value="s.percent" /></div>
              <span class="mono low__pct">{{ s.percent }}%</span>
            </li>
          </ul>
        </AppCard>
      </div>
    </template>

    <!-- ============ STUDENT ============ -->
    <template v-else>
      <AppPageHeader title="My attendance" description="Your daily record, as marked by your teacher." />
      <AppEmpty v-if="history.error.value" icon="alert" title="Couldn't load attendance" :description="history.error.value.message"><AppButton icon="refresh" variant="secondary" @click="history.run(month)">Try again</AppButton></AppEmpty>
      <div v-else class="grid">
        <div class="stats">
          <AppStat label="Overall attendance" :value="history.data.value?.summary.percent" suffix="%" icon="calendar" :loading="history.loading.value" :hint="history.data.value ? `${history.data.value.summary.present + history.data.value.summary.late} of ${history.data.value.summary.total} classes` : ''" />
          <AppStat label="Late" :value="history.data.value?.summary.late" icon="clock" tone="accent" :loading="history.loading.value" />
          <AppStat label="Absent" :value="history.data.value?.summary.absent" icon="x" tone="danger" :loading="history.loading.value" />
        </div>
        <AppCard>
          <template #header>
            <div class="monthnav">
              <button type="button" class="monthnav__btn" aria-label="Previous month" @click="shiftMonth(-1)"><AppIcon name="chevron-left" /></button>
              <button type="button" class="monthnav__btn" aria-label="Next month" :disabled="month >= monthInput()" @click="shiftMonth(1)"><AppIcon name="chevron-right" /></button>
            </div>
          </template>
          <div v-if="history.loading.value || !history.data.value"><AppSkeleton height="280px" /></div>
          <AttendanceCalendar v-else :history="history.data.value" />
          <div v-if="history.data.value?.summary.percent !== null && history.data.value?.summary.percent !== undefined" class="line">
            <AppProgress :value="history.data.value.summary.percent" />
            <p class="text-3 text-xs">{{ history.data.value.summary.percent >= 75 ? 'You are above the 75% attendance requirement.' : 'Below the 75% requirement — attend the next classes to recover.' }}</p>
          </div>
        </AppCard>
      </div>
    </template>
  </div>
</template>

<style scoped>
.datepick { width: 180px; }
.bar { display: flex; align-items: center; justify-content: space-between; gap: var(--sp-4); flex-wrap: wrap; padding: var(--sp-4) var(--sp-5); border-bottom: 1px solid var(--line); }
.bar__info { display: flex; align-items: center; gap: var(--sp-3); flex-wrap: wrap; }
.bar__date { font-family: var(--font-display); font-weight: 600; font-size: var(--text-lg); }
.bar__actions { display: flex; gap: var(--sp-2); }
.rows { display: flex; flex-direction: column; }
.row { display: flex; align-items: center; gap: var(--sp-3); padding: var(--sp-3) var(--sp-5); border-bottom: 1px solid var(--line); }
.row:last-child { border-bottom: 0; }
.row__who { flex: 1; min-width: 0; }
.row__name { font-weight: 600; font-size: var(--text-sm); }
.row__sub { font-size: var(--text-xs); color: var(--text-3); }
.seg { display: flex; padding: 3px; background: var(--surface-3); border-radius: var(--r-md); gap: 2px; }
.seg__btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: calc(var(--r-md) - 3px); font-size: var(--text-xs); font-weight: 600; color: var(--text-3); transition: all var(--dur-fast) var(--ease); }
.seg__btn:hover { color: var(--text); }
.seg__btn--on { background: var(--surface); box-shadow: var(--shadow-sm); }
.seg__btn--on.seg__btn--present { color: var(--success-text); }
.seg__btn--on.seg__btn--late { color: var(--accent-text); }
.seg__btn--on.seg__btn--absent { color: var(--danger-text); }
.grid { display: grid; grid-template-columns: 300px 1fr; gap: var(--sp-5); align-items: start; }
.ov { display: grid; grid-template-columns: 1.4fr 1fr; gap: var(--sp-5); align-items: start; }
.ov__stats { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--sp-4); }
.who { display: flex; align-items: center; gap: var(--sp-3); }
.who__name { font-weight: 600; }
.who__students { display: flex; flex-wrap: nowrap; gap: 6px; overflow-x: auto; max-width: 260px; padding-bottom: 2px; scrollbar-width: thin; }
.who__students::-webkit-scrollbar { height: 4px; }
.student-chip {
  display: inline-flex; align-items: center; flex-shrink: 0; white-space: nowrap;
  padding: 3px 10px; border-radius: 999px;
  font-size: var(--text-xs); font-weight: 500;
  border: 1px solid var(--line-strong); cursor: pointer;
  background: var(--surface-2); color: var(--text-2);
  transition: background var(--dur-fast);
}
.student-chip:hover { background: var(--surface-3, var(--surface-2)); }
.student-chip--present { background: var(--success-bg, #e6f6ec); color: var(--success-text, #1a7f4b); border-color: transparent; }
.student-chip--late { background: var(--warning-bg, #fdf1de); color: var(--warning-text, #a15c07); border-color: transparent; }
.student-chip--absent { background: var(--danger-bg, #fbe7e7); color: var(--danger-text, #b3261e); border-color: transparent; }
.student-chip--none { color: var(--text-3); }
.low { display: flex; flex-direction: column; gap: var(--sp-2); }
.low__row { display: flex; align-items: center; gap: var(--sp-3); padding: var(--sp-2) var(--sp-3); border-radius: var(--r-md); cursor: pointer; transition: background var(--dur-fast); }
.low__row:hover { background: var(--surface-2); }
.low__text { flex: 1; min-width: 0; }
.low__name { font-weight: 600; font-size: var(--text-sm); }
.low__bar { width: 80px; }
.low__pct { font-size: var(--text-sm); font-weight: 600; color: var(--danger-text); min-width: 40px; text-align: right; }
.stats { display: flex; flex-direction: column; gap: var(--sp-4); }
.monthnav { display: flex; gap: 6px; }
.monthnav__btn { width: 32px; height: 32px; display: grid; place-items: center; border-radius: var(--r-sm); border: 1px solid var(--line-strong); color: var(--text-2); }
.monthnav__btn:hover:not(:disabled) { background: var(--surface-2); }
.monthnav__btn:disabled { opacity: 0.4; }
.line { margin-top: var(--sp-5); display: flex; flex-direction: column; gap: 8px; }
@media (max-width: 900px) { .grid, .ov { grid-template-columns: 1fr; } .stats { display: grid; grid-template-columns: repeat(3, 1fr); } .ov__stats { grid-template-columns: 1fr; } .low__bar { display: none; } }
@media (max-width: 640px) { .row { flex-wrap: wrap; } .seg { width: 100%; } .seg__btn { flex: 1; justify-content: center; } .seg__btn span { display: none; } .stats { grid-template-columns: 1fr; } }
</style>
