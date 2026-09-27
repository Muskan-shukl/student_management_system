<script setup lang="ts">
import { computed } from 'vue'
import { initials } from '@/core/utils/format'

const props = defineProps<{ name: string; size?: number; tone?: 'primary' | 'accent' | 'info' }>()
const text = computed(() => initials(props.name))
// Deterministic hue per name so avatars vary but stay stable.
const hue = computed(() => [...props.name].reduce((n, c) => n + c.charCodeAt(0), 0) % 360)
</script>

<template>
  <span class="avatar" :style="{ '--size': `${size ?? 36}px`, '--h': hue }" :title="name">{{ text }}</span>
</template>

<style scoped>
.avatar {
  --size: 36px;
  display: inline-grid;
  place-items: center;
  width: var(--size);
  height: var(--size);
  border-radius: 40%;
  flex-shrink: 0;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: calc(var(--size) * 0.38);
  letter-spacing: 0.02em;
  color: hsl(var(--h) 45% 26%);
  background: linear-gradient(135deg, hsl(var(--h) 60% 90%), hsl(calc(var(--h) + 30) 55% 82%));
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);
}
:root[data-theme='dark'] .avatar {
  color: hsl(var(--h) 60% 85%);
  background: linear-gradient(135deg, hsl(var(--h) 35% 28%), hsl(calc(var(--h) + 30) 35% 22%));
}
</style>
