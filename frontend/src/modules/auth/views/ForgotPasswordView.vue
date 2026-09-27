<script setup lang="ts">
import { ref } from 'vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import AppInput from '@/ui/AppInput.vue'
import AppButton from '@/ui/AppButton.vue'
import AppIcon from '@/ui/AppIcon.vue'
import { useForm } from '@/core/composables/useForm'
import { authApi } from '../api'
import { forgotPasswordSchema } from '../schemas'

const sent = ref(false)
const form = useForm(forgotPasswordSchema, { email: '' })

const submit = form.handleSubmit(async (data) => {
  await authApi.forgotPassword(data)
  sent.value = true
})
</script>

<template>
  <AuthLayout :title="sent ? 'Check your inbox' : 'Forgot your password?'" :subtitle="sent ? 'We sent a reset link if that email is registered.' : 'Enter your email and we’ll send you a link to reset it.'">
    <div v-if="sent" class="done reveal">
      <span class="done__icon"><AppIcon name="mail" :size="24" /></span>
      <p class="text-2">The link expires in <strong>30 minutes</strong>. If it doesn’t arrive, check your spam folder or try again.</p>
      <div class="done__actions">
        <AppButton variant="secondary" @click="sent = false; form.reset()">Use a different email</AppButton>
        <AppButton icon="arrow-left" @click="$router.push({ name: 'login' })">Back to sign in</AppButton>
      </div>
    </div>

    <form v-else class="form" novalidate @submit.prevent="submit">
      <Transition name="fade">
        <div v-if="form.formError.value" class="alert" role="alert"><AppIcon name="alert" :size="16" />{{ form.formError.value }}</div>
      </Transition>
      <div class="reveal" style="--i: 1">
        <AppInput v-model="form.values.email" label="Email" type="email" icon="mail" placeholder="you@college.edu" autocomplete="email" required :error="form.touched.email ? form.errors.email : ''" @blur="form.validateField('email')" />
      </div>
      <div class="reveal" style="--i: 2">
        <AppButton type="submit" size="lg" block :loading="form.submitting.value" icon-right="arrow-right">Send reset link</AppButton>
      </div>
      <p class="alt reveal" style="--i: 3">Remembered it? <RouterLink :to="{ name: 'login' }">Sign in</RouterLink></p>
    </form>
  </AuthLayout>
</template>

<style scoped>
.form { display: flex; flex-direction: column; gap: var(--sp-5); }
.alt { text-align: center; font-size: var(--text-sm); color: var(--text-2); }
.alert { display: flex; align-items: center; gap: var(--sp-2); padding: var(--sp-3) var(--sp-4); background: var(--danger-soft); color: var(--danger-text); border-radius: var(--r-md); font-size: var(--text-sm); font-weight: 500; }
.done { display: flex; flex-direction: column; gap: var(--sp-4); padding: var(--sp-6); background: var(--primary-soft); border-radius: var(--r-lg); }
.done__icon { width: 52px; height: 52px; display: grid; place-items: center; border-radius: var(--r-md); background: var(--primary); color: var(--on-primary); }
.done__actions { display: flex; gap: var(--sp-2); flex-wrap: wrap; }
</style>
