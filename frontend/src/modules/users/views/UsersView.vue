<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppPageHeader from '@/ui/AppPageHeader.vue'
import AppCard from '@/ui/AppCard.vue'
import AppButton from '@/ui/AppButton.vue'
import AppInput from '@/ui/AppInput.vue'
import AppSelect from '@/ui/AppSelect.vue'
import AppTable, { type Column } from '@/ui/AppTable.vue'
import AppAvatar from '@/ui/AppAvatar.vue'
import AppBadge from '@/ui/AppBadge.vue'
import AppEmpty from '@/ui/AppEmpty.vue'
import AppPagination from '@/ui/AppPagination.vue'
import AppIcon from '@/ui/AppIcon.vue'
import UserFormModal from '../components/UserFormModal.vue'
import ResetPasswordModal from '../components/ResetPasswordModal.vue'
import { useAuthStore } from '@/core/stores/auth'
import { useToast } from '@/core/composables/useToast'
import { useConfirm } from '@/core/composables/useConfirm'
import { useDebouncedRef } from '@/core/composables/useDebouncedRef'
import { toApiError, type ApiError } from '@/core/api/http'
import { USER_STATUSES, type Meta, type Role, type User, type UserStatus } from '@/core/api/types'
import { ROLE_LABEL, ROLE_TONE, USER_STATUS_TONE } from '@/core/utils/constants'
import { capitalize, relativeTime } from '@/core/utils/format'
import { usersApi } from '../api'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const confirm = useConfirm()

const rows = ref<User[]>([])
const meta = ref<Meta | null>(null)
const loading = ref(true)
const error = ref<ApiError | null>(null)
const busy = ref<string | null>(null)

const search = ref('')
const debouncedSearch = useDebouncedRef(search)
const filters = reactive<{ role: Role | ''; status: UserStatus | '' }>({ role: '', status: (route.query.status as UserStatus | undefined) ?? '' })
const page = ref(1)
const hasFilters = computed(() => Boolean(search.value || filters.role || filters.status))
const modal = reactive({ open: false, user: null as User | null })
const reset = reactive({ open: false, user: null as User | null })

const load = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await usersApi.list({ page: page.value, limit: 10, search: debouncedSearch.value, ...filters })
    rows.value = res.data
    meta.value = res.meta ?? null
  } catch (err) {
    error.value = toApiError(err)
  } finally {
    loading.value = false
  }
}
watch([debouncedSearch, () => ({ ...filters })], () => { page.value = 1; load(); router.replace({ query: filters.status ? { status: filters.status } : {} }) })
watch(page, load)
onMounted(() => { if (route.query.new) { modal.open = true; router.replace({ query: {} }) } load() })

const clearFilters = () => { search.value = ''; filters.role = ''; filters.status = '' }
const openCreate = () => { modal.user = null; modal.open = true }
const openEdit = (u: User) => { modal.user = u; modal.open = true }
const onSaved = () => { modal.open = false; load() }

const setStatus = async (u: User, status: UserStatus) => {
  busy.value = u._id
  try {
    await usersApi.update(u._id, { status })
    toast.success(status === 'active' ? `${u.name} is now active` : `${u.name} ${status === 'disabled' ? 'disabled' : 'updated'}`)
    await load()
  } catch (err) {
    toast.error('Update failed', toApiError(err).message)
  } finally {
    busy.value = null
  }
}

const remove = async (u: User) => {
  const ok = await confirm({ title: `Delete ${u.name}?`, description: u.role === 'student' ? 'Their student profile will be removed as well.' : u.role === 'teacher' ? 'Students assigned to this teacher will become unassigned.' : 'This cannot be undone.', confirmLabel: 'Delete', tone: 'danger' })
  if (!ok) return
  try {
    await usersApi.remove(u._id)
    toast.success('User deleted')
    if (rows.value.length === 1 && page.value > 1) page.value -= 1
    else load()
  } catch (err) {
    toast.error('Could not delete', toApiError(err).message)
  }
}

const columns: Column[] = [
  { key: 'user', label: 'User' },
  { key: 'role', label: 'Role', width: '140px' },
  { key: 'department', label: 'Department', hideBelow: 'md' },
  { key: 'status', label: 'Status', width: '110px', hideBelow: 'sm' },
  { key: 'lastLoginAt', label: 'Last active', width: '130px', hideBelow: 'lg' },
  { key: 'actions', label: '', width: '1%', align: 'right' },
]
const roleOptions = [{ value: '', label: 'All roles' }, { value: 'admin', label: 'Administrators' }, { value: 'teacher', label: 'Teachers' }, { value: 'student', label: 'Students' }]
const statusOptions = [{ value: '', label: 'All statuses' }, ...USER_STATUSES.map((s) => ({ value: s, label: capitalize(s) }))]
</script>

