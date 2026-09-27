<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import AppPageHeader from '@/ui/AppPageHeader.vue'
import AppButton from '@/ui/AppButton.vue'
import AppBadge from '@/ui/AppBadge.vue'
import AppAvatar from '@/ui/AppAvatar.vue'
import AppEmpty from '@/ui/AppEmpty.vue'
import AppSkeleton from '@/ui/AppSkeleton.vue'
import AppIcon from '@/ui/AppIcon.vue'
import AppPagination from '@/ui/AppPagination.vue'
import AnnouncementFormModal from '../components/AnnouncementFormModal.vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/core/stores/auth'
import { useToast } from '@/core/composables/useToast'
import { useConfirm } from '@/core/composables/useConfirm'
import { toApiError, type ApiError } from '@/core/api/http'
import type { Announcement, Meta } from '@/core/api/types'
import { relativeTime } from '@/core/utils/format'
import { announcementsApi } from '../api'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const confirm = useConfirm()
const items = ref<Announcement[]>([])
const meta = ref<Meta | null>(null)
const loading = ref(true)
const error = ref<ApiError | null>(null)
const page = ref(1)
const modal = reactive({ open: false, item: null as Announcement | null })

const load = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await announcementsApi.list(page.value)
    items.value = res.data
    meta.value = res.meta ?? null
  } catch (err) {
    error.value = toApiError(err)
  } finally {
    loading.value = false
  }
}
onMounted(() => { if (route.query.new && !auth.isStudent) { modal.open = true; router.replace({ query: {} }) } load() })
const goto = (p: number) => { page.value = p; load() }

const canEdit = (a: Announcement) => auth.isAdmin || a.author._id === auth.user?._id
const openCreate = () => { modal.item = null; modal.open = true }
const openEdit = (a: Announcement) => { modal.item = a; modal.open = true }
const onSaved = () => { modal.open = false; load() }
const remove = async (a: Announcement) => {
  if (!(await confirm({ title: 'Delete this announcement?', description: a.title, confirmLabel: 'Delete', tone: 'danger' }))) return
  try { await announcementsApi.remove(a._id); toast.success('Announcement deleted'); load() } catch (err) { toast.error('Could not delete', toApiError(err).message) }
}
const audienceLabel = (a: Announcement) => (a.course ? a.course : a.audience === 'all' ? 'Everyone' : a.audience === 'students' ? 'Students' : 'Teachers')
</script>

<template>
  <div>
    <AppPageHeader title="Announcements" :description="auth.isStudent ? 'Notices from your teachers and the office.' : 'Post notices to students, teachers or everyone.'">
      <template #actions><AppButton v-if="!auth.isStudent" icon="plus" @click="openCreate">New announcement</AppButton></template>
    </AppPageHeader>

    <AppEmpty v-if="error" icon="alert" title="Couldn't load announcements" :description="error.message"><AppButton icon="refresh" variant="secondary" @click="load">Try again</AppButton></AppEmpty>
    <div v-else-if="loading" class="list"><div v-for="i in 3" :key="i" class="card"><AppSkeleton :lines="3" height="14px" /></div></div>
    <AppEmpty v-else-if="!items.length" icon="inbox" title="No announcements yet" :description="auth.isStudent ? 'When a teacher or the office posts a notice, it will appear here.' : 'Post the first notice for your campus.'">
      <AppButton v-if="!auth.isStudent" icon="plus" @click="openCreate">New announcement</AppButton>
    </AppEmpty>
    <template v-else>
      <TransitionGroup tag="div" name="list" class="list">
        <article v-for="(a, i) in items" :key="a._id" class="card reveal" :class="{ 'card--pinned': a.pinned }" :style="{ '--i': i }">
          <div class="card__head">
            <AppAvatar :name="a.author.name" :size="36" />
            <div class="card__meta">
              <p class="card__by">{{ a.author.name }} <span class="text-3">· {{ relativeTime(a.createdAt) }}</span></p>
              <div class="card__tags"><AppBadge v-if="a.pinned" tone="accent">Pinned</AppBadge><AppBadge tone="neutral">{{ audienceLabel(a) }}</AppBadge></div>
            </div>
            <div v-if="canEdit(a)" class="card__actions">
              <button type="button" class="iconbtn" title="Edit" @click="openEdit(a)"><AppIcon name="edit" :size="16" /></button>
              <button type="button" class="iconbtn iconbtn--danger" title="Delete" @click="remove(a)"><AppIcon name="trash" :size="16" /></button>
            </div>
          </div>
          <h3 class="card__title">{{ a.title }}</h3>
          <p class="card__body">{{ a.body }}</p>
        </article>
      </TransitionGroup>
      <div class="pager"><AppPagination :meta="meta" @change="goto" /></div>
    </template>

    <AnnouncementFormModal v-if="!auth.isStudent" :open="modal.open" :item="modal.item" @close="modal.open = false" @saved="onSaved" />
  </div>
</template>

<style scoped>
.list { display: flex; flex-direction: column; gap: var(--sp-4); max-width: 820px; position: relative; }
.card { padding: var(--sp-5); background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-lg); box-shadow: var(--shadow-xs); }
.card--pinned { border-color: var(--accent); background: linear-gradient(180deg, var(--accent-soft), var(--surface) 40%); }
.card__head { display: flex; align-items: flex-start; gap: var(--sp-3); margin-bottom: var(--sp-3); }
.card__meta { flex: 1; min-width: 0; }
.card__by { font-size: var(--text-sm); font-weight: 600; }
.card__tags { display: flex; gap: 6px; margin-top: 4px; }
.card__actions { display: flex; gap: 2px; }
.card__title { font-size: var(--text-lg); margin-bottom: var(--sp-2); }
.card__body { color: var(--text-2); font-size: var(--text-sm); line-height: 1.65; white-space: pre-line; }
.iconbtn { padding: 7px; border-radius: var(--r-sm); color: var(--text-3); transition: all var(--dur-fast); }
.iconbtn:hover { color: var(--primary-text); background: var(--primary-soft); }
.iconbtn--danger:hover { color: var(--danger-text); background: var(--danger-soft); }
.pager { max-width: 820px; margin-top: var(--sp-4); background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-md); }
.pager:empty { display: none; }
</style>
