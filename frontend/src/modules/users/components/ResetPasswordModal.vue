<script setup lang="ts">
import { watch } from 'vue'
import { z } from 'zod'
import AppModal from '@/ui/AppModal.vue'
import AppInput from '@/ui/AppInput.vue'
import AppButton from '@/ui/AppButton.vue'
import AppIcon from '@/ui/AppIcon.vue'
import PasswordMeter from '@/modules/auth/components/PasswordMeter.vue'
import { useForm } from '@/core/composables/useForm'
import { useToast } from '@/core/composables/useToast'
import type { User } from '@/core/api/types'
import { passwordSchema } from '@/modules/auth/schemas'
import { usersApi } from '../api'

const props = defineProps<{ open: boolean; user: User | null }>()
const emit = defineEmits<{ close: [] }>()
const toast = useToast()
const form = useForm(z.object({ password: passwordSchema }), { password: '' })
watch(() => props.open, (open) => open && form.reset())

const submit = form.handleSubmit(async (data) => {
  if (!props.user) return
  await usersApi.resetPassword(props.user._id, data.password)
  toast.success('Temporary password set', `${props.user.name} has been signed out everywhere. Share the new password with them.`)
  emit('close')
})
</script>

<template>
  <AppModal :open="open" title="Set a temporary password" :description="user ? `${user.name} · ${user.email}` : ''" size="sm" @close="emit('close')">
    <form id="reset-form" class="form" novalidate @submit.prevent="submit">
      <Transition name="fade"><div v-if="form.formError.value" class="alert"><AppIcon name="alert" :size="16" />{{ form.formError.value }}</div></Transition>
      <div class="stack">
        <AppInput v-model="form.values.password" label="New password" type="password" autocomplete="new-password" required hint="They can change it from Settings after signing in." :error="form.touched.password ? form.errors.password : ''" @blur="form.validateField('password')" />
        <PasswordMeter :value="form.values.password" />
      </div>
    </form>
    <template #footer>
      <AppButton variant="secondary" @click="emit('close')">Cancel</AppButton>
      <AppButton type="submit" form="reset-form" icon="lock" :loading="form.submitting.value">Set password</AppButton>
    </template>
  </AppModal>
</template>

<style scoped>
.form { display: flex; flex-direction: column; gap: var(--sp-4); }
.stack { display: flex; flex-direction: column; gap: 8px; }
.alert { display: flex; align-items: center; gap: var(--sp-2); padding: var(--sp-3) var(--sp-4); background: var(--danger-soft); color: var(--danger-text); border-radius: var(--r-md); font-size: var(--text-sm); font-weight: 500; }
</style>
