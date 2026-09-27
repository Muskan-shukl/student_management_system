<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AppModal from '@/ui/AppModal.vue'
import AppInput from '@/ui/AppInput.vue'
import AppSelect from '@/ui/AppSelect.vue'
import AppButton from '@/ui/AppButton.vue'
import AppIcon from '@/ui/AppIcon.vue'
import { useForm } from '@/core/composables/useForm'
import { useToast } from '@/core/composables/useToast'
import { useAuthStore } from '@/core/stores/auth'
import { DAYS, type TimetableSlot, type UserSummary } from '@/core/api/types'
import { DAY_LABEL } from '@/core/utils/format'
import { YEAR_OPTIONS } from '@/core/utils/constants'
import { usersApi } from '@/modules/users/api'
import { timetableApi } from '../api'
import { slotSchema } from '../schemas'

const props = defineProps<{ open: boolean; item?: TimetableSlot | null; defaults: { course: string; year: number } }>()
const emit = defineEmits<{ close: []; saved: [slot: TimetableSlot] }>()
const toast = useToast()
const auth = useAuthStore()
const isEdit = computed(() => Boolean(props.item))

const teachers = ref<UserSummary[]>([])
onMounted(async () => { if (auth.isAdmin) try { teachers.value = (await usersApi.teachers()).data } catch { /* optional */ } })
const teacherOptions = computed(() => [{ value: '', label: 'No teacher' }, ...teachers.value.map((t) => ({ value: t._id, label: t.name }))])
const dayOptions = DAYS.map((d) => ({ value: d, label: DAY_LABEL[d]! }))

const form = useForm(slotSchema, { course: '', year: 1, day: 'mon', startTime: '09:00', endTime: '10:00', subject: '', room: '', teacher: '' })
watch(() => props.open, (open) => {
  if (!open) return
  const s = props.item
  form.reset(s
    ? { course: s.course, year: s.year, day: s.day, startTime: s.startTime, endTime: s.endTime, subject: s.subject, room: s.room ?? '', teacher: s.teacher?._id ?? '' }
    : { course: props.defaults.course, year: props.defaults.year, teacher: auth.isTeacher ? auth.user!._id : '' })
})

const submit = form.handleSubmit(async (data) => {
  const { data: saved } = isEdit.value ? await timetableApi.update(props.item!._id, data) : await timetableApi.create(data)
  toast.success(isEdit.value ? 'Class updated' : 'Class added')
  emit('saved', saved)
})
</script>

<template>
  <AppModal :open="open" :title="isEdit ? 'Edit class' : 'Add a class'" @close="emit('close')">
    <form id="slot-form" class="form" novalidate @submit.prevent="submit">
      <Transition name="fade"><div v-if="form.formError.value" class="alert"><AppIcon name="alert" :size="16" />{{ form.formError.value }}</div></Transition>
      <div class="grid">
        <AppInput v-model="form.values.course" label="Course" required :error="form.touched.course ? form.errors.course : ''" @blur="form.validateField('course')" />
        <AppSelect v-model="form.values.year" label="Year" :options="YEAR_OPTIONS" />
      </div>
      <AppInput v-model="form.values.subject" label="Subject" placeholder="Data Structures" required :error="form.touched.subject ? form.errors.subject : ''" @blur="form.validateField('subject')" />
      <div class="grid3">
        <AppSelect v-model="form.values.day" label="Day" :options="dayOptions" />
        <AppInput v-model="form.values.startTime" label="Starts" type="time" required :error="form.touched.startTime ? form.errors.startTime : ''" @blur="form.validateField('startTime')" />
        <AppInput v-model="form.values.endTime" label="Ends" type="time" required :error="form.touched.endTime ? form.errors.endTime : ''" @blur="form.validateField('endTime')" />
      </div>
      <div class="grid">
        <AppInput v-model="form.values.room" label="Room (optional)" placeholder="B-104" :error="form.touched.room ? form.errors.room : ''" />
        <AppSelect v-if="auth.isAdmin" v-model="form.values.teacher" label="Teacher" :options="teacherOptions" :error="form.errors.teacher" />
      </div>
    </form>
    <template #footer>
      <AppButton variant="secondary" @click="emit('close')">Cancel</AppButton>
      <AppButton type="submit" form="slot-form" :loading="form.submitting.value" :icon="isEdit ? 'check' : 'plus'">{{ isEdit ? 'Save' : 'Add class' }}</AppButton>
    </template>
  </AppModal>
</template>

<style scoped>
.form { display: flex; flex-direction: column; gap: var(--sp-4); }
.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--sp-4); align-items: start; }
.grid3 { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: var(--sp-4); align-items: start; }
.alert { display: flex; align-items: center; gap: var(--sp-2); padding: var(--sp-3) var(--sp-4); background: var(--danger-soft); color: var(--danger-text); border-radius: var(--r-md); font-size: var(--text-sm); font-weight: 500; }
@media (max-width: 560px) { .grid, .grid3 { grid-template-columns: 1fr; } }
</style>
