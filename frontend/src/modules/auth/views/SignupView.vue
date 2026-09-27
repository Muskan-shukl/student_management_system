<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import AppInput from '@/ui/AppInput.vue'
import AppSelect from '@/ui/AppSelect.vue'
import AppButton from '@/ui/AppButton.vue'
import AppIcon from '@/ui/AppIcon.vue'
import PasswordMeter from '../components/PasswordMeter.vue'
import { useAuthStore } from '@/core/stores/auth'
import { useForm } from '@/core/composables/useForm'
import { useToast } from '@/core/composables/useToast'
import { YEAR_OPTIONS } from '@/core/utils/constants'
import { signupSchema, toSignupInput } from '../schemas'

const auth = useAuthStore()
const router = useRouter()
const toast = useToast()
const pendingApproval = ref(false)

const form = useForm(signupSchema, {
  role: 'student',
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  course: '',
  year: 1,
  department: '',
})

const submit = form.handleSubmit(async (data) => {
  const result = await auth.signup(toSignupInput(data))
  if (result.pending) {
    pendingApproval.value = true
    return
  }
  toast.success('Account created', 'Welcome to Vidyara!')
  router.replace({ name: 'dashboard' })
})
</script>

<template>
  <AuthLayout :title="pendingApproval ? 'Almost there' : 'Create your account'" :subtitle="pendingApproval ? 'Your request is with the admin team.' : 'Join Vidyara as a student or a teacher.'">
    <div v-if="pendingApproval" class="pending reveal">
      <span class="pending__icon"><AppIcon name="clock" :size="26" /></span>
      <h3>Awaiting approval</h3>
      <p class="text-2">Teacher accounts are reviewed by an administrator before activation. You'll be able to sign in as soon as it's approved.</p>
      <AppButton variant="secondary" icon="arrow-left" @click="router.push({ name: 'login' })">Back to sign in</AppButton>
    </div>

    <form v-else class="form" novalidate @submit.prevent="submit">
      <Transition name="fade">
        <div v-if="form.formError.value" class="alert" role="alert"><AppIcon name="alert" :size="16" />{{ form.formError.value }}</div>
      </Transition>

      <div class="segment reveal" style="--i: 1" role="radiogroup" aria-label="Account type">
        <span class="segment__thumb" :class="{ 'segment__thumb--right': form.values.role === 'teacher' }" />
        <button type="button" class="segment__opt" :class="{ 'segment__opt--on': form.values.role === 'student' }" role="radio" :aria-checked="form.values.role === 'student'" @click="form.values.role = 'student'">
          <AppIcon name="hat" :size="16" /> Student
        </button>
        <button type="button" class="segment__opt" :class="{ 'segment__opt--on': form.values.role === 'teacher' }" role="radio" :aria-checked="form.values.role === 'teacher'" @click="form.values.role = 'teacher'">
          <AppIcon name="book" :size="16" /> Teacher
        </button>
      </div>

      <div class="reveal" style="--i: 2">
        <AppInput v-model="form.values.name" label="Full name" placeholder="Priya Sharma" autocomplete="name" required maxlength="60" :error="form.touched.name ? form.errors.name : ''" @blur="form.validateField('name')" />
      </div>
      <div class="reveal" style="--i: 3">
        <AppInput v-model="form.values.email" label="Email" type="email" icon="mail" placeholder="you@college.edu" autocomplete="email" required :error="form.touched.email ? form.errors.email : ''" @blur="form.validateField('email')" />
      </div>

      <Transition name="fade" mode="out-in">
        <div v-if="form.values.role === 'student'" key="student" class="grid">
          <AppInput v-model="form.values.course" label="Course" placeholder="B.Tech CSE" required :error="form.touched.course ? form.errors.course : ''" @blur="form.validateField('course')" />
          <AppSelect v-model="form.values.year" label="Year" :options="YEAR_OPTIONS" required />
        </div>
        <div v-else key="teacher">
          <AppInput v-model="form.values.department" label="Department" placeholder="Computer Science" hint="Teacher accounts need admin approval before first sign-in." :error="form.touched.department ? form.errors.department : ''" @blur="form.validateField('department')" />
        </div>
      </Transition>

      <div class="grid reveal" style="--i: 4">
        <div class="stack">
          <AppInput v-model="form.values.password" label="Password" type="password" icon="lock" autocomplete="new-password" required :error="form.touched.password ? form.errors.password : ''" @blur="form.validateField('password')" />
          <PasswordMeter :value="form.values.password" />
        </div>
        <AppInput v-model="form.values.confirmPassword" label="Confirm password" type="password" icon="lock" autocomplete="new-password" required :error="form.touched.confirmPassword ? form.errors.confirmPassword : ''" @blur="form.validateField('confirmPassword')" />
      </div>

      <div class="reveal" style="--i: 5">
        <AppButton type="submit" size="lg" block :loading="form.submitting.value" icon-right="arrow-right">Create account</AppButton>
      </div>
      <p class="alt reveal" style="--i: 6">Already have an account? <RouterLink :to="{ name: 'login' }">Sign in</RouterLink></p>
    </form>
  </AuthLayout>
</template>

<style scoped>
.form { display: flex; flex-direction: column; gap: var(--sp-5); }
.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--sp-4); align-items: start; }
.stack { display: flex; flex-direction: column; gap: 8px; }
.alt { text-align: center; font-size: var(--text-sm); color: var(--text-2); }
.alert { display: flex; align-items: center; gap: var(--sp-2); padding: var(--sp-3) var(--sp-4); background: var(--danger-soft); color: var(--danger-text); border-radius: var(--r-md); font-size: var(--text-sm); font-weight: 500; }

.segment { position: relative; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); padding: 4px; background: var(--surface-3); border-radius: var(--r-md); }
.segment__thumb { position: absolute; top: 4px; bottom: 4px; left: 4px; width: calc(50% - 4px); background: var(--surface); border-radius: calc(var(--r-md) - 3px); box-shadow: var(--shadow-sm); transition: transform var(--dur-slow) var(--ease-spring); }
.segment__thumb--right { transform: translateX(100%); }
.segment__opt { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; gap: 8px; height: 38px; font-size: var(--text-sm); font-weight: 600; color: var(--text-3); border-radius: var(--r-sm); transition: color var(--dur) var(--ease); }
.segment__opt--on { color: var(--primary-text); }

.pending { display: flex; flex-direction: column; align-items: flex-start; gap: var(--sp-4); padding: var(--sp-6); background: var(--accent-soft); border-radius: var(--r-lg); }
.pending__icon { width: 52px; height: 52px; display: grid; place-items: center; border-radius: var(--r-md); background: var(--accent); color: var(--ink-900); }

@media (max-width: 480px) { .grid { grid-template-columns: 1fr; } }
</style>
