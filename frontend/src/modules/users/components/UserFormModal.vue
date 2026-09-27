<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppModal from '@/ui/AppModal.vue'
import AppInput from '@/ui/AppInput.vue'
import AppSelect from '@/ui/AppSelect.vue'
import AppButton from '@/ui/AppButton.vue'
import AppIcon from '@/ui/AppIcon.vue'
import AppField from '@/ui/AppField.vue'
import PasswordMeter from '@/modules/auth/components/PasswordMeter.vue'
import { useForm } from '@/core/composables/useForm'
import { useToast } from '@/core/composables/useToast'
import { useAuthStore } from '@/core/stores/auth'
import { USER_STATUSES, type User } from '@/core/api/types'
import { capitalize } from '@/core/utils/format'
import { ROLE_LABEL } from '@/core/utils/constants'
import { usersApi } from '../api'
import { createUserSchema, editUserSchema } from '../schemas'
import { compact } from '@/modules/students/schemas'

const props = defineProps<{ open: boolean; user?: User | null }>()
const emit = defineEmits<{ close: []; saved: [user: User] }>()
const toast = useToast()
const auth = useAuthStore()

const isEdit = computed(() => Boolean(props.user))
const isSelf = computed(() => props.user?._id === auth.user?._id)
const isStudentAccount = computed(() => props.user?.role === 'student')

// Only one admin account may exist. Hide the option unless we're editing that very admin.
const adminExists = ref(false)
const canOfferAdmin = computed(() => !adminExists.value || props.user?.role === 'admin')
const roleOptions = computed(() => [
  { value: 'teacher', label: 'Teacher' },
  ...(canOfferAdmin.value ? [{ value: 'admin', label: 'Administrator' }] : []),
])
const roleLocked = computed(() => isSelf.value || roleOptions.value.length === 1)
const statusOptions = USER_STATUSES.map((s) => ({ value: s, label: capitalize(s) }))

const blank = { name: '', email: '', password: '', role: 'teacher' as const, status: 'active' as const, phone: '', department: '' }
const createForm = useForm(createUserSchema, blank)
const editForm = useForm(editUserSchema, blank)
const form = computed(() => (isEdit.value ? editForm : createForm))

watch(() => props.open, async (open) => {
  if (!open) return
  const u = props.user
  u ? editForm.reset({ name: u.name, role: u.role === 'student' ? 'teacher' : u.role, status: u.status, phone: u.phone ?? '', department: u.department ?? '' }) : createForm.reset()
  try {
    const { meta } = await usersApi.list({ role: 'admin', limit: 1 })
    adminExists.value = (meta?.total ?? 0) > 0
  } catch {
    adminExists.value = false
  }
})

const submitCreate = createForm.handleSubmit(async (data) => {
  const { data: user } = await usersApi.create(compact(data))
  toast.success('User created', `${user.name} can sign in right away.`)
  emit('saved', user)
})
const submitEdit = editForm.handleSubmit(async (data) => {
  const payload: Record<string, unknown> = { name: data.name, status: data.status, phone: data.phone, department: data.department }
  if (!isStudentAccount.value) payload.role = data.role
  const { data: user } = await usersApi.update(props.user!._id, payload)
  toast.success('User updated')
  emit('saved', user)
})
const submit = () => (isEdit.value ? submitEdit() : submitCreate())
</script>

<template>
  <AppModal :open="open" :title="isEdit ? 'Edit user' : 'Add staff member'" :description="isEdit ? user?.email : 'Create a teacher or admin account. They can sign in immediately.'" @close="emit('close')">
    <form id="user-form" class="form" novalidate @submit.prevent="submit">
      <Transition name="fade">
        <div v-if="form.formError.value" class="alert" role="alert"><AppIcon name="alert" :size="16" />{{ form.formError.value }}</div>
      </Transition>

      <AppInput v-model="form.values.name" label="Full name" required maxlength="60" :error="form.touched.name ? form.errors.name : ''" @blur="form.validateField('name')" />
      <template v-if="!isEdit">
        <AppInput v-model="createForm.values.email" label="Email" type="email" required :error="createForm.touched.email ? createForm.errors.email : ''" @blur="createForm.validateField('email')" />
        <div class="stack">
          <AppInput v-model="createForm.values.password" label="Temporary password" type="password" required :error="createForm.touched.password ? createForm.errors.password : ''" @blur="createForm.validateField('password')" />
          <PasswordMeter :value="createForm.values.password" />
        </div>
      </template>

      <div class="grid">
        <AppField v-if="!isStudentAccount && roleLocked" label="Role">
          <div class="role-box"><AppIcon name="lock" :size="15" />{{ ROLE_LABEL[form.values.role] }}</div>
        </AppField>
        <AppSelect v-else-if="!isStudentAccount" v-model="form.values.role" label="Role" :options="roleOptions" />
        <AppSelect v-if="isEdit" v-model="editForm.values.status" label="Status" :options="statusOptions" :disabled="isSelf" :hint="isSelf ? 'You cannot deactivate yourself' : ''" />
        <AppInput v-model="form.values.phone" label="Phone" type="tel" inputmode="numeric" digits-only maxlength="10" placeholder="9876543210" :error="form.touched.phone ? form.errors.phone : ''" @blur="form.validateField('phone')" />
        <AppInput v-if="form.values.role === 'teacher' && !isStudentAccount" v-model="form.values.department" label="Department" placeholder="Computer Science" maxlength="80" :error="form.touched.department ? form.errors.department : ''" @blur="form.validateField('department')" />
      </div>
    </form>
    <template #footer>
      <AppButton variant="secondary" @click="emit('close')">Cancel</AppButton>
      <AppButton type="submit" form="user-form" :loading="form.submitting.value" :icon="isEdit ? 'check' : 'plus'">{{ isEdit ? 'Save changes' : 'Create user' }}</AppButton>
    </template>
  </AppModal>
</template>

<style scoped>
.form { display: flex; flex-direction: column; gap: var(--sp-4); }
.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--sp-4); align-items: start; }
.stack { display: flex; flex-direction: column; gap: 8px; }
.role-box {
  display: flex; align-items: center; gap: var(--sp-2);
  height: 44px; padding: 0 var(--sp-3);
  background: var(--surface-2); border: 1px solid var(--line-strong); border-radius: var(--r-md);
  font-size: var(--text-sm); font-weight: 500; color: var(--text-2);
}
.role-box svg { color: var(--text-3); flex-shrink: 0; }
.alert { display: flex; align-items: center; gap: var(--sp-2); padding: var(--sp-3) var(--sp-4); background: var(--danger-soft); color: var(--danger-text); border-radius: var(--r-md); font-size: var(--text-sm); font-weight: 500; }
@media (max-width: 560px) { .grid { grid-template-columns: 1fr; } }
</style>
