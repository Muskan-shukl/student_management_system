<script setup lang="ts">
defineProps<{ width?: string; height?: string; radius?: string; lines?: number }>()
</script>

<template>
  <div v-if="lines" class="skeleton-lines">
    <span v-for="i in lines" :key="i" class="skeleton" :style="{ width: i === lines ? '60%' : '100%', height: height ?? '12px' }" />
  </div>
  <span v-else class="skeleton" :style="{ width: width ?? '100%', height: height ?? '14px', borderRadius: radius }" />
</template>

<style scoped>
.skeleton {
  display: block;
  border-radius: var(--r-sm);
  background: linear-gradient(90deg, var(--surface-3) 25%, var(--surface-2) 50%, var(--surface-3) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s linear infinite;
}
.skeleton-lines { display: flex; flex-direction: column; gap: 8px; }
</style>
