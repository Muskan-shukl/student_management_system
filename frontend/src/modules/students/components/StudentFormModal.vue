<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AppModal from '@/ui/AppModal.vue'
import AppInput from '@/ui/AppInput.vue'
import AppSelect from '@/ui/AppSelect.vue'
import AppTextarea from '@/ui/AppTextarea.vue'
import AppButton from '@/ui/AppButton.vue'
import AppIcon from '@/ui/AppIcon.vue'
import PasswordMeter from '@/modules/auth/components/PasswordMeter.vue'
import { useForm } from '@/core/composables/useForm'
import { useToast } from '@/core/composables/useToast'
import { GENDERS, STUDENT_STATUSES, type Student, type UserSummary } from '@/core/api/types'
import { YEAR_OPTIONS } from '@/core/utils/constants'
import { capitalize, toDateInput } from '@/core/utils/format'
import { usersApi } from '@/modules/users/api'
import { studentsApi } from '../api'
import { compact, createStudentSchema, editStudentSchema } from '../schemas'

const props = defineProps<{ open: boolean; student?: Student | null }>()
const emit = defineEmits<{ close: []; saved: [student: Student] }>()
const toast = useToast()

const isEdit = computed(() => Boolean(props.student))
const teachers = ref<UserSummary[]>([])
const teacherOptions = computed(() => [{ value: '', label: 'No teacher' }, ...teachers.value.map((t) => ({ value: t._id, label: `${t.name}${t.department ? ` · ${t.department}` : ''}` }))])
const genderOptions = GENDERS.map((g) => ({ value: g, label: capitalize(g) }))
const statusOptions = STUDENT_STATUSES.map((s) => ({ value: s, label: capitalize(s) }))

const blank = {
  name: '', email: '', password: '', phone: '',
  course: '', year: 1, gender: '' as const, dateOfBirth: '', address: '', guardianName: '', guardianPhone: '',
  assignedTeacher: '', status: 'active' as const,
}
// One form object serves both schemas; the create schema simply ignores `status`.
const createForm = useForm(createStudentSchema, blank)
const editForm = useForm(editStudentSchema, blank)
const form = computed(() => (isEdit.value ? editForm : createForm))

const hydrate = () => {
  const s = props.student
  if (!s) {
    createForm.reset()
    return
  }
  editForm.reset({
    name: s.user.name,
    phone: s.user.phone ?? '',
    course: s.course,
    year: s.year,
    gender: s.gender ?? '',
    dateOfBirth: toDateInput(s.dateOfBirth),
    address: s.address ?? '',
    guardianName: s.guardianName ?? '',
    guardianPhone: s.guardianPhone ?? '',
    assignedTeacher: s.assignedTeacher?._id ?? '',
    status: s.status,
  })
}
watch(() => props.open, (open) => open && hydrate())

onMounted(async () => {
  try {
    teachers.value = (await usersApi.teachers()).data
  } catch {
    /* dropdown simply stays empty */
  }
})

const submitCreate = createForm.handleSubmit(async (data) => {
  const { data: student } = await studentsApi.create(compact(data))
  toast.success('Student added', `${student.user.name} can now sign in.`)
  emit('saved', student)
})
const submitEdit = editForm.handleSubmit(async (data) => {
  const payload = { ...compact(data), assignedTeacher: data.assignedTeacher || null }
  const { data: student } = await studentsApi.update(props.student!._id, payload)
  toast.success('Student updated')
  emit('saved', student)
})
const submit = () => (isEdit.value ? submitEdit() : submitCreate())
</script>

