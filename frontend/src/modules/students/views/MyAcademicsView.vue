<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import AppPageHeader from '@/ui/AppPageHeader.vue'
import AppCard from '@/ui/AppCard.vue'
import AppButton from '@/ui/AppButton.vue'
import AppInput from '@/ui/AppInput.vue'
import AppSelect from '@/ui/AppSelect.vue'
import AppTextarea from '@/ui/AppTextarea.vue'
import AppEmpty from '@/ui/AppEmpty.vue'
import AppSkeleton from '@/ui/AppSkeleton.vue'
import AppProgress from '@/ui/AppProgress.vue'
import AppIcon from '@/ui/AppIcon.vue'
import GradeList from '../components/GradeList.vue'
import { useAsync } from '@/core/composables/useAsync'
import { useForm } from '@/core/composables/useForm'
import { useToast } from '@/core/composables/useToast'
import { GENDERS } from '@/core/api/types'
import { capitalize, toDateInput } from '@/core/utils/format'
import { studentsApi } from '../api'
import { compact, myProfileSchema } from '../schemas'

const toast = useToast()
const { data: student, loading, error, run } = useAsync(async () => (await studentsApi.me()).data)
onMounted(run)

const editing = ref(false)
const genderOptions = GENDERS.map((g) => ({ value: g, label: capitalize(g) }))

const form = useForm(myProfileSchema, { phone: '', address: '', dateOfBirth: '', gender: '', guardianName: '', guardianPhone: '' })
watch(student, (s) => {
  if (s) form.reset({ phone: s.user.phone ?? '', address: s.address ?? '', dateOfBirth: toDateInput(s.dateOfBirth), gender: s.gender ?? '', guardianName: s.guardianName ?? '', guardianPhone: s.guardianPhone ?? '' })
})

const submit = form.handleSubmit(async (data) => {
  const { data: updated } = await studentsApi.updateMe(compact(data))
  student.value = updated
  editing.value = false
  toast.success('Profile updated')
})
</script>

<template>
  <div>
    <AppPageHeader title="My academics" description="Your grades, attendance and personal details." />

    <AppEmpty v-if="error" icon="alert" title="Couldn't load your record" :description="error.message">
      <AppButton icon="refresh" variant="secondary" @click="run">Try again</AppButton>
    </AppEmpty>

    <div v-else class="grid">
      <AppCard class="reveal span-2" style="--i: 1" title="Grades" :subtitle="student?.assignedTeacher ? `Graded by ${student.assignedTeacher.name}` : undefined">
        <div v-if="loading || !student"><AppSkeleton :lines="5" height="18px" /></div>
        <AppEmpty v-else-if="!student.grades.length" compact icon="book" title="No grades yet" description="Once your teacher records scores they'll appear here." />
        <GradeList v-else :grades="student.grades" />
        <div v-if="student?.remarks" class="remarks"><p class="remarks__label">Teacher's remarks</p><p>{{ student.remarks }}</p></div>
      </AppCard>

      <AppCard class="reveal" style="--i: 2" title="Attendance">
        <div class="center">
          <AppProgress ring :value="student?.attendancePercent" :size="140" label="present" />
          <p v-if="student?.attendance.total" class="text-2 text-sm">{{ student.attendance.present }} of {{ student.attendance.total }} classes</p>
          <p v-else class="text-3 text-sm">Not recorded yet</p>
        </div>
      </AppCard>

      <AppCard class="reveal span-3" style="--i: 3" title="Personal details" subtitle="Keep your contact information up to date">
        <template v-if="!editing && student" #actions><AppButton size="sm" variant="secondary" icon="edit" @click="editing = true">Edit</AppButton></template>

        <div v-if="loading || !student"><AppSkeleton :lines="4" height="16px" /></div>

        <form v-else-if="editing" class="form" novalidate @submit.prevent="submit">
          <Transition name="fade"><div v-if="form.formError.value" class="alert"><AppIcon name="alert" :size="16" />{{ form.formError.value }}</div></Transition>
          <div class="fgrid">
            <AppInput v-model="form.values.phone" label="Phone" type="tel" placeholder="+91 98765 43210" :error="form.touched.phone ? form.errors.phone : ''" @blur="form.validateField('phone')" />
            <AppInput v-model="form.values.dateOfBirth" label="Date of birth" type="date" :max="toDateInput(new Date().toISOString())" :error="form.touched.dateOfBirth ? form.errors.dateOfBirth : ''" @blur="form.validateField('dateOfBirth')" />
            <AppSelect v-model="form.values.gender" label="Gender" :options="genderOptions" placeholder="Select" />
            <AppInput v-model="form.values.guardianName" label="Guardian name" :error="form.touched.guardianName ? form.errors.guardianName : ''" @blur="form.validateField('guardianName')" />
            <AppInput v-model="form.values.guardianPhone" label="Guardian phone" type="tel" :error="form.touched.guardianPhone ? form.errors.guardianPhone : ''" @blur="form.validateField('guardianPhone')" />
          </div>
          <AppTextarea v-model="form.values.address" label="Address" :rows="2" :maxlength="255" :error="form.touched.address ? form.errors.address : ''" @blur="form.validateField('address')" />
          <div class="form__foot">
            <AppButton variant="secondary" @click="editing = false">Cancel</AppButton>
            <AppButton type="submit" icon="check" :loading="form.submitting.value">Save</AppButton>
          </div>
        </form>

        <dl v-else class="dl">
          <div><dt>Email</dt><dd>{{ student.user.email }}</dd></div>
          <div><dt>Phone</dt><dd>{{ student.user.phone || '—' }}</dd></div>
          <div><dt>Date of birth</dt><dd>{{ student.dateOfBirth ? toDateInput(student.dateOfBirth) : '—' }}</dd></div>
          <div><dt>Gender</dt><dd>{{ student.gender ? capitalize(student.gender) : '—' }}</dd></div>
          <div><dt>Guardian</dt><dd>{{ student.guardianName || '—' }}<span v-if="student.guardianPhone" class="text-3"> · {{ student.guardianPhone }}</span></dd></div>
          <div class="wide"><dt>Address</dt><dd>{{ student.address || '—' }}</dd></div>
        </dl>
      </AppCard>
    </div>
  </div>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--sp-5); align-items: start; }
.span-2 { grid-column: span 2; }
.span-3 { grid-column: 1 / -1; }
.center { display: flex; flex-direction: column; align-items: center; gap: var(--sp-4); }
.remarks { margin-top: var(--sp-5); padding: var(--sp-4); background: var(--accent-soft); border-radius: var(--r-md); font-size: var(--text-sm); }
.remarks__label { font-size: var(--text-xs); font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--accent-text); margin-bottom: 4px; }
.dl { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--sp-4); }
.dl .wide { grid-column: 1 / -1; }
.dl dt { font-size: var(--text-xs); color: var(--text-3); font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 2px; }
.dl dd { margin: 0; font-size: var(--text-sm); }
.form { display: flex; flex-direction: column; gap: var(--sp-4); }
.fgrid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--sp-4); }
.form__foot { display: flex; justify-content: flex-end; gap: var(--sp-2); }
.alert { display: flex; align-items: center; gap: var(--sp-2); padding: var(--sp-3) var(--sp-4); background: var(--danger-soft); color: var(--danger-text); border-radius: var(--r-md); font-size: var(--text-sm); font-weight: 500; }
@media (max-width: 900px) { .grid { grid-template-columns: 1fr; } .span-2 { grid-column: auto; } .dl, .fgrid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 560px) { .dl, .fgrid { grid-template-columns: 1fr; } }
</style>
