<script setup lang="ts">
defineProps<{ title?: string; subtitle?: string; flush?: boolean; hover?: boolean }>()
</script>

<template>
  <section class="card" :class="{ 'card--hover': hover }">
    <header v-if="title || $slots.header || $slots.actions" class="card__head">
      <div class="card__heading">
        <slot name="header">
          <h3 class="card__title">{{ title }}</h3>
          <p v-if="subtitle" class="card__subtitle">{{ subtitle }}</p>
        </slot>
      </div>
      <div v-if="$slots.actions" class="card__actions"><slot name="actions" /></div>
    </header>
    <div class="card__body" :class="{ 'card__body--padded': !flush }"><slot /></div>
    <footer v-if="$slots.footer" class="card__foot"><slot name="footer" /></footer>
  </section>
</template>

<style scoped>
.card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-xs);
  overflow: hidden;
  transition: box-shadow var(--dur) var(--ease), transform var(--dur) var(--ease), border-color var(--dur);
}
.card--hover:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); border-color: var(--line-strong); }
.card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--sp-4);
  padding: var(--sp-5) var(--sp-5) 0;
}
.card__title { font-size: var(--text-lg); }
.card__subtitle { font-size: var(--text-sm); color: var(--text-3); margin-top: 2px; }
.card__actions { display: flex; gap: var(--sp-2); flex-shrink: 0; }
.card__body--padded { padding: var(--sp-5); }
.card__head + .card__body--padded { padding-top: var(--sp-5); }
.card__foot { padding: var(--sp-4) var(--sp-5); border-top: 1px solid var(--line); background: var(--surface-2); }
</style>
