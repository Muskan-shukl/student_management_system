<script setup lang="ts">
import { onMounted } from 'vue'
import AppPageHeader from '@/ui/AppPageHeader.vue'
import AppEmpty from '@/ui/AppEmpty.vue'
import AppButton from '@/ui/AppButton.vue'
import AdminDashboard from '../components/AdminDashboard.vue'
import TeacherDashboard from '../components/TeacherDashboard.vue'
import StudentDashboard from '../components/StudentDashboard.vue'
import { useAuthStore } from '@/core/stores/auth'
import { useAsync } from '@/core/composables/useAsync'
import { greeting } from '@/core/utils/format'
import { dashboardApi } from '../api'

const auth = useAuthStore()
const { data, loading, error, run } = useAsync(async () => (await dashboardApi.get()).data)
onMounted(run)

const SUBTITLES = {
  admin: "Here's what's happening across the campus today.",
  teacher: 'A quick look at how your students are doing.',
  student: 'Your academic snapshot, all in one place.',
}
</script>

<template>
  <div>
    <AppPageHeader :eyebrow="greeting()" :title="auth.user?.name ?? ''" :description="auth.role ? SUBTITLES[auth.role] : ''" />

    <AppEmpty v-if="error" icon="alert" title="Couldn't load your dashboard" :description="error.message">
      <AppButton icon="refresh" variant="secondary" @click="run">Try again</AppButton>
    </AppEmpty>

    <AdminDashboard v-else-if="auth.isAdmin" :data="data?.role === 'admin' ? data : null" :loading="loading" @refresh="run" />
    <TeacherDashboard v-else-if="auth.isTeacher" :data="data?.role === 'teacher' ? data : null" :loading="loading" />
    <StudentDashboard v-else :data="data?.role === 'student' ? data : null" :loading="loading" />
  </div>
</template>
