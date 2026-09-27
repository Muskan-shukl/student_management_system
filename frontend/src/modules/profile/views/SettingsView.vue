<script setup lang="ts">
import AppPageHeader from '@/ui/AppPageHeader.vue'
import AppCard from '@/ui/AppCard.vue'
import AppInput from '@/ui/AppInput.vue'
import AppButton from '@/ui/AppButton.vue'
import AppAvatar from '@/ui/AppAvatar.vue'
import AppBadge from '@/ui/AppBadge.vue'
import AppIcon from '@/ui/AppIcon.vue'
import PasswordMeter from '@/modules/auth/components/PasswordMeter.vue'
import { useAuthStore } from '@/core/stores/auth'
import { useForm } from '@/core/composables/useForm'
import { useToast } from '@/core/composables/useToast'
import { useTheme, type Theme } from '@/core/composables/useTheme'
import { ROLE_LABEL, ROLE_TONE } from '@/core/utils/constants'
import { formatDate } from '@/core/utils/format'
import { authApi } from '@/modules/auth/api'
import { changePasswordSchema, profileSchema } from '@/modules/auth/schemas'

const auth = useAuthStore()
const toast = useToast()
const { theme, setTheme } = useTheme()

const profile = useForm(profileSchema, { name: auth.user?.name ?? '', phone: auth.user?.phone ?? '', department: auth.user?.department ?? '' })
const saveProfile = profile.handleSubmit(async (data) => {
  const payload: Record<string, string> = { name: data.name, phone: data.phone }
  if (auth.isTeacher) payload.department = data.department
  const { data: user } = await authApi.updateProfile(payload)
  auth.updateUser(user)
  toast.success('Profile saved')
})

const password = useForm(changePasswordSchema, { currentPassword: '', newPassword: '', confirmPassword: '' })
const savePassword = password.handleSubmit(async (data) => {
  const { data: session } = await authApi.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword })
  auth.setSession(session)
  password.reset()
  toast.success('Password changed', 'Other devices have been signed out.')
})

const THEMES: { value: Theme; label: string; icon: string }[] = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'system', label: 'System', icon: 'monitor' },
]
</script>

<template>
  <div>
    <AppPageHeader title="Settings" description="Your account, security and appearance." />

    <div class="grid">
      <AppCard class="reveal" style="--i: 1" flush>
        <div v-if="auth.user" class="me">
          <AppAvatar :name="auth.user.name" :size="64" />
          <h3>{{ auth.user.name }}</h3>
          <p class="text-3 text-sm">{{ auth.user.email }}</p>
          <AppBadge :tone="ROLE_TONE[auth.user.role]">{{ ROLE_LABEL[auth.user.role] }}</AppBadge>
          <p class="me__since text-3 text-xs">Member since {{ formatDate(auth.user.createdAt) }}</p>
        </div>
        <div class="theme">
          <p class="theme__label">Appearance</p>
          <div class="theme__opts">
            <button v-for="t in THEMES" :key="t.value" type="button" class="theme__opt" :class="{ 'theme__opt--on': theme === t.value }" @click="setTheme(t.value)">
              <AppIcon :name="t.icon" :size="16" />{{ t.label }}
            </button>
          </div>
        </div>
      </AppCard>

      <div class="stack">
        <AppCard class="reveal" style="--i: 2" title="Profile">
          <form class="form" novalidate @submit.prevent="saveProfile">
            <Transition name="fade"><div v-if="profile.formError.value" class="alert"><AppIcon name="alert" :size="16" />{{ profile.formError.value }}</div></Transition>
            <div class="fgrid">
              <AppInput v-model="profile.values.name" label="Full name" required maxlength="60" :error="profile.touched.name ? profile.errors.name : ''" @blur="profile.validateField('name')" />
              <AppInput v-model="profile.values.phone" label="Phone" type="tel" inputmode="numeric" digits-only placeholder="9876543210" maxlength="10" :error="profile.touched.phone ? profile.errors.phone : ''" @blur="profile.validateField('phone')" />
              <AppInput v-if="auth.isTeacher" v-model="profile.values.department" label="Department" maxlength="80" :error="profile.touched.department ? profile.errors.department : ''" @blur="profile.validateField('department')" />
            </div>
            <div class="form__foot"><AppButton type="submit" icon="check" :loading="profile.submitting.value">Save profile</AppButton></div>
          </form>
        </AppCard>

        <AppCard class="reveal" style="--i: 3" title="Change password" subtitle="You'll stay signed in here; other sessions are signed out.">
          <form class="form" novalidate @submit.prevent="savePassword">
            <Transition name="fade"><div v-if="password.formError.value" class="alert"><AppIcon name="alert" :size="16" />{{ password.formError.value }}</div></Transition>
            <AppInput v-model="password.values.currentPassword" label="Current password" type="password" autocomplete="current-password" required :error="password.touched.currentPassword ? password.errors.currentPassword : ''" @blur="password.validateField('currentPassword')" />
            <div class="fgrid">
              <div class="stack-sm">
                <AppInput v-model="password.values.newPassword" label="New password" type="password" autocomplete="new-password" required :error="password.touched.newPassword ? password.errors.newPassword : ''" @blur="password.validateField('newPassword')" />
                <PasswordMeter :value="password.values.newPassword" />
              </div>
              <AppInput v-model="password.values.confirmPassword" label="Confirm new password" type="password" autocomplete="new-password" required :error="password.touched.confirmPassword ? password.errors.confirmPassword : ''" @blur="password.validateField('confirmPassword')" />
            </div>
            <div class="form__foot"><AppButton type="submit" variant="secondary" icon="lock" :loading="password.submitting.value">Update password</AppButton></div>
          </form>
        </AppCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: 300px 1fr; gap: var(--sp-5); align-items: start; }
.stack { display: flex; flex-direction: column; gap: var(--sp-5); }
.stack-sm { display: flex; flex-direction: column; gap: 8px; }
.me { display: flex; flex-direction: column; align-items: center; gap: var(--sp-2); padding: var(--sp-6) var(--sp-5); text-align: center; }
.me h3 { margin-top: var(--sp-2); }
.me__since { margin-top: var(--sp-2); }
.theme { padding: var(--sp-4) var(--sp-5) var(--sp-5); border-top: 1px solid var(--line); }
.theme__label { font-size: var(--text-xs); font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-3); margin-bottom: var(--sp-3); }
.theme__opts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; padding: 4px; background: var(--surface-3); border-radius: var(--r-md); }
.theme__opt { display: flex; align-items: center; justify-content: center; gap: 6px; height: 34px; border-radius: var(--r-sm); font-size: var(--text-xs); font-weight: 600; color: var(--text-3); transition: all var(--dur-fast) var(--ease); }
.theme__opt--on { background: var(--surface); color: var(--text); box-shadow: var(--shadow-sm); }
.form { display: flex; flex-direction: column; gap: var(--sp-4); }
.fgrid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--sp-4); align-items: start; }
.form__foot { display: flex; justify-content: flex-end; }
.alert { display: flex; align-items: center; gap: var(--sp-2); padding: var(--sp-3) var(--sp-4); background: var(--danger-soft); color: var(--danger-text); border-radius: var(--r-md); font-size: var(--text-sm); font-weight: 500; }
@media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
@media (max-width: 560px) { .fgrid { grid-template-columns: 1fr; } }
</style>
