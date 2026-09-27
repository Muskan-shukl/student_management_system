<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/ui/AppIcon.vue'

defineProps<{ items: { q: string; a: string }[] }>()
const open = ref<number | null>(0)
</script>

<template>
  <ul class="faq">
    <li v-for="(it, i) in items" :key="it.q" class="faq__item" :class="{ 'faq__item--open': open === i }">
      <button type="button" class="faq__q" :aria-expanded="open === i" @click="open = open === i ? null : i">
        <span class="faq__text">{{ it.q }}</span>
        <span class="faq__icon"><AppIcon name="plus" :size="18" /></span>
      </button>
      <div class="faq__a"><div class="faq__a-inner"><p>{{ it.a }}</p></div></div>
    </li>
  </ul>
</template>

<style scoped>
.faq { border-top: 1px solid var(--line-strong); }
.faq__item { border-bottom: 1px solid var(--line-strong); }
.faq__q { width: 100%; display: flex; align-items: center; gap: var(--sp-5); padding: var(--sp-5) 0; text-align: left; color: var(--text); }
.faq__text { flex: 1; font-family: var(--font-display); font-size: var(--text-xl); }
.faq__icon { width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--line-strong); display: grid; place-items: center; flex-shrink: 0; transition: transform var(--dur-slow) var(--ease-spring), background var(--dur), color var(--dur); }
.faq__item--open .faq__icon { transform: rotate(45deg); background: var(--primary); color: var(--on-primary); border-color: var(--primary); }
.faq__a { display: grid; grid-template-rows: 0fr; transition: grid-template-rows var(--dur-slow) var(--ease-out); }
.faq__item--open .faq__a { grid-template-rows: 1fr; }
.faq__a-inner { overflow: hidden; }
.faq__a p { padding: 0 0 var(--sp-6); color: var(--text-2); line-height: 1.65; max-width: 64ch; }
@media (max-width: 560px) { .faq__text { font-size: var(--text-lg); } }
</style>
