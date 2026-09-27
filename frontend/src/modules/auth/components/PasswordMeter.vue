<script setup lang="ts">
import { computed } from 'vue'
import { passwordStrength } from '../schemas'

const props = defineProps<{ value: string }>()
const score = computed(() => passwordStrength(props.value))
const label = computed(() => ['', 'Weak', 'Fair', 'Good', 'Strong'][score.value])
</script>

<template>
  <div v-if="value" class="meter" aria-live="polite">
    <div class="meter__bars">
      <span v-for="i in 4" :key="i" class="meter__bar" :class="{ 'meter__bar--on': i <= score, [`meter__bar--${score}`]: i <= score }" />
    </div>
    <span class="meter__label">{{ label }}</span>
  </div>
</template>

<style scoped>
.meter { display: flex; align-items: center; gap: var(--sp-3); margin-top: -2px; }
.meter__bars { display: flex; gap: 4px; flex: 1; }
.meter__bar { height: 4px; flex: 1; border-radius: var(--r-full); background: var(--surface-3); transition: background var(--dur) var(--ease); }
.meter__bar--1 { background: var(--danger); }
.meter__bar--2 { background: var(--accent); }
.meter__bar--3 { background: var(--info); }
.meter__bar--4 { background: var(--success); }
.meter__label { font-size: var(--text-xs); color: var(--text-3); min-width: 44px; text-align: right; }
</style>
