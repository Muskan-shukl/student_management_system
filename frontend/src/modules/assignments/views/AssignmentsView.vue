<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import AppPageHeader from '@/ui/AppPageHeader.vue'
import AppButton from '@/ui/AppButton.vue'
import AppBadge from '@/ui/AppBadge.vue'
import AppEmpty from '@/ui/AppEmpty.vue'
import AppSkeleton from '@/ui/AppSkeleton.vue'
import AppIcon from '@/ui/AppIcon.vue'
import AppModal from '@/ui/AppModal.vue'
import AppTextarea from '@/ui/AppTextarea.vue'
import AppProgress from '@/ui/AppProgress.vue'
import AssignmentFormModal from '../components/AssignmentFormModal.vue'
import RosterModal from '../components/RosterModal.vue'
import { useAuthStore } from '@/core/stores/auth'
import { useToast } from '@/core/composables/useToast'
import { useConfirm } from '@/core/composables/useConfirm'
import { useForm } from '@/core/composables/useForm'
import { toApiError, type ApiError } from '@/core/api/http'
import type { MyAssignmentStatus, StudentAssignment, TeacherAssignment } from '@/core/api/types'
import { dueLabel, formatDate } from '@/core/utils/format'
import { assignmentsApi } from '../api'
import { submitSchema } from '../schemas'
import { STATUS_TONE } from '../status'

const auth = useAuthStore()
const toast = useToast()
const confirm = useConfirm()

const loading = ref(true)
const error = ref<ApiError | null>(null)
const studentItems = ref<StudentAssignment[]>([])
const teacherItems = ref<TeacherAssignment[]>([])
const filter = ref<MyAssignmentStatus | ''>('')

const load = async () => {
  loading.value = true
  error.value = null
  try {
    if (auth.isStudent) studentItems.value = (await assignmentsApi.listForStudent(filter.value)).data
    else teacherItems.value = (await assignmentsApi.listForTeacher()).data
  } catch (err) {
    error.value = toApiError(err)
  } finally {
    loading.value = false
  }
}
onMounted(load)
watch(filter, load)

/* teacher */
const form = reactive({ open: false, item: null as TeacherAssignment | null })
const roster = reactive({ open: false, id: null as string | null })
const openCreate = () => { form.item = null; form.open = true }
const openEdit = (a: TeacherAssignment) => { form.item = a; form.open = true }
const onSaved = () => { form.open = false; load() }
const onRosterChanged = (a: TeacherAssignment) => { const i = teacherItems.value.findIndex((x) => x._id === a._id); if (i !== -1) teacherItems.value[i] = { ...teacherItems.value[i]!, stats: a.stats } }
const remove = async (a: TeacherAssignment) => {
  if (!(await confirm({ title: 'Delete this assignment?', description: `${a.title} — submissions will be lost.`, confirmLabel: 'Delete', tone: 'danger' }))) return
  try { await assignmentsApi.remove(a._id); toast.success('Assignment deleted'); load() } catch (err) { toast.error('Could not delete', toApiError(err).message) }
}

/* student */
const submitting = ref<StudentAssignment | null>(null)
const submitForm = useForm(submitSchema, { note: '' })
const openSubmit = (a: StudentAssignment) => { submitForm.reset({ note: a.mySubmission?.note ?? '' }); submitting.value = a }
const doSubmit = submitForm.handleSubmit(async (data) => {
  if (!submitting.value) return
  const { data: updated } = await assignmentsApi.submit(submitting.value._id, data.note)
  const i = studentItems.value.findIndex((x) => x._id === updated._id)
  if (i !== -1) studentItems.value[i] = updated
  submitting.value = null
  toast.success('Marked as submitted', 'Your teacher will check it.')
})

const FILTERS: { value: MyAssignmentStatus | ''; label: string }[] = [
  { value: '', label: 'All' }, { value: 'pending', label: 'Pending' }, { value: 'overdue', label: 'Overdue' }, { value: 'submitted', label: 'Submitted' }, { value: 'checked', label: 'Checked' },
]
const counts = computed(() => ({ pending: studentItems.value.filter((a) => a.myStatus === 'pending' || a.myStatus === 'overdue').length }))
</script>

