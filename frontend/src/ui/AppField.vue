<script setup lang="ts">
/** Label + control + hint/error wrapper shared by every input type. */
defineProps<{ label?: string; error?: string; hint?: string; required?: boolean; for?: string }>()
</script>

<template>
  <div class="field" :class="{ 'field--error': error }">
    <label v-if="label" :for="for" class="field__label">
      {{ label }}<span v-if="required" class="field__req" aria-hidden="true">*</span>
    </label>
    <slot />
    <Transition name="fade">
      <p v-if="error" class="field__msg field__msg--error" role="alert">{{ error }}</p>
      <p v-else-if="hint" class="field__msg">{{ hint }}</p>
    </Transition>
  </div>
</template>

<style scoped>
.field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.field__label { font-size: var(--text-sm); font-weight: 600; color: var(--text); }
.field__req { color: var(--danger); margin-left: 3px; }
.field__msg { font-size: var(--text-xs); color: var(--text-3); line-height: 1.4; }
.field__msg--error { color: var(--danger-text); }
</style>
