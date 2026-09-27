<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import AppSpinner from './AppSpinner.vue'

withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent'
    size?: 'sm' | 'md' | 'lg'
    icon?: string
    iconRight?: string
    loading?: boolean
    disabled?: boolean
    block?: boolean
    type?: 'button' | 'submit'
  }>(),
  { variant: 'primary', size: 'md', type: 'button' }
)
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="['btn', `btn--${variant}`, `btn--${size}`, { 'btn--block': block, 'btn--loading': loading }]"
  >
    <AppSpinner v-if="loading" size="16" class="btn__spinner" />
    <AppIcon v-else-if="icon" :name="icon" :size="size === 'sm' ? 15 : 17" />
    <span v-if="$slots.default" class="btn__label"><slot /></span>
    <AppIcon v-if="iconRight && !loading" :name="iconRight" :size="size === 'sm' ? 15 : 17" />
  </button>
</template>

<style scoped>
.btn {
  --btn-bg: var(--primary);
  --btn-fg: var(--on-primary);
  --btn-bg-hover: var(--primary-hover);
  --btn-border: transparent;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  padding: 0 var(--sp-4);
  height: 40px;
  border-radius: var(--r-md);
  background: var(--btn-bg);
  color: var(--btn-fg);
  border: 1px solid var(--btn-border);
  font-weight: 600;
  font-size: var(--text-sm);
  letter-spacing: 0.01em;
  white-space: nowrap;
  transition:
    background-color var(--dur-fast) var(--ease),
    transform var(--dur-fast) var(--ease),
    box-shadow var(--dur-fast) var(--ease),
    opacity var(--dur-fast) var(--ease);
}
.btn:hover:not(:disabled) { background: var(--btn-bg-hover); }
.btn:active:not(:disabled) { transform: translateY(1px) scale(0.985); }
.btn:disabled { opacity: 0.55; }
.btn--loading { opacity: 0.85; }

.btn--sm { height: 32px; padding: 0 var(--sp-3); font-size: var(--text-xs); border-radius: var(--r-sm); }
.btn--lg { height: 48px; padding: 0 var(--sp-6); font-size: var(--text-md); border-radius: var(--r-lg); }
.btn--block { width: 100%; }

.btn--primary { box-shadow: 0 1px 0 rgba(255, 255, 255, 0.12) inset, var(--shadow-xs); }
.btn--secondary {
  --btn-bg: var(--surface);
  --btn-fg: var(--text);
  --btn-bg-hover: var(--surface-2);
  --btn-border: var(--line-strong);
}
.btn--ghost {
  --btn-bg: transparent;
  --btn-fg: var(--text-2);
  --btn-bg-hover: var(--surface-3);
}
.btn--ghost:hover:not(:disabled) { color: var(--text); }
.btn--danger {
  --btn-bg: var(--danger-soft);
  --btn-fg: var(--danger-text);
  --btn-bg-hover: var(--danger);
}
.btn--danger:hover:not(:disabled) { color: #fff; }
.btn--accent {
  --btn-bg: var(--accent);
  --btn-fg: var(--ink-900);
  --btn-bg-hover: var(--saffron-600);
}
</style>
