<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppPageHeader from '@/ui/AppPageHeader.vue'
import AppCard from '@/ui/AppCard.vue'
import AppButton from '@/ui/AppButton.vue'
import AppInput from '@/ui/AppInput.vue'
import AppSelect from '@/ui/AppSelect.vue'
import AppTable, { type Column } from '@/ui/AppTable.vue'
import AppAvatar from '@/ui/AppAvatar.vue'
import AppBadge from '@/ui/AppBadge.vue'
import AppEmpty from '@/ui/AppEmpty.vue'
import AppPagination from '@/ui/AppPagination.vue'
import AppProgress from '@/ui/AppProgress.vue'
import AppIcon from '@/ui/AppIcon.vue'
import AppModal from '@/ui/AppModal.vue'
import StudentFormModal from '../components/StudentFormModal.vue'
import { useAuthStore } from '@/core/stores/auth'
import { useToast } from '@/core/composables/useToast'
import { useConfirm } from '@/core/composables/useConfirm'
import { useDebouncedRef } from '@/core/composables/useDebouncedRef'
import { toApiError, type ApiError } from '@/core/api/http'
import { STUDENT_STATUSES, type Meta, type Student, type UserSummary } from '@/core/api/types'
import { usersApi } from '@/modules/users/api'
import { STUDENT_STATUS_TONE, YEAR_OPTIONS } from '@/core/utils/constants'
import { capitalize, percent } from '@/core/utils/format'
import { studentsApi } from '../api'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const confirm = useConfirm()

const rows = ref<Student[]>([])
const meta = ref<Meta | null>(null)
const loading = ref(true)
const error = ref<ApiError | null>(null)
const courses = ref<string[]>([])

const search = ref('')
const debouncedSearch = useDebouncedRef(search)
const filters = reactive({ course: '', status: '' as '' | (typeof STUDENT_STATUSES)[number], year: '' as '' | number, unassigned: false })
const page = ref(1)
const hasFilters = computed(() => Boolean(search.value || filters.course || filters.status || filters.year || filters.unassigned))

const modal = reactive({ open: false, student: null as Student | null })

/* ---- selection & bulk actions (admin) ---- */
const selected = ref<Set<string>>(new Set())
const allOnPage = computed(() => rows.value.length > 0 && rows.value.every((r) => selected.value.has(r._id)))
const toggleAll = () => { selected.value = allOnPage.value ? new Set() : new Set(rows.value.map((r) => r._id)) }
const toggle = (id: string) => { const s = new Set(selected.value); s.has(id) ? s.delete(id) : s.add(id); selected.value = s }
const bulk = reactive({ open: false, teacher: '', busy: false })
const teachers = ref<UserSummary[]>([])
const teacherOptions = computed(() => [{ value: '', label: 'No teacher (unassign)' }, ...teachers.value.map((t) => ({ value: t._id, label: `${t.name}${t.department ? ` · ${t.department}` : ''}` }))])
const openBulk = async () => { bulk.teacher = ''; bulk.open = true; if (!teachers.value.length) try { teachers.value = (await usersApi.teachers()).data } catch { /* empty */ } }
const applyBulk = async () => {
  bulk.busy = true
  try {
    const { message } = await studentsApi.bulkAssign([...selected.value], bulk.teacher || null)
    toast.success(message)
    bulk.open = false
    selected.value = new Set()
    load()
  } catch (err) {
    toast.error('Could not update', toApiError(err).message)
  } finally {
    bulk.busy = false
  }
}
const exporting = ref(false)
const exportCsv = async () => {
  exporting.value = true
  try { await studentsApi.exportCsv({ search: debouncedSearch.value, ...filters }); toast.success('Export ready', 'Check your downloads.') } catch (err) { toast.error('Export failed', toApiError(err).message) } finally { exporting.value = false }
}

const load = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await studentsApi.list({ page: page.value, limit: 10, search: debouncedSearch.value, ...filters })
    rows.value = res.data
    meta.value = res.meta ?? null
  } catch (err) {
    error.value = toApiError(err)
  } finally {
    loading.value = false
  }
}

watch([debouncedSearch, () => ({ ...filters })], () => { page.value = 1; load() })
watch(page, load)

onMounted(async () => {
  if (route.query.new) { modal.open = true; router.replace({ query: {} }) }
  await load()
  try { courses.value = (await studentsApi.courses()).data } catch { /* filter stays empty */ }
})

const clearFilters = () => { search.value = ''; Object.assign(filters, { course: '', status: '', year: '', unassigned: false }) }

const openCreate = () => { modal.student = null; modal.open = true }
const openEdit = (s: Student) => { modal.student = s; modal.open = true }
const onSaved = () => { modal.open = false; load() }