<template>
  <div>
    <AppPageHeader title="Assignments" :description="auth.isStudent ? 'Homework from your teacher. Mark it submitted when you\'re done.' : auth.isTeacher ? 'Homework for your students, and who has turned it in.' : 'All assignments across teachers.'">
      <template #actions><AppButton v-if="auth.isTeacher" icon="plus" @click="openCreate">New assignment</AppButton></template>
    </AppPageHeader>

    <div v-if="auth.isStudent" class="filters">
      <button v-for="f in FILTERS" :key="f.value" type="button" class="chip" :class="{ 'chip--on': filter === f.value }" @click="filter = f.value">{{ f.label }}</button>
    </div>

    <AppEmpty v-if="error" icon="alert" title="Couldn't load assignments" :description="error.message"><AppButton icon="refresh" variant="secondary" @click="load">Try again</AppButton></AppEmpty>
    <div v-else-if="loading" class="cards"><div v-for="i in 3" :key="i" class="card"><AppSkeleton :lines="3" /></div></div>

    <!-- ===== student ===== -->
    <template v-else-if="auth.isStudent">
      <AppEmpty v-if="!studentItems.length" icon="book" :title="filter ? 'Nothing here' : 'No assignments yet'" :description="filter ? 'Try another filter.' : 'When your teacher sets homework it will appear here.'" />
      <TransitionGroup v-else tag="div" name="list" class="cards">
        <article v-for="(a, i) in studentItems" :key="a._id" class="card reveal" :class="`card--${a.myStatus}`" :style="{ '--i': i }">
          <div class="card__top">
            <span class="card__subject">{{ a.subject }}</span>
            <AppBadge :tone="STATUS_TONE[a.myStatus]" dot>{{ a.myStatus }}</AppBadge>
          </div>
          <h3 class="card__title">{{ a.title }}</h3>
          <p v-if="a.description" class="card__desc">{{ a.description }}</p>
          <div class="card__foot">
            <span class="card__due" :class="{ 'card__due--late': a.myStatus === 'overdue' }"><AppIcon name="calendar" :size="14" /> {{ formatDate(a.dueDate) }} · {{ a.myStatus === 'submitted' || a.myStatus === 'checked' ? 'Done' : dueLabel(a.dueDate) }}</span>
            <span class="text-3 text-xs">by {{ a.teacher.name }}</span>
            <AppButton v-if="a.myStatus === 'pending' || a.myStatus === 'overdue'" size="sm" icon="check" @click="openSubmit(a)">Mark as submitted</AppButton>
            <AppButton v-else-if="a.myStatus === 'submitted'" size="sm" variant="ghost" icon="edit" @click="openSubmit(a)">Edit note</AppButton>
          </div>
        </article>
      </TransitionGroup>
      <p v-if="!loading && counts.pending && !filter" class="hint text-3 text-sm">{{ counts.pending }} still to do.</p>
    </template>

    <!-- ===== teacher / admin ===== -->
    <template v-else>
      <AppEmpty v-if="!teacherItems.length" icon="book" title="No assignments yet" :description="auth.isTeacher ? 'Create the first piece of homework for your students.' : 'Teachers haven\'t created any assignments yet.'">
        <AppButton v-if="auth.isTeacher" icon="plus" @click="openCreate">New assignment</AppButton>
      </AppEmpty>
      <TransitionGroup v-else tag="div" name="list" class="cards">
        <article v-for="(a, i) in teacherItems" :key="a._id" class="card card--link reveal" :style="{ '--i': i }" @click="roster.id = a._id; roster.open = true">
          <div class="card__top">
            <span class="card__subject">{{ a.subject }}<template v-if="a.course"> · {{ a.course }}</template></span>
            <div class="card__actions" @click.stop>
              <button v-if="auth.isTeacher" type="button" class="iconbtn" title="Edit" @click="openEdit(a)"><AppIcon name="edit" :size="16" /></button>
              <button v-if="auth.isTeacher" type="button" class="iconbtn iconbtn--danger" title="Delete" @click="remove(a)"><AppIcon name="trash" :size="16" /></button>
            </div>
          </div>
          <h3 class="card__title">{{ a.title }}</h3>
          <p v-if="!auth.isTeacher" class="text-3 text-xs">by {{ a.teacher.name }}</p>
          <div class="card__stats">
            <AppProgress :value="a.stats.total ? Math.round((a.stats.submitted / a.stats.total) * 100) : 0" />
            <p class="text-2 text-sm"><b>{{ a.stats.submitted }}</b> of {{ a.stats.total }} submitted · <b>{{ a.stats.checked }}</b> checked<span v-if="a.stats.submitted - a.stats.checked" class="tocheck"> · {{ a.stats.submitted - a.stats.checked }} to check</span></p>
          </div>
          <div class="card__foot">
            <span class="card__due"><AppIcon name="calendar" :size="14" /> {{ formatDate(a.dueDate) }} · {{ dueLabel(a.dueDate) }}</span>
            <span class="card__open">View submissions <AppIcon name="arrow-right" :size="14" /></span>
          </div>
        </article>
      </TransitionGroup>
    </template>

    <AssignmentFormModal v-if="auth.isTeacher" :open="form.open" :item="form.item" @close="form.open = false" @saved="onSaved" />
    <RosterModal v-if="!auth.isStudent" :open="roster.open" :assignment-id="roster.id" @close="roster.open = false" @changed="onRosterChanged" />

    <AppModal :open="Boolean(submitting)" title="Mark as submitted" :description="submitting?.title" size="sm" @close="submitting = null">
      <form id="submit-form" novalidate @submit.prevent="doSubmit">
        <AppTextarea v-model="submitForm.values.note" label="Note for your teacher (optional)" placeholder="Link to your work, or where you handed it in" :rows="3" :maxlength="500" :error="submitForm.touched.note ? submitForm.errors.note : ''" />
      </form>
      <template #footer>
        <AppButton variant="secondary" @click="submitting = null">Cancel</AppButton>
        <AppButton type="submit" form="submit-form" icon="check" :loading="submitForm.submitting.value">Submit</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<style scoped>
