<script setup lang="ts">
import { ref, watch } from 'vue'
import AppModal from '@/ui/AppModal.vue'
import AppButton from '@/ui/AppButton.vue'
import AppAvatar from '@/ui/AppAvatar.vue'
import AppBadge from '@/ui/AppBadge.vue'
import AppSkeleton from '@/ui/AppSkeleton.vue'
import AppEmpty from '@/ui/AppEmpty.vue'
import { useToast } from '@/core/composables/useToast'
import { toApiError } from '@/core/api/http'
import type { SubmissionStatus, TeacherAssignment } from '@/core/api/types'
import { formatDateTime } from '@/core/utils/format'
import { assignmentsApi } from '../api'
import { STATUS_TONE } from '../status'

const props = defineProps<{ open: boolean; assignmentId: string | null }>()
const emit = defineEmits<{ close: []; changed: [item: TeacherAssignment] }>()
const toast = useToast()
const item = ref<TeacherAssignment | null>(null)
const loading = ref(false)
const busy = ref<string | null>(null)

watch(() => [props.open, props.assignmentId], async ([open, id]) => {
  if (!open || !id) return
  loading.value = true
  item.value = null
  try { item.value = (await assignmentsApi.get(id as string)).data } catch (err) { toast.error('Could not load', toApiError(err).message) } finally { loading.value = false }
})

const review = async (studentId: string, status: SubmissionStatus) => {
  if (!item.value) return
  busy.value = studentId
  try {
    item.value = (await assignmentsApi.review(item.value._id, studentId, status)).data
    emit('changed', item.value)
  } catch (err) {
    toast.error('Could not update', toApiError(err).message)
  } finally {
    busy.value = null
  }
}
</script>

<template>
  <AppModal :open="open" :title="item?.title ?? 'Submissions'" :description="item ? `${item.subject} · ${item.stats.submitted} of ${item.stats.total} submitted · ${item.stats.checked} checked` : ''" size="lg" @close="emit('close')">
    <div v-if="loading || !item" class="rows"><AppSkeleton v-for="i in 4" :key="i" height="44px" /></div>
    <AppEmpty v-else-if="!item.roster?.length" compact icon="students" title="No students for this assignment" />
    <ul v-else class="rows">
      <li v-for="r in item.roster" :key="r.student._id" class="row">
        <AppAvatar :name="r.student.name" />
        <div class="row__who">
          <p class="row__name">{{ r.student.name }} <span class="mono text-3 text-xs">{{ r.student.rollNumber }}</span></p>
          <p v-if="r.note" class="row__note">“{{ r.note }}”</p>
          <p v-if="r.submittedAt" class="row__sub">Submitted {{ formatDateTime(r.submittedAt) }}</p>
        </div>
        <AppBadge :tone="STATUS_TONE[r.status]" dot>{{ r.status }}</AppBadge>
        <AppButton v-if="r.status === 'submitted'" size="sm" icon="check" :loading="busy === r.student._id" @click="review(r.student._id, 'checked')">Mark checked</AppButton>
        <AppButton v-else-if="r.status === 'checked'" size="sm" variant="ghost" :loading="busy === r.student._id" @click="review(r.student._id, 'submitted')">Undo</AppButton>
      </li>
    </ul>
  </AppModal>
</template>

<style scoped>
.rows { display: flex; flex-direction: column; gap: var(--sp-2); }
.row { display: flex; align-items: center; gap: var(--sp-3); padding: var(--sp-3); border: 1px solid var(--line); border-radius: var(--r-md); }
.row__who { flex: 1; min-width: 0; }
.row__name { font-weight: 600; font-size: var(--text-sm); }
.row__note { font-size: var(--text-sm); color: var(--text-2); font-style: italic; margin-top: 2px; }
.row__sub { font-size: var(--text-xs); color: var(--text-3); margin-top: 2px; }
@media (max-width: 560px) { .row { flex-wrap: wrap; } }
</style>
