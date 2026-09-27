<script setup lang="ts">
import AppIcon from './AppIcon.vue'

defineProps<{ icon?: string; title: string; description?: string; compact?: boolean }>()
</script>

<template>
  <div class="empty" :class="{ 'empty--compact': compact }">
    <div class="empty__art">
      <span class="empty__ring" />
      <span class="empty__ring empty__ring--2" />
      <AppIcon :name="icon ?? 'inbox'" :size="compact ? 22 : 28" />
    </div>
    <h4 class="empty__title">{{ title }}</h4>
    <p v-if="description" class="empty__desc">{{ description }}</p>
    <div v-if="$slots.default" class="empty__action"><slot /></div>
  </div>
</template>

<style scoped>
.empty {
  display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: var(--sp-12) var(--sp-6);
  animation: fade-in var(--dur-slow) var(--ease-out);
}
.empty--compact { padding: var(--sp-8) var(--sp-4); }
.empty__art {
  position: relative; display: grid; place-items: center;
  width: 72px; height: 72px; margin-bottom: var(--sp-4);
  color: var(--primary-text);
}
.empty--compact .empty__art { width: 56px; height: 56px; }
.empty__ring {
  position: absolute; inset: 0; border-radius: 50%;
  background: var(--primary-soft); opacity: 0.6;
}
.empty__ring--2 { inset: -12px; opacity: 0.25; animation: float 4s var(--ease) infinite; }
.empty__title { font-size: var(--text-lg); }
.empty__desc { color: var(--text-3); font-size: var(--text-sm); max-width: 340px; margin-top: 6px; }
.empty__action { margin-top: var(--sp-5); }
</style>
