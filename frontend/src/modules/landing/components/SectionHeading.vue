<script setup lang="ts">
defineProps<{ eyebrow: string; title: string; description?: string; align?: 'left' | 'center' }>()
</script>

<template>
  <div v-reveal class="sh" :class="`sh--${align ?? 'center'}`">
    <p class="sh__eyebrow">{{ eyebrow }}</p>
    <h2 class="sh__title"><slot name="title">{{ title }}</slot></h2>
    <p v-if="description" class="sh__desc">{{ description }}</p>
  </div>
</template>

<style scoped>
.sh { max-width: 640px; margin-bottom: var(--sp-10); }
.sh--center { margin-left: auto; margin-right: auto; text-align: center; }
.sh__eyebrow { display: inline-block; font-size: var(--text-xs); font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--primary-text); background: var(--primary-soft); padding: 5px 12px; border-radius: var(--r-full); margin-bottom: var(--sp-4); }
.sh__title { font-size: clamp(1.9rem, 3.6vw, 2.75rem); letter-spacing: -0.02em; }
.sh__title :deep(em) { font-style: italic; font-weight: 500; color: var(--accent-text); }
.sh__desc { color: var(--text-2); font-size: var(--text-lg); margin-top: var(--sp-4); line-height: 1.6; }
</style>
