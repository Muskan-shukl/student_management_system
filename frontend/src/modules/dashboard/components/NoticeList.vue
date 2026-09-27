<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppCard from '@/ui/AppCard.vue'
import AppButton from '@/ui/AppButton.vue'
import AppBadge from '@/ui/AppBadge.vue'
import AppEmpty from '@/ui/AppEmpty.vue'
import AppSkeleton from '@/ui/AppSkeleton.vue'
import type { Announcement } from '@/core/api/types'
import { relativeTime } from '@/core/utils/format'

defineProps<{ items: Announcement[] | undefined; loading: boolean }>()
const router = useRouter()
</script>

<template>
  <AppCard title="Announcements">
    <template #actions><AppButton size="sm" variant="ghost" icon-right="arrow-right" @click="router.push('/announcements')">All</AppButton></template>
    <div v-if="loading" class="rows"><AppSkeleton v-for="i in 2" :key="i" :lines="2" /></div>
    <AppEmpty v-else-if="!items?.length" compact icon="inbox" title="No announcements" />
    <ul v-else class="rows">
      <li v-for="a in items" :key="a._id" class="note">
        <div class="note__head"><p class="note__title">{{ a.title }}</p><AppBadge v-if="a.pinned" tone="accent">Pinned</AppBadge></div>
        <p class="note__body">{{ a.body }}</p>
        <p class="note__meta">{{ a.author.name }} · {{ relativeTime(a.createdAt) }}</p>
      </li>
    </ul>
  </AppCard>
</template>

<style scoped>
.rows { display: flex; flex-direction: column; gap: var(--sp-3); }
.note { padding-bottom: var(--sp-3); border-bottom: 1px solid var(--line); }
.note:last-child { border-bottom: 0; padding-bottom: 0; }
.note__head { display: flex; align-items: center; gap: 8px; justify-content: space-between; }
.note__title { font-weight: 600; font-size: var(--text-sm); }
.note__body { font-size: var(--text-sm); color: var(--text-2); margin-top: 2px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.note__meta { font-size: var(--text-xs); color: var(--text-3); margin-top: 4px; }
</style>
