<script setup lang="ts">
import { watch } from 'vue'
import AppInput from '@/ui/AppInput.vue'
import AppTextarea from '@/ui/AppTextarea.vue'
import AppButton from '@/ui/AppButton.vue'
import AppIcon from '@/ui/AppIcon.vue'
import { useForm } from '@/core/composables/useForm'
import { useToast } from '@/core/composables/useToast'
import type { Student } from '@/core/api/types'
import { studentsApi } from '../api'
import { academicSchema, gradeSchema } from '../schemas'

const props = defineProps<{ student: Student }>()
const emit = defineEmits<{ saved: [student: Student]; cancel: [] }>()
const toast = useToast()

const form = useForm(academicSchema, {
  grades: props.student.grades.map((g) => ({ ...g })),
  remarks: props.student.remarks ?? '',
})
watch(() => props.student, (s) => form.reset({ grades: s.grades.map((g) => ({ ...g })), remarks: s.remarks ?? '' }))

const addGrade = () => form.values.grades.push({ subject: '', score: 0, maxScore: 100 })
const removeGrade = (i: number) => form.values.grades.splice(i, 1)

/** Per-row error lookup (the form-level errors map only covers top-level keys). */
const gradeError = (i: number, key: 'subject' | 'score' | 'maxScore') => {
  const result = gradeSchema.safeParse(form.values.grades[i])
  return result.success ? '' : (result.error.issues.find((iss) => iss.path[0] === key)?.message ?? '')
}
const toNumber = (v: string | number | null | undefined) => (v === '' || v === null || v === undefined ? Number.NaN : Number(v))

const submit = form.handleSubmit(async (data) => {
  const { data: student } = await studentsApi.updateAcademic(props.student._id, { grades: data.grades, remarks: data.remarks })
  toast.success('Academic record saved')
  emit('saved', student)
})
</script>

<template>
  <form class="editor" novalidate @submit.prevent="submit">
    <Transition name="fade">
      <div v-if="form.formError.value" class="alert" role="alert"><AppIcon name="alert" :size="16" />{{ form.formError.value }}</div>
    </Transition>

    <section>
      <div class="editor__head">
        <h4>Grades</h4>
        <AppButton size="sm" variant="secondary" icon="plus" :disabled="form.values.grades.length >= 30" @click="addGrade">Add subject</AppButton>
      </div>
      <p v-if="form.errors.grades" class="err">{{ form.errors.grades }}</p>
      <p v-if="!form.values.grades.length" class="text-3 text-sm empty-hint">No subjects yet — add one to start grading.</p>
      <TransitionGroup tag="ul" name="list" class="rows">
        <li v-for="(g, i) in form.values.grades" :key="i" class="grade-row">
          <AppInput v-model="g.subject" placeholder="Subject" :error="form.touched.grades ? gradeError(i, 'subject') : ''" />
          <AppInput :model-value="g.score" type="number" placeholder="Score" min="0" :error="form.touched.grades ? gradeError(i, 'score') : ''" @update:model-value="g.score = toNumber($event)" />
          <span class="grade-row__slash">/</span>
          <AppInput :model-value="g.maxScore" type="number" placeholder="Max" min="1" :error="form.touched.grades ? gradeError(i, 'maxScore') : ''" @update:model-value="g.maxScore = toNumber($event)" />
          <button type="button" class="grade-row__remove" aria-label="Remove subject" @click="removeGrade(i)"><AppIcon name="trash" :size="16" /></button>
        </li>
      </TransitionGroup>
    </section>

    <p class="note"><AppIcon name="info" :size="14" /> Attendance is recorded from the daily register on the Attendance page.</p>

    <section>
      <h4 class="editor__title">Remarks</h4>
      <AppTextarea v-model="form.values.remarks" placeholder="Notes visible to the student and admins…" :rows="3" :maxlength="500" :error="form.touched.remarks ? form.errors.remarks : ''" @blur="form.validateField('remarks')" />
    </section>

    <div class="editor__foot">
      <AppButton variant="secondary" @click="emit('cancel')">Cancel</AppButton>
      <AppButton type="submit" icon="check" :loading="form.submitting.value">Save record</AppButton>
    </div>
  </form>
</template>

<style scoped>
.editor { display: flex; flex-direction: column; gap: var(--sp-6); }
.editor__head { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--sp-3); }
.editor__title { margin-bottom: var(--sp-3); }
.rows { display: flex; flex-direction: column; gap: var(--sp-2); position: relative; }
.grade-row { display: grid; grid-template-columns: 1fr 96px auto 96px auto; gap: var(--sp-2); align-items: start; }
.grade-row__slash { align-self: center; color: var(--text-3); padding-top: 0; }
.grade-row__remove { align-self: center; padding: 8px; color: var(--text-3); border-radius: var(--r-sm); transition: all var(--dur-fast); }
.grade-row__remove:hover { color: var(--danger); background: var(--danger-soft); }
.note { display: flex; align-items: center; gap: 8px; font-size: var(--text-sm); color: var(--text-3); padding: var(--sp-3) var(--sp-4); background: var(--surface-2); border-radius: var(--r-md); }
.editor__foot { display: flex; justify-content: flex-end; gap: var(--sp-2); padding-top: var(--sp-4); border-top: 1px solid var(--line); }
.err { color: var(--danger-text); font-size: var(--text-xs); margin-bottom: var(--sp-2); }
.empty-hint { padding: var(--sp-3); border: 1px dashed var(--line-strong); border-radius: var(--r-md); text-align: center; }
.alert { display: flex; align-items: center; gap: var(--sp-2); padding: var(--sp-3) var(--sp-4); background: var(--danger-soft); color: var(--danger-text); border-radius: var(--r-md); font-size: var(--text-sm); font-weight: 500; }
@media (max-width: 560px) { .grade-row { grid-template-columns: 1fr 70px auto 70px auto; } }
</style>