const remove = async (s: Student) => {
  const ok = await confirm({ title: `Delete ${s.user.name}?`, description: 'This permanently removes the student profile and their login. This cannot be undone.', confirmLabel: 'Delete', tone: 'danger' })
  if (!ok) return
  try {
    await studentsApi.remove(s._id)
    toast.success('Student deleted')
    if (rows.value.length === 1 && page.value > 1) page.value -= 1
    else load()
  } catch (err) {
    toast.error('Could not delete', toApiError(err).message)
  }
}

const columns = computed<Column[]>(() => [
  ...(auth.isAdmin ? [{ key: 'select', label: '', width: '1%' }] : []),
  { key: 'student', label: 'Student' },
  { key: 'course', label: 'Course', hideBelow: 'sm' },
  ...(auth.isAdmin ? [{ key: 'teacher', label: 'Teacher', hideBelow: 'md' as const }] : []),
  { key: 'attendance', label: 'Attendance', width: '150px', hideBelow: 'md' },
  { key: 'score', label: 'Avg. score', width: '100px', align: 'right', hideBelow: 'lg' },
  { key: 'status', label: 'Status', width: '110px', hideBelow: 'sm' },
  { key: 'actions', label: '', width: '1%', align: 'right' },
])
const courseOptions = computed(() => [{ value: '', label: 'All courses' }, ...courses.value.map((c) => ({ value: c, label: c }))])
const statusOptions = [{ value: '', label: 'All statuses' }, ...STUDENT_STATUSES.map((s) => ({ value: s, label: capitalize(s) }))]
const yearOptions = [{ value: '', label: 'All years' }, ...YEAR_OPTIONS]
</script>

<template>
  <div>
    <AppPageHeader :title="auth.isAdmin ? 'Students' : 'My students'" :description="auth.isAdmin ? 'Every student on campus, with their teacher and progress.' : 'Students assigned to you. Open one to update grades and attendance.'">
      <template #actions>
        <AppButton variant="secondary" icon="arrow-right" :loading="exporting" @click="exportCsv">Export CSV</AppButton>
        <AppButton v-if="auth.isAdmin" icon="plus" @click="openCreate">Add student</AppButton>
      </template>
    </AppPageHeader>

    <AppCard class="reveal" style="--i: 1" flush>
      <div class="toolbar">
        <div class="toolbar__search">
          <AppInput v-model="search" icon="search" placeholder="Search by name, email, roll number…" />
        </div>
        <AppSelect v-model="filters.course" :options="courseOptions" />
        <AppSelect v-model="filters.year" :options="yearOptions" />
        <AppSelect v-model="filters.status" :options="statusOptions" />
        <label v-if="auth.isAdmin" class="check">
          <input v-model="filters.unassigned" type="checkbox" /> <span>Unassigned only</span>
        </label>
        <AppButton v-if="auth.isAdmin && rows.length" variant="ghost" size="sm" :icon="allOnPage ? 'x' : 'check'" @click="toggleAll">{{ allOnPage ? 'Deselect page' : 'Select page' }}</AppButton>
        <AppButton v-if="hasFilters" variant="ghost" size="sm" icon="x" @click="clearFilters">Clear</AppButton>
      </div>

      <Transition name="fade">
        <div v-if="selected.size" class="bulkbar">
          <span class="bulkbar__count"><b>{{ selected.size }}</b> selected</span>
          <AppButton size="sm" icon="users" @click="openBulk">Assign teacher</AppButton>
          <AppButton size="sm" variant="ghost" icon="x" @click="selected = new Set()">Clear</AppButton>
        </div>
      </Transition>

      <AppEmpty v-if="error" icon="alert" title="Couldn't load students" :description="error.message">
        <AppButton icon="refresh" variant="secondary" @click="load">Try again</AppButton>
      </AppEmpty>

      <template v-else>
        <AppTable :columns="columns" :rows="rows" :loading="loading" :row-link="(s) => router.push(`/students/${s._id}`)">
          <template #cell-select="{ row }">
            <label class="chk" @click.stop><input type="checkbox" :checked="selected.has(row._id)" :aria-label="`Select ${row.user.name}`" @change="toggle(row._id)" /></label>
          </template>
          <template #cell-student="{ row }">
            <div class="who">
              <AppAvatar :name="row.user.name" />
              <div class="who__text">
                <p class="who__name">{{ row.user.name }}</p>
                <p class="who__sub mono">{{ row.rollNumber }}</p>
              </div>
            </div>
          </template>
          <template #cell-course="{ row }">
            <p>{{ row.course }}</p>
            <p class="text-3 text-xs">Year {{ row.year }}</p>
          </template>
          <template #cell-teacher="{ row }">
            <span v-if="row.assignedTeacher">{{ row.assignedTeacher.name }}</span>
            <AppBadge v-else tone="warning">Unassigned</AppBadge>
          </template>
          <template #cell-attendance="{ row }">
            <div class="att">
              <AppProgress :value="row.attendancePercent" />
              <span class="mono text-xs text-2">{{ percent(row.attendancePercent) }}</span>
            </div>
          </template>
          <template #cell-score="{ row }">
            <span class="mono">{{ percent(row.averageScore) }}</span>
          </template>
          <template #cell-status="{ row }">
            <AppBadge :tone="STUDENT_STATUS_TONE[row.status]" dot>{{ row.status }}</AppBadge>
          </template>
          <template #cell-actions="{ row }">
            <div class="actions" @click.stop>
              <button type="button" class="iconbtn" title="View" @click="router.push(`/students/${row._id}`)"><AppIcon name="eye" :size="16" /></button>
              <template v-if="auth.isAdmin">
                <button type="button" class="iconbtn" title="Edit" @click="openEdit(row)"><AppIcon name="edit" :size="16" /></button>
                <button type="button" class="iconbtn iconbtn--danger" title="Delete" @click="remove(row)"><AppIcon name="trash" :size="16" /></button>
              </template>
            </div>
          </template>
          <template #empty>
            <AppEmpty v-if="hasFilters" icon="search" title="No students match" description="Try a different search or clear the filters.">
              <AppButton variant="secondary" icon="x" @click="clearFilters">Clear filters</AppButton>
            </AppEmpty>
            <AppEmpty v-else-if="auth.isAdmin" icon="students" title="No students yet" description="Add your first student to get the campus going.">
              <AppButton icon="plus" @click="openCreate">Add student</AppButton>
            </AppEmpty>
            <AppEmpty v-else icon="students" title="No students assigned" description="An administrator will assign students to you. Check back soon." />
          </template>
        </AppTable>
        <AppPagination :meta="meta" @change="page = $event" />
      </template>
    </AppCard>

    <StudentFormModal v-if="auth.isAdmin" :open="modal.open" :student="modal.student" @close="modal.open = false" @saved="onSaved" />

    <AppModal :open="bulk.open" title="Assign a teacher" :description="`${selected.size} student${selected.size === 1 ? '' : 's'} selected`" size="sm" @close="bulk.open = false">
      <AppSelect v-model="bulk.teacher" label="Teacher" :options="teacherOptions" />
      <template #footer>
        <AppButton variant="secondary" @click="bulk.open = false">Cancel</AppButton>
        <AppButton icon="check" :loading="bulk.busy" @click="applyBulk">Apply</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<style scoped>
