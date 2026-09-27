<script setup lang="ts">
import AppIcon from '@/ui/AppIcon.vue'
defineProps<{ items: { icon: string; text: string }[] }>()
</script>

<template>
  <div class="mq" aria-hidden="true">
    <div class="mq__track">
      <template v-for="n in 2" :key="n">
        <span v-for="it in items" :key="n + it.text" class="mq__item"><AppIcon :name="it.icon" :size="15" />{{ it.text }}</span>
      </template>
    </div>
  </div>
</template>

<style scoped>
.mq { overflow: hidden; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); background: var(--surface); mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent); }
.mq__track { display: flex; width: max-content; animation: scroll 38s linear infinite; }
.mq:hover .mq__track { animation-play-state: paused; }
.mq__item { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; font-size: var(--text-sm); font-weight: 500; color: var(--text-2); white-space: nowrap; border-right: 1px solid var(--line); }
.mq__item svg { color: var(--primary-text); }
@keyframes scroll { to { transform: translateX(-50%); } }
</style>
