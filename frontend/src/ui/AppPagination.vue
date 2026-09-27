<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import type { Meta } from '@/core/api/types'

defineProps<{ meta: Meta | null | undefined }>()
const emit = defineEmits<{ change: [page: number] }>()
</script>

<template>
  <div v-if="meta && meta.total > 0" class="pager">
    <p class="pager__info">
      Showing <strong>{{ (meta.page - 1) * meta.limit + 1 }}–{{ Math.min(meta.page * meta.limit, meta.total) }}</strong> of <strong>{{ meta.total }}</strong>
    </p>
    <div class="pager__controls">
      <button type="button" class="pager__btn" :disabled="meta.page <= 1" aria-label="Previous page" @click="emit('change', meta.page - 1)"><AppIcon name="chevron-left" /></button>
      <span class="pager__page mono">{{ meta.page }} / {{ meta.totalPages }}</span>
      <button type="button" class="pager__btn" :disabled="meta.page >= meta.totalPages" aria-label="Next page" @click="emit('change', meta.page + 1)"><AppIcon name="chevron-right" /></button>
    </div>
  </div>
</template>

<style scoped>
.pager { display: flex; align-items: center; justify-content: space-between; gap: var(--sp-4); padding: var(--sp-3) var(--sp-4); border-top: 1px solid var(--line); font-size: var(--text-sm); color: var(--text-2); }
.pager__controls { display: flex; align-items: center; gap: var(--sp-2); }
.pager__btn { width: 32px; height: 32px; display: grid; place-items: center; border-radius: var(--r-sm); border: 1px solid var(--line-strong); background: var(--surface); color: var(--text-2); transition: all var(--dur-fast); }
.pager__btn:hover:not(:disabled) { background: var(--surface-2); color: var(--text); }
.pager__btn:disabled { opacity: 0.4; }
.pager__page { font-size: var(--text-xs); min-width: 48px; text-align: center; }
</style>