.filters { display: flex; gap: var(--sp-2); flex-wrap: wrap; margin-bottom: var(--sp-5); }
.chip { padding: 7px 14px; border-radius: var(--r-full); border: 1px solid var(--line-strong); background: var(--surface); font-size: var(--text-sm); font-weight: 500; color: var(--text-2); transition: all var(--dur-fast); }
.chip--on { background: var(--primary); color: var(--on-primary); border-color: var(--primary); }
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: var(--sp-4); position: relative; }
.card { display: flex; flex-direction: column; gap: var(--sp-3); padding: var(--sp-5); background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-lg); box-shadow: var(--shadow-xs); transition: transform var(--dur) var(--ease), box-shadow var(--dur); }
.card--link { cursor: pointer; }
.card--link:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.card--overdue { border-color: var(--danger); }
.card--checked { opacity: 0.85; }
.card__top { display: flex; align-items: center; justify-content: space-between; gap: var(--sp-3); }
.card__subject { font-size: var(--text-xs); font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--primary-text); }
.card__title { font-size: var(--text-lg); }
.card__desc { font-size: var(--text-sm); color: var(--text-2); line-height: 1.55; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.card__stats { display: flex; flex-direction: column; gap: 6px; }
.tocheck { color: var(--accent-text); font-weight: 600; }
.card__foot { margin-top: auto; display: flex; align-items: center; gap: var(--sp-3); flex-wrap: wrap; padding-top: var(--sp-3); border-top: 1px solid var(--line); }
.card__due { display: inline-flex; align-items: center; gap: 6px; font-size: var(--text-xs); color: var(--text-2); flex: 1; }
.card__due--late { color: var(--danger-text); font-weight: 600; }
.card__open { display: inline-flex; align-items: center; gap: 4px; font-size: var(--text-xs); font-weight: 600; color: var(--primary-text); }
.card__actions { display: flex; gap: 2px; }
.iconbtn { padding: 6px; border-radius: var(--r-sm); color: var(--text-3); transition: all var(--dur-fast); }
.iconbtn:hover { color: var(--primary-text); background: var(--primary-soft); }
.iconbtn--danger:hover { color: var(--danger-text); background: var(--danger-soft); }
.hint { margin-top: var(--sp-4); }
</style>
