<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import AppPageHeader from '@/ui/AppPageHeader.vue'
import AppButton from '@/ui/AppButton.vue'
import AppSelect from '@/ui/AppSelect.vue'
import AppEmpty from '@/ui/AppEmpty.vue'
import AppSkeleton from '@/ui/AppSkeleton.vue'
import WeekGrid from '../components/WeekGrid.vue'
import SlotFormModal from '../components/SlotFormModal.vue'
import { useAuthStore } from '@/core/stores/auth'
import { useAsync } from '@/core/composables/useAsync'
import { useToast } from '@/core/composables/useToast'
import { useConfirm } from '@/core/composables/useConfirm'
import { toApiError } from '@/core/api/http'
import type { Day, TimetableSlot } from '@/core/api/types'
import { YEAR_OPTIONS } from '@/core/utils/constants'
import { ordinalYear } from '@/core/utils/format'
import { studentsApi } from '@/modules/students/api'
import { timetableApi } from '../api'

const auth = useAuthStore()
const toast = useToast()
const confirm = useConfirm()

const courses = ref<string[]>([])
const course = ref('')
const year = ref<number>(1)
const scope = ref<'course' | 'mine'>('course')

const staff = useAsync(async () => (await timetableApi.list(scope.value === 'mine' ? { teacher: auth.user!._id } : { course: course.value, year: year.value })).data)
const mine = useAsync(async () => (await timetableApi.me()).data)

onMounted(async () => {
  if (auth.isStudent) return mine.run()
  try { courses.value = (await studentsApi.courses()).data } catch { /* empty */ }
  course.value = courses.value[0] ?? ''
  if (auth.isTeacher) scope.value = 'mine'
  staff.run()
})
watch([course, year, scope], () => staff.run())

const courseOptions = computed(() => courses.value.map((c) => ({ value: c, label: c })))
const modal = reactive({ open: false, item: null as TimetableSlot | null, day: 'mon' as Day })
const openAdd = (day: Day = 'mon') => { modal.item = null; modal.day = day; modal.open = true }
const openEdit = (s: TimetableSlot) => { modal.item = s; modal.open = true }
const onSaved = () => { modal.open = false; staff.run() }
const remove = async (s: TimetableSlot) => {
  if (!(await confirm({ title: 'Remove this class?', description: `${s.subject} · ${s.startTime}`, confirmLabel: 'Remove', tone: 'danger' }))) return
  try { await timetableApi.remove(s._id); toast.success('Class removed'); staff.run() } catch (err) { toast.error('Could not remove', toApiError(err).message) }
}
const defaults = computed(() => ({ course: course.value, year: year.value }))
</script>

<template>
  <div>
    <!-- ===== student ===== -->
    <template v-if="auth.isStudent">
      <AppPageHeader title="My timetable" :description="mine.data.value ? `${mine.data.value.course} · ${ordinalYear(mine.data.value.year)}` : 'Your weekly class schedule.'" />
      <AppEmpty v-if="mine.error.value" icon="alert" title="Couldn't load timetable" :description="mine.error.value.message"><AppButton icon="refresh" variant="secondary" @click="mine.run()">Try again</AppButton></AppEmpty>
      <div v-else-if="mine.loading.value || !mine.data.value" class="skel"><AppSkeleton v-for="i in 6" :key="i" height="180px" /></div>
      <AppEmpty v-else-if="!mine.data.value.slots.length" icon="calendar" title="No timetable yet" description="Your school hasn't published a schedule for your course and year." />
      <WeekGrid v-else :slots="mine.data.value.slots" :today="mine.data.value.today" />
    </template>

    <!-- ===== admin / teacher ===== -->
    <template v-else>
      <AppPageHeader title="Timetable" :description="auth.isAdmin ? 'Weekly schedule for each course and year.' : 'Your classes, or the full schedule for a course.'">
        <template #actions>
          <div class="controls">
            <div v-if="auth.isTeacher" class="seg">
              <button type="button" class="seg__btn" :class="{ 'seg__btn--on': scope === 'mine' }" @click="scope = 'mine'">My classes</button>
              <button type="button" class="seg__btn" :class="{ 'seg__btn--on': scope === 'course' }" @click="scope = 'course'">By course</button>
            </div>
            <template v-if="scope === 'course'">
              <AppSelect v-model="course" :options="courseOptions" placeholder="Course" />
              <AppSelect v-model="year" :options="YEAR_OPTIONS" />
            </template>
            <AppButton icon="plus" @click="openAdd()">Add class</AppButton>
          </div>
        </template>
      </AppPageHeader>
      <AppEmpty v-if="staff.error.value" icon="alert" title="Couldn't load timetable" :description="staff.error.value.message"><AppButton icon="refresh" variant="secondary" @click="staff.run()">Try again</AppButton></AppEmpty>
      <div v-else-if="staff.loading.value || !staff.data.value" class="skel"><AppSkeleton v-for="i in 6" :key="i" height="180px" /></div>
      <AppEmpty v-else-if="!staff.data.value.slots.length && scope === 'course' && !course" icon="calendar" title="No courses yet" description="Add students first — their courses will appear here." />
      <WeekGrid v-else :slots="staff.data.value.slots" :today="staff.data.value.today" editable @add="openAdd" @edit="openEdit" @remove="remove" />
      <SlotFormModal :open="modal.open" :item="modal.item" :defaults="defaults" @close="modal.open = false" @saved="onSaved" />
    </template>
  </div>
</template>

<style scoped>
.controls { display: flex; gap: var(--sp-2); align-items: center; flex-wrap: wrap; }
.controls :deep(.sel) { height: 40px; min-width: 150px; }
.seg { display: flex; padding: 3px; background: var(--surface-3); border-radius: var(--r-md); }
.seg__btn { padding: 6px 12px; border-radius: calc(var(--r-md) - 3px); font-size: var(--text-sm); font-weight: 600; color: var(--text-3); transition: all var(--dur-fast); }
.seg__btn--on { background: var(--surface); color: var(--text); box-shadow: var(--shadow-sm); }
.skel { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: var(--sp-4); }
</style>
