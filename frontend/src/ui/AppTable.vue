<script setup lang="ts" generic="T extends { _id: string }">
import AppSkeleton from './AppSkeleton.vue'

export interface Column {
  key: string
  label: string
  width?: string
  align?: 'left' | 'right' | 'center'
  hideBelow?: 'sm' | 'md' | 'lg'
}

defineProps<{ columns: Column[]; rows: T[]; loading?: boolean; skeletonRows?: number; rowLink?: (row: T) => void }>()
</script>

<template>
  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key" :style="{ width: col.width, textAlign: col.align ?? 'left' }" :class="col.hideBelow && `hide-${col.hideBelow}`">
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody v-if="loading">
        <tr v-for="i in skeletonRows ?? 6" :key="i">
          <td v-for="col in columns" :key="col.key" :class="col.hideBelow && `hide-${col.hideBelow}`"><AppSkeleton :width="`${45 + ((i * 17) % 45)}%`" /></td>
        </tr>
      </tbody>
      <TransitionGroup v-else tag="tbody" name="rows">
        <tr v-for="(row, i) in rows" :key="row._id" :class="{ 'table__row--link': rowLink }" :style="{ '--i': i }" @click="rowLink?.(row)">
          <td v-for="col in columns" :key="col.key" :style="{ textAlign: col.align ?? 'left' }" :class="col.hideBelow && `hide-${col.hideBelow}`">
            <slot :name="`cell-${col.key}`" :row="row">{{ (row as Record<string, unknown>)[col.key] ?? '—' }}</slot>
          </td>
        </tr>
      </TransitionGroup>
    </table>
    <div v-if="!loading && rows.length === 0" class="table__empty"><slot name="empty" /></div>
  </div>
</template>

<style scoped>
.table-wrap { overflow-x: auto; }
.table { min-width: 100%; }
.table thead th { position: sticky; top: 0; z-index: 1; }
.table th {
  padding: var(--sp-3) var(--sp-4);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-3);
  border-bottom: 1px solid var(--line);
  background: var(--surface-2);
  white-space: nowrap;
}
.table td {
  padding: var(--sp-3) var(--sp-4);
  font-size: var(--text-sm);
  border-bottom: 1px solid var(--line);
  vertical-align: middle;
}
.table tbody tr:last-child td { border-bottom: 0; }
.table tbody tr { transition: background var(--dur-fast) var(--ease); }
.table tbody tr:hover { background: var(--surface-2); }
.table__row--link { cursor: pointer; }
.rows-enter-active { animation: fade-up var(--dur-slow) var(--ease-out) both; animation-delay: calc(var(--i, 0) * 35ms); }
.rows-leave-active { transition: opacity var(--dur-fast); }
.rows-leave-to { opacity: 0; }

@media (max-width: 640px) { .hide-sm { display: none; } }
@media (max-width: 900px) { .hide-md { display: none; } }
@media (max-width: 1100px) { .hide-lg { display: none; } }
</style>
