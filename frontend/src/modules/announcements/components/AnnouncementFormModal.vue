<script setup lang="ts">
import { computed, watch } from 'vue'
import AppModal from '@/ui/AppModal.vue'
import AppInput from '@/ui/AppInput.vue'
import AppSelect from '@/ui/AppSelect.vue'
import AppTextarea from '@/ui/AppTextarea.vue'
import AppButton from '@/ui/AppButton.vue'
import AppIcon from '@/ui/AppIcon.vue'
import { useForm } from '@/core/composables/useForm'
import { useToast } from '@/core/composables/useToast'
import { useAuthStore } from '@/core/stores/auth'
import type { Announcement } from '@/core/api/types'
import { announcementsApi } from '../api'
import { announcementSchema } from '../schemas'

const props = defineProps<{ open: boolean; item?: Announcement | null }>()
const emit = defineEmits<{ close: []; saved: [item: Announcement] }>()
const toast = useToast()
const auth = useAuthStore()
const isEdit = computed(() => Boolean(props.item))

const audienceOptions = computed(() => [
  { value: 'all', label: 'Everyone' },
  { value: 'students', label: 'Students only' },
  ...(auth.isAdmin ? [{ value: 'teachers', label: 'Teachers only' }] : []),
])

const form = useForm(announcementSchema, { title: '', body: '', audience: 'all', course: '', pinned: false })
watch(() => props.open, (open) => {
  if (!open) return
  const a = props.item
  form.reset(a ? { title: a.title, body: a.body, audience: a.audience, course: a.course ?? '', pinned: a.pinned } : {})
})

const submit = form.handleSubmit(async (data) => {
  const payload = { ...data, course: data.audience === 'teachers' ? '' : data.course }
  const { data: saved } = isEdit.value ? await announcementsApi.update(props.item!._id, payload) : await announcementsApi.create(payload)
  toast.success(isEdit.value ? 'Announcement updated' : 'Announcement posted')
  emit('saved', saved)
})
</script>

<template>
  <AppModal :open="open" :title="isEdit ? 'Edit announcement' : 'New announcement'" description="Visible on the dashboard of everyone it's addressed to." @close="emit('close')">
    <form id="ann-form" class="form" novalidate @submit.prevent="submit">
      <Transition name="fade"><div v-if="form.formError.value" class="alert"><AppIcon name="alert" :size="16" />{{ form.formError.value }}</div></Transition>
      <AppInput v-model="form.values.title" label="Title" placeholder="Unit test next week" required :error="form.touched.title ? form.errors.title : ''" @blur="form.validateField('title')" />
      <AppTextarea v-model="form.values.body" label="Message" :rows="5" :maxlength="2000" required :error="form.touched.body ? form.errors.body : ''" @blur="form.validateField('body')" />
      <div class="grid">
        <AppSelect v-model="form.values.audience" label="Who sees it" :options="audienceOptions" />
        <AppInput v-if="form.values.audience !== 'teachers'" v-model="form.values.course" label="Only this course (optional)" placeholder="e.g. B.Tech CSE" :error="form.touched.course ? form.errors.course : ''" />
      </div>
      <label v-if="auth.isAdmin" class="check"><input v-model="form.values.pinned" type="checkbox" /> Pin to the top</label>
    </form>
    <template #footer>
      <AppButton variant="secondary" @click="emit('close')">Cancel</AppButton>
      <AppButton type="submit" form="ann-form" :loading="form.submitting.value" :icon="isEdit ? 'check' : 'plus'">{{ isEdit ? 'Save' : 'Post' }}</AppButton>
    </template>
  </AppModal>
</template>

<style scoped>
.form { display: flex; flex-direction: column; gap: var(--sp-4); }
.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--sp-4); align-items: start; }
.check { display: flex; align-items: center; gap: 8px; font-size: var(--text-sm); cursor: pointer; }
.check input { accent-color: var(--primary); width: 16px; height: 16px; }
.alert { display: flex; align-items: center; gap: var(--sp-2); padding: var(--sp-3) var(--sp-4); background: var(--danger-soft); color: var(--danger-text); border-radius: var(--r-md); font-size: var(--text-sm); font-weight: 500; }
@media (max-width: 560px) { .grid { grid-template-columns: 1fr; } }
</style>
