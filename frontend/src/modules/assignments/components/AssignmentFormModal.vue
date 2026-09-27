<script setup lang="ts">
import { computed, watch } from 'vue'
import AppModal from '@/ui/AppModal.vue'
import AppInput from '@/ui/AppInput.vue'
import AppTextarea from '@/ui/AppTextarea.vue'
import AppButton from '@/ui/AppButton.vue'
import AppIcon from '@/ui/AppIcon.vue'
import { useForm } from '@/core/composables/useForm'
import { useToast } from '@/core/composables/useToast'
import type { TeacherAssignment } from '@/core/api/types'
import { toDateInput } from '@/core/utils/format'
import { assignmentsApi } from '../api'
import { assignmentSchema } from '../schemas'

const props = defineProps<{ open: boolean; item?: TeacherAssignment | null }>()
const emit = defineEmits<{ close: []; saved: [item: TeacherAssignment] }>()
const toast = useToast()
const isEdit = computed(() => Boolean(props.item))

const form = useForm(assignmentSchema, { title: '', subject: '', dueDate: '', course: '', description: '' })
watch(() => props.open, (open) => {
  if (!open) return
  const a = props.item
  form.reset(a ? { title: a.title, subject: a.subject, dueDate: toDateInput(a.dueDate), course: a.course ?? '', description: a.description ?? '' } : {})
})

const submit = form.handleSubmit(async (data) => {
  const { data: saved } = isEdit.value ? await assignmentsApi.update(props.item!._id, data) : await assignmentsApi.create(data)
  toast.success(isEdit.value ? 'Assignment updated' : 'Assignment created', isEdit.value ? undefined : `Visible to ${saved.stats.total} student${saved.stats.total === 1 ? '' : 's'}.`)
  emit('saved', saved)
})
</script>

<template>
  <AppModal :open="open" :title="isEdit ? 'Edit assignment' : 'New assignment'" description="Goes to every student assigned to you — or only one course, if you set it." @close="emit('close')">
    <form id="asg-form" class="form" novalidate @submit.prevent="submit">
      <Transition name="fade"><div v-if="form.formError.value" class="alert"><AppIcon name="alert" :size="16" />{{ form.formError.value }}</div></Transition>
      <AppInput v-model="form.values.title" label="Title" placeholder="Implement a linked list" required :error="form.touched.title ? form.errors.title : ''" @blur="form.validateField('title')" />
      <div class="grid">
        <AppInput v-model="form.values.subject" label="Subject" placeholder="Data Structures" required :error="form.touched.subject ? form.errors.subject : ''" @blur="form.validateField('subject')" />
        <AppInput v-model="form.values.dueDate" label="Due date" type="date" required :error="form.touched.dueDate ? form.errors.dueDate : ''" @blur="form.validateField('dueDate')" />
      </div>
      <AppInput v-model="form.values.course" label="Only this course (optional)" placeholder="Leave empty for all your students" :error="form.touched.course ? form.errors.course : ''" />
      <AppTextarea v-model="form.values.description" label="Instructions" :rows="4" :maxlength="2000" placeholder="What should students do, and how should they submit?" :error="form.touched.description ? form.errors.description : ''" @blur="form.validateField('description')" />
    </form>
    <template #footer>
      <AppButton variant="secondary" @click="emit('close')">Cancel</AppButton>
      <AppButton type="submit" form="asg-form" :loading="form.submitting.value" :icon="isEdit ? 'check' : 'plus'">{{ isEdit ? 'Save' : 'Create' }}</AppButton>
    </template>
  </AppModal>
</template>

<style scoped>
.form { display: flex; flex-direction: column; gap: var(--sp-4); }
.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--sp-4); align-items: start; }
.alert { display: flex; align-items: center; gap: var(--sp-2); padding: var(--sp-3) var(--sp-4); background: var(--danger-soft); color: var(--danger-text); border-radius: var(--r-md); font-size: var(--text-sm); font-weight: 500; }
@media (max-width: 560px) { .grid { grid-template-columns: 1fr; } }
</style>
