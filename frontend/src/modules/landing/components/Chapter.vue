<script setup lang="ts">
/** A full-width page chapter: dark or cream, with an eyebrow + bold-emphasis headline. */
defineProps<{ tone: 'dark' | 'cream'; eyebrow?: string; id?: string; tight?: boolean }>()
</script>

<template>
  <section :id="id" class="ch" :class="[`ch--${tone}`, tone === 'dark' ? 'force-dark' : 'force-light', { 'ch--tight': tight }]">
    <div class="ch__inner">
      <header v-if="eyebrow || $slots.title" v-reveal class="ch__head">
        <p v-if="eyebrow" class="ch__eyebrow"><span class="ch__rule" />{{ eyebrow }}</p>
        <h2 v-if="$slots.title" class="ch__title"><slot name="title" /></h2>
        <p v-if="$slots.lead" class="ch__lead"><slot name="lead" /></p>
      </header>
      <slot />
    </div>
  </section>
</template>

<style scoped>
.ch { position: relative; padding: clamp(4rem, 9vw, 8rem) 0; background: var(--bg); color: var(--text); overflow: clip; }
.ch--tight { padding: clamp(3rem, 6vw, 5rem) 0; }
.ch__inner { max-width: 1180px; margin: 0 auto; padding: 0 var(--sp-6); }
.ch__head { max-width: 760px; margin-bottom: clamp(2.5rem, 5vw, 4rem); }
.ch__eyebrow { display: flex; align-items: center; gap: 12px; font-size: 11px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--accent-text); margin-bottom: var(--sp-5); }
.ch__rule { width: 28px; height: 1px; background: var(--accent); }
.ch__title { font-size: clamp(2.2rem, 5vw, 3.8rem); line-height: 1.02; letter-spacing: -0.025em; font-weight: 400; }
.ch__title :deep(b), .ch__title :deep(strong) { font-weight: 700; }
.ch__title :deep(em) { font-style: italic; font-weight: 400; color: var(--accent-text); }
.ch__lead { color: var(--text-2); font-size: var(--text-lg); line-height: 1.65; margin-top: var(--sp-5); max-width: 60ch; }
@media (max-width: 560px) { .ch__inner { padding: 0 var(--sp-4); } }
</style>
