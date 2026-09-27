<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import { useToast } from '@/core/composables/useToast'

const toast = useToast()
const icons = { success: 'check', error: 'alert', info: 'info' } as const
</script>

<template>
  <Teleport to="body">
    <div class="toaster" aria-live="polite">
      <TransitionGroup name="toast">
        <div v-for="item in toast.items" :key="item.id" class="toast" :class="`toast--${item.tone}`">
          <span class="toast__icon"><AppIcon :name="icons[item.tone]" :size="16" /></span>
          <div class="toast__text">
            <p class="toast__title">{{ item.title }}</p>
            <p v-if="item.description" class="toast__desc">{{ item.description }}</p>
          </div>
          <button type="button" class="toast__close" aria-label="Dismiss" @click="toast.dismiss(item.id)"><AppIcon name="x" :size="14" /></button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toaster {
  position: fixed; z-index: 200;
  top: var(--sp-4); right: var(--sp-4);
  display: flex; flex-direction: column; gap: var(--sp-2);
  width: min(380px, calc(100vw - 2 * var(--sp-4)));
  pointer-events: none;
}
.toast {
  --tone: var(--primary);
  pointer-events: auto;
  display: flex; align-items: flex-start; gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-4);
  background: var(--surface);
  border: 1px solid var(--line);
  border-left: 3px solid var(--tone);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-md);
}
.toast--error { --tone: var(--danger); }
.toast--info { --tone: var(--info); }
.toast__icon { color: var(--tone); margin-top: 2px; }
.toast__text { flex: 1; min-width: 0; }
.toast__title { font-weight: 600; font-size: var(--text-sm); }
.toast__desc { font-size: var(--text-xs); color: var(--text-2); margin-top: 2px; }
.toast__close { color: var(--text-3); padding: 2px; }
.toast__close:hover { color: var(--text); }

.toast-enter-active { transition: all var(--dur-slow) var(--ease-spring); }
.toast-leave-active { transition: all var(--dur) var(--ease); }
.toast-enter-from { opacity: 0; transform: translateX(24px) scale(0.96); }
.toast-leave-to { opacity: 0; transform: translateY(-8px) scale(0.96); }
.toast-move { transition: transform var(--dur) var(--ease); }
</style>
