<script setup lang="ts">
defineProps<{ tone?: 'primary' | 'accent' | 'info' | 'success' | 'warning' | 'danger' | 'neutral'; dot?: boolean }>()
</script>

<template>
  <span class="badge" :class="`badge--${tone ?? 'neutral'}`">
    <span v-if="dot" class="badge__dot" />
    <slot />
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: var(--r-full);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: capitalize;
  background: var(--badge-bg);
  color: var(--badge-fg);
  white-space: nowrap;
}
.badge__dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.badge--neutral { --badge-bg: var(--surface-3); --badge-fg: var(--text-2); }
.badge--primary, .badge--success { --badge-bg: var(--success-soft); --badge-fg: var(--success-text); }
.badge--accent, .badge--warning { --badge-bg: var(--accent-soft); --badge-fg: var(--accent-text); }
.badge--info { --badge-bg: var(--info-soft); --badge-fg: var(--info-text); }
.badge--danger { --badge-bg: var(--danger-soft); --badge-fg: var(--danger-text); }
</style>
