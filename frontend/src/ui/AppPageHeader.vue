<script setup lang="ts">
defineProps<{ title: string; eyebrow?: string; description?: string }>()
</script>

<template>
  <header class="page-head reveal">
    <div class="page-head__text">
      <p v-if="eyebrow" class="page-head__eyebrow">{{ eyebrow }}</p>
      <h1 class="page-head__title">{{ title }}</h1>
      <p v-if="description" class="page-head__desc">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="page-head__actions"><slot name="actions" /></div>
  </header>
</template>

<style scoped>
.page-head { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--sp-4); flex-wrap: wrap; margin-bottom: var(--sp-6); }
.page-head__eyebrow { font-size: var(--text-xs); font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--primary-text); margin-bottom: var(--sp-2); }
.page-head__title { font-size: clamp(1.7rem, 3vw, 2.25rem); }
.page-head__desc { color: var(--text-2); margin-top: var(--sp-2); max-width: 60ch; }
.page-head__actions { display: flex; gap: var(--sp-2); flex-wrap: wrap; }
</style>
