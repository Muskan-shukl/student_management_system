<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import AppInput from '@/ui/AppInput.vue'
import AppButton from '@/ui/AppButton.vue'
import AppIcon from '@/ui/AppIcon.vue'
import PasswordMeter from '../components/PasswordMeter.vue'
import { useForm } from '@/core/composables/useForm'
import { useToast } from '@/core/composables/useToast'
import { authApi } from '../api'
import { resetPasswordSchema } from '../schemas'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const token = computed(() => String(route.query.token ?? ''))
const tokenLooksValid = computed(() => /^[a-f\d]{64}$/i.test(token.value))
const failed = ref<string | null>(null)

const form = useForm(resetPasswordSchema, { password: '', confirmPassword: '' })

const submit = form.handleSubmit(async (data) => {
  try {
    await authApi.resetPassword({ token: token.value, password: data.password })
  } catch (err) {
    failed.value = (err as Error).message
    return
  }
  toast.success('Password reset', 'You can sign in with your new password.')
  router.replace({ name: 'login' })
})
</script>

<template>
  <AuthLayout title="Choose a new password" subtitle="Make it at least 8 characters with a number and both cases.">
    <div v-if="!tokenLooksValid || failed" class="bad reveal">
      <span class="bad__icon"><AppIcon name="alert" :size="24" /></span>
      <h3>This link isn’t valid</h3>
      <p class="text-2">{{ failed || 'The reset link is incomplete or has expired. Links are valid for 30 minutes.' }}</p>
      <AppButton icon="refresh" @click="router.push({ name: 'forgot-password' })">Request a new link</AppButton>
    </div>

    <form v-else class="form" novalidate @submit.prevent="submit">
      <Transition name="fade">
        <div v-if="form.formError.value" class="alert" role="alert"><AppIcon name="alert" :size="16" />{{ form.formError.value }}</div>
      </Transition>
      <div class="stack reveal" style="--i: 1">
        <AppInput v-model="form.values.password" label="New password" type="password" icon="lock" autocomplete="new-password" required :error="form.touched.password ? form.errors.password : ''" @blur="form.validateField('password')" />
        <PasswordMeter :value="form.values.password" />
      </div>
      <div class="reveal" style="--i: 2">
        <AppInput v-model="form.values.confirmPassword" label="Confirm new password" type="password" icon="lock" autocomplete="new-password" required :error="form.touched.confirmPassword ? form.errors.confirmPassword : ''" @blur="form.validateField('confirmPassword')" />
      </div>
      <div class="reveal" style="--i: 3">
        <AppButton type="submit" size="lg" block :loading="form.submitting.value" icon="check">Reset password</AppButton>
      </div>
    </form>
  </AuthLayout>
</template>

<style scoped>
.form { display: flex; flex-direction: column; gap: var(--sp-5); }
.stack { display: flex; flex-direction: column; gap: 8px; }
.alert { display: flex; align-items: center; gap: var(--sp-2); padding: var(--sp-3) var(--sp-4); background: var(--danger-soft); color: var(--danger-text); border-radius: var(--r-md); font-size: var(--text-sm); font-weight: 500; }
.bad { display: flex; flex-direction: column; align-items: flex-start; gap: var(--sp-4); padding: var(--sp-6); background: var(--danger-soft); border-radius: var(--r-lg); }
.bad__icon { width: 52px; height: 52px; display: grid; place-items: center; border-radius: var(--r-md); background: var(--danger); color: #fff; }
</style>