<template>
  <AppModal :open="open" :title="isEdit ? 'Edit student' : 'Add a student'" :description="isEdit ? student?.rollNumber : 'Creates a login for the student along with their profile.'" size="lg" @close="emit('close')">
    <form id="student-form" class="form" novalidate @submit.prevent="submit">
      <Transition name="fade">
        <div v-if="form.formError.value" class="alert" role="alert"><AppIcon name="alert" :size="16" />{{ form.formError.value }}</div>
      </Transition>

      <p class="section">Account</p>
      <div class="grid">
        <AppInput v-model="form.values.name" label="Full name" required maxlength="60" :error="form.touched.name ? form.errors.name : ''" @blur="form.validateField('name')" />
        <AppInput v-model="form.values.phone" label="Phone" type="tel" inputmode="numeric" digits-only placeholder="9876543210" maxlength="10" :error="form.touched.phone ? form.errors.phone : ''" @blur="form.validateField('phone')" />
        <template v-if="!isEdit">
          <AppInput v-model="createForm.values.email" label="Email" type="email" required :error="createForm.touched.email ? createForm.errors.email : ''" @blur="createForm.validateField('email')" />
          <div class="stack">
            <AppInput v-model="createForm.values.password" label="Temporary password" type="password" required hint="Share this with the student; they can change it later." :error="createForm.touched.password ? createForm.errors.password : ''" @blur="createForm.validateField('password')" />
            <PasswordMeter :value="createForm.values.password" />
          </div>
        </template>
      </div>

      <p class="section">Academic</p>
      <div class="grid">
        <AppInput v-model="form.values.course" label="Course" placeholder="B.Tech CSE" required :error="form.touched.course ? form.errors.course : ''" @blur="form.validateField('course')" />
        <AppSelect v-model="form.values.year" label="Year" :options="YEAR_OPTIONS" required />
        <AppSelect v-model="form.values.assignedTeacher" label="Assigned teacher" :options="teacherOptions" :error="form.errors.assignedTeacher" />
        <AppSelect v-if="isEdit" v-model="editForm.values.status" label="Status" :options="statusOptions" />
      </div>

      <p class="section">Personal</p>
      <div class="grid">
        <AppSelect v-model="form.values.gender" label="Gender" :options="genderOptions" placeholder="Select" />
        <AppInput v-model="form.values.dateOfBirth" label="Date of birth" type="date" :max="toDateInput(new Date().toISOString())" :error="form.touched.dateOfBirth ? form.errors.dateOfBirth : ''" @blur="form.validateField('dateOfBirth')" />
        <AppInput v-model="form.values.guardianName" label="Guardian name" maxlength="60" :error="form.touched.guardianName ? form.errors.guardianName : ''" @blur="form.validateField('guardianName')" />
        <AppInput v-model="form.values.guardianPhone" label="Guardian phone" type="tel" inputmode="numeric" digits-only placeholder="9876543210" maxlength="10" :error="form.touched.guardianPhone ? form.errors.guardianPhone : ''" @blur="form.validateField('guardianPhone')" />
      </div>
      <AppTextarea v-model="form.values.address" label="Address" :rows="2" :maxlength="255" :error="form.touched.address ? form.errors.address : ''" @blur="form.validateField('address')" />
    </form>

    <template #footer>
      <AppButton variant="secondary" @click="emit('close')">Cancel</AppButton>
      <AppButton type="submit" form="student-form" :loading="form.submitting.value" :icon="isEdit ? 'check' : 'plus'">{{ isEdit ? 'Save changes' : 'Add student' }}</AppButton>
    </template>
  </AppModal>
</template>

<style scoped>
.form { display: flex; flex-direction: column; gap: var(--sp-4); }
.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--sp-4); align-items: start; }
.stack { display: flex; flex-direction: column; gap: 8px; }
.section { font-size: var(--text-xs); font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-3); margin-top: var(--sp-2); }
.section:first-of-type { margin-top: 0; }
.alert { display: flex; align-items: center; gap: var(--sp-2); padding: var(--sp-3) var(--sp-4); background: var(--danger-soft); color: var(--danger-text); border-radius: var(--r-md); font-size: var(--text-sm); font-weight: 500; }
@media (max-width: 560px) { .grid { grid-template-columns: 1fr; } }
</style>
