<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import AppInput from '@/ui/AppInput.vue'
import AppButton from '@/ui/AppButton.vue'
import AppIcon from '@/ui/AppIcon.vue'
import { useAuthStore } from '@/core/stores/auth'
import { useForm } from '@/core/composables/useForm'
import { useToast } from '@/core/composables/useToast'
import { DEMO_ACCOUNTS, ROLE_LABEL } from '@/core/utils/constants'
import { loginSchema } from '../schemas'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const toast = useToast()

const form = useForm(loginSchema, { email: '', password: '' })

const submit = form.handleSubmit(async (data) => {
  const user = await auth.login(data)
  toast.success(`Welcome back, ${user.name.split(' ')[0]}`)
  router.replace((route.query.redirect as string) || { name: 'dashboard' })
})

const fillDemo = (email: string, password: string) => {
  form.reset({ email, password })
}
</script>

<template>
  <AuthLayout title="Welcome back" subtitle="Sign in to your Vidyara account.">
    <form class="form" novalidate @submit.prevent="submit">
      <Transition name="fade">
        <div v-if="form.formError.value" class="alert" role="alert"><AppIcon name="alert" :size="16" />{{ form.formError.value }}</div>
      </Transition>

      <div class="reveal" style="--i: 1">
        <AppInput v-model="form.values.email" label="Email" type="email" icon="mail" placeholder="you@college.edu" autocomplete="email" required :error="form.touched.email ? form.errors.email : ''" @blur="form.validateField('email')" />
      </div>
      <div class="reveal" style="--i: 2">
        <AppInput v-model="form.values.password" label="Password" type="password" icon="lock" placeholder="••••••••" autocomplete="current-password" required :error="form.touched.password ? form.errors.password : ''" @blur="form.validateField('password')" />
        <RouterLink :to="{ name: 'forgot-password' }" class="forgot">Forgot password?</RouterLink>
      </div>

      <div class="reveal" style="--i: 3">
        <AppButton type="submit" size="lg" block :loading="form.submitting.value" icon-right="arrow-right">Sign in</AppButton>
      </div>

      <p class="alt reveal" style="--i: 4">New here? <RouterLink :to="{ name: 'signup' }">Create an account</RouterLink></p>
    </form>

    <div class="demo reveal" style="--i: 5">
      <p class="demo__title"><AppIcon name="sparkle" :size="14" /> Try a demo account</p>
      <div class="demo__chips">
        <button v-for="acc in DEMO_ACCOUNTS" :key="acc.role" type="button" class="chip" @click="fillDemo(acc.email, acc.password)">
          {{ ROLE_LABEL[acc.role] }}
        </button>
      </div>
    </div>
  </AuthLayout>
</template>

<style scoped>
.form { display: flex; flex-direction: column; gap: var(--sp-5); }
.alert {
  display: flex; align-items: center; gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-4);
  background: var(--danger-soft); color: var(--danger-text);
  border-radius: var(--r-md); font-size: var(--text-sm); font-weight: 500;
}
.alt { text-align: center; font-size: var(--text-sm); color: var(--text-2); }
.forgot { display: inline-block; margin-top: var(--sp-2); font-size: var(--text-sm); font-weight: 500; }
.demo { margin-top: var(--sp-10); padding-top: var(--sp-6); border-top: 1px dashed var(--line-strong); }
.demo__title { display: flex; align-items: center; gap: 6px; font-size: var(--text-xs); font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-3); margin-bottom: var(--sp-3); }
.demo__chips { display: flex; gap: var(--sp-2); flex-wrap: wrap; }
.chip {
  padding: 7px 14px; border-radius: var(--r-full);
  border: 1px solid var(--line-strong); background: var(--surface);
  font-size: var(--text-sm); font-weight: 500; color: var(--text-2);
  transition: all var(--dur-fast) var(--ease);
}
.chip:hover { border-color: var(--primary); color: var(--primary-text); background: var(--primary-soft); transform: translateY(-1px); }
</style>