<template>
  <div>
    <AppPageHeader title="Users" description="Manage accounts, approve teachers and control access.">
      <template #actions><AppButton icon="plus" @click="openCreate">Add staff</AppButton></template>
    </AppPageHeader>

    <AppCard class="reveal" style="--i: 1" flush>
      <div class="toolbar">
        <div class="toolbar__search"><AppInput v-model="search" icon="search" placeholder="Search by name or email…" /></div>
        <AppSelect v-model="filters.role" :options="roleOptions" />
        <AppSelect v-model="filters.status" :options="statusOptions" />
        <AppButton v-if="hasFilters" variant="ghost" size="sm" icon="x" @click="clearFilters">Clear</AppButton>
      </div>

      <AppEmpty v-if="error" icon="alert" title="Couldn't load users" :description="error.message">
        <AppButton icon="refresh" variant="secondary" @click="load">Try again</AppButton>
      </AppEmpty>

      <template v-else>
        <AppTable :columns="columns" :rows="rows" :loading="loading">
          <template #cell-user="{ row }">
            <div class="who">
              <AppAvatar :name="row.name" />
              <div class="who__text">
                <p class="who__name">{{ row.name }} <span v-if="row._id === auth.user?._id" class="you">you</span></p>
                <p class="who__sub truncate">{{ row.email }}</p>
              </div>
            </div>
          </template>
          <template #cell-role="{ row }"><AppBadge :tone="ROLE_TONE[row.role]">{{ ROLE_LABEL[row.role] }}</AppBadge></template>
          <template #cell-department="{ row }">{{ row.department || '—' }}</template>
          <template #cell-status="{ row }"><AppBadge :tone="USER_STATUS_TONE[row.status]" dot>{{ row.status }}</AppBadge></template>
          <template #cell-lastLoginAt="{ row }"><span class="text-2">{{ relativeTime(row.lastLoginAt) }}</span></template>
          <template #cell-actions="{ row }">
            <div class="actions">
              <template v-if="row.status === 'pending'">
                <AppButton size="sm" icon="check" :loading="busy === row._id" @click="setStatus(row, 'active')">Approve</AppButton>
                <button type="button" class="iconbtn iconbtn--danger" title="Decline" :disabled="busy === row._id" @click="setStatus(row, 'disabled')"><AppIcon name="user-x" :size="16" /></button>
              </template>
              <template v-else-if="row._id !== auth.user?._id">
                <button v-if="row.status === 'active'" type="button" class="iconbtn" title="Disable account" :disabled="busy === row._id" @click="setStatus(row, 'disabled')"><AppIcon name="user-x" :size="16" /></button>
                <button v-else type="button" class="iconbtn" title="Re-activate" :disabled="busy === row._id" @click="setStatus(row, 'active')"><AppIcon name="user-check" :size="16" /></button>
              </template>
              <button type="button" class="iconbtn" title="Edit" @click="openEdit(row)"><AppIcon name="edit" :size="16" /></button>
              <button v-if="row._id !== auth.user?._id" type="button" class="iconbtn" title="Set temporary password" @click="reset.user = row; reset.open = true"><AppIcon name="lock" :size="16" /></button>
              <button v-if="row._id !== auth.user?._id" type="button" class="iconbtn iconbtn--danger" title="Delete" @click="remove(row)"><AppIcon name="trash" :size="16" /></button>
            </div>
          </template>
          <template #empty>
            <AppEmpty v-if="hasFilters" icon="search" title="No users match" description="Try a different search or clear the filters.">
              <AppButton variant="secondary" icon="x" @click="clearFilters">Clear filters</AppButton>
            </AppEmpty>
            <AppEmpty v-else icon="users" title="No users yet" />
          </template>
        </AppTable>
        <AppPagination :meta="meta" @change="page = $event" />
      </template>
    </AppCard>

    <UserFormModal :open="modal.open" :user="modal.user" @close="modal.open = false" @saved="onSaved" />
    <ResetPasswordModal :open="reset.open" :user="reset.user" @close="reset.open = false" />
  </div>
</template>

<style scoped>
.toolbar { display: grid; grid-template-columns: minmax(200px, 2fr) repeat(2, minmax(140px, 1fr)) auto; gap: var(--sp-3); align-items: center; padding: var(--sp-4); border-bottom: 1px solid var(--line); }
.who { display: flex; align-items: center; gap: var(--sp-3); min-width: 0; }
.who__text { min-width: 0; }
.who__name { font-weight: 600; white-space: nowrap; }
.who__sub { font-size: var(--text-xs); color: var(--text-3); }
.you { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--primary-text); background: var(--primary-soft); padding: 1px 6px; border-radius: var(--r-full); margin-left: 4px; }
.actions { display: flex; gap: 2px; justify-content: flex-end; align-items: center; }
.iconbtn { padding: 7px; border-radius: var(--r-sm); color: var(--text-3); transition: all var(--dur-fast); }
.iconbtn:hover:not(:disabled) { color: var(--primary-text); background: var(--primary-soft); }
.iconbtn--danger:hover:not(:disabled) { color: var(--danger-text); background: var(--danger-soft); }
.iconbtn:disabled { opacity: 0.4; }
@media (max-width: 900px) { .toolbar { grid-template-columns: repeat(2, minmax(0, 1fr)); } .toolbar__search { grid-column: 1 / -1; } }
@media (max-width: 560px) { .toolbar { grid-template-columns: 1fr; } }
</style>
