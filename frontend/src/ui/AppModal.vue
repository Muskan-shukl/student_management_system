<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps<{ open: boolean; title: string; description?: string; size?: 'sm' | 'md' | 'lg'; persistent?: boolean }>()
const emit = defineEmits<{ close: [] }>()

const close = () => !props.persistent && emit('close')
const onKey = (e: KeyboardEvent) => e.key === 'Escape' && props.open && close()

watch(
  () => props.open,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
    open ? window.addEventListener('keydown', onKey) : window.removeEventListener('keydown', onKey)
  },
  { immediate: true }
)
onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal" role="dialog" aria-modal="true" :aria-label="title">
        <div class="modal__backdrop" @click="close" />
        <div class="modal__panel" :class="`modal__panel--${size ?? 'md'}`">
          <header class="modal__head">
            <div>
              <h3 class="modal__title">{{ title }}</h3>
              <p v-if="description" class="modal__desc">{{ description }}</p>
            </div>
            <button type="button" class="modal__close" aria-label="Close" @click="emit('close')"><AppIcon name="x" /></button>
          </header>
          <div class="modal__body"><slot /></div>
          <footer v-if="$slots.footer" class="modal__foot"><slot name="footer" /></footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; padding: var(--sp-4); }
.modal__backdrop { position: absolute; inset: 0; background: rgba(12, 16, 22, 0.55); backdrop-filter: blur(4px); }
.modal__panel {
  position: relative;
  width: 100%;
  max-height: calc(100dvh - 2 * var(--sp-4));
  display: flex; flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r-xl);
  box-shadow: var(--shadow-lg);
}
.modal__panel--sm { max-width: 420px; }
.modal__panel--md { max-width: 560px; }
.modal__panel--lg { max-width: 760px; }
.modal__head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--sp-4); padding: var(--sp-6) var(--sp-6) 0; }
.modal__title { font-size: var(--text-xl); }
.modal__desc { color: var(--text-3); font-size: var(--text-sm); margin-top: 4px; }
.modal__close { color: var(--text-3); padding: 6px; border-radius: var(--r-sm); transition: background var(--dur-fast), color var(--dur-fast); }
.modal__close:hover { background: var(--surface-3); color: var(--text); }
.modal__body { padding: var(--sp-5) var(--sp-6); overflow-y: auto; }
.modal__foot { display: flex; justify-content: flex-end; gap: var(--sp-2); padding: var(--sp-4) var(--sp-6); border-top: 1px solid var(--line); background: var(--surface-2); border-radius: 0 0 var(--r-xl) var(--r-xl); }

.modal-enter-active { transition: opacity var(--dur) var(--ease-out); }
.modal-leave-active { transition: opacity var(--dur-fast) var(--ease); }
.modal-enter-active .modal__panel { animation: scale-in var(--dur-slow) var(--ease-spring); }
.modal-enter-from, .modal-leave-to { opacity: 0; }

@media (max-width: 560px) {
  .modal { padding: 0; align-items: end; }
  .modal__panel { max-height: 92dvh; border-radius: var(--r-xl) var(--r-xl) 0 0; }
  .modal__foot { border-radius: 0; }
}
</style>