.toolbar { display: grid; grid-template-columns: minmax(200px, 2fr) repeat(3, minmax(130px, 1fr)) auto auto auto; gap: var(--sp-3); align-items: center; padding: var(--sp-4); border-bottom: 1px solid var(--line); }
.check { display: flex; align-items: center; gap: 8px; font-size: var(--text-sm); color: var(--text-2); white-space: nowrap; cursor: pointer; }
.check input { accent-color: var(--primary); width: 16px; height: 16px; }
.bulkbar { display: flex; align-items: center; gap: var(--sp-3); padding: var(--sp-3) var(--sp-4); background: var(--primary-soft); border-bottom: 1px solid var(--line); }
.bulkbar__count { font-size: var(--text-sm); color: var(--primary-text); flex: 1; }
.chk { display: grid; place-items: center; }
.chk input { width: 16px; height: 16px; accent-color: var(--primary); cursor: pointer; }
.who { display: flex; align-items: center; gap: var(--sp-3); }
.who__name { font-weight: 600; white-space: nowrap; }
.who__sub { font-size: var(--text-xs); color: var(--text-3); white-space: nowrap; }
.att { display: flex; align-items: center; gap: var(--sp-2); }
.att > :first-child { flex: 1; }
.actions { display: flex; gap: 2px; justify-content: flex-end; white-space: nowrap; }
.iconbtn { padding: 7px; border-radius: var(--r-sm); color: var(--text-3); transition: all var(--dur-fast); }
.iconbtn:hover { color: var(--primary-text); background: var(--primary-soft); }
.iconbtn--danger:hover { color: var(--danger-text); background: var(--danger-soft); }
@media (max-width: 1100px) { .toolbar { grid-template-columns: repeat(2, minmax(0, 1fr)); } .toolbar__search { grid-column: 1 / -1; } }
@media (max-width: 560px) { .toolbar { grid-template-columns: 1fr; } }
</style>
