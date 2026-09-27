<script setup lang="ts">
defineProps<{ size?: number; light?: boolean; hideName?: boolean }>()
</script>

<template>
  <span class="logo" :class="{ 'logo--light': light }" :style="{ '--logo-size': `${size ?? 36}px` }">
    <svg :width="size ?? 36" :height="size ?? 36" viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="18" class="logo__bg" />
      <path d="M16 18l16 30 16-30" fill="none" class="logo__v" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="32" cy="20" r="5.5" fill="#e8a33d" />
    </svg>
    <span v-if="!hideName" class="logo__name">Vidyara</span>
  </span>
</template>

<style scoped>
.logo { display: inline-flex; align-items: center; gap: var(--sp-3); color: var(--text); }
.logo__bg { fill: var(--primary); }
.logo__v { stroke: var(--on-primary); }
.logo--light { color: #fff; }
.logo--light .logo__bg { fill: var(--accent); }
.logo--light .logo__v { stroke: var(--ink-900); }
.logo__name { font-family: var(--font-display); font-size: calc(var(--logo-size, 36px) * 0.6); font-weight: 600; letter-spacing: -0.01em; }
</style>
