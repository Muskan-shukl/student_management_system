<script setup lang="ts">
import { useId } from 'vue'
import AppField from './AppField.vue'

defineProps<{ label?: string; error?: string; hint?: string; required?: boolean; placeholder?: string; rows?: number; maxlength?: number }>()
const emit = defineEmits<{ blur: [] }>()
const model = defineModel<string>()
const id = useId()
</script>

<template>
  <AppField :label="label" :error="error" :hint="hint" :required="required" :for="id">
    <textarea
      :id="id"
      v-model="model"
      :rows="rows ?? 3"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :aria-invalid="Boolean(error)"
      class="textarea"
      :class="{ 'textarea--error': error }"
      @blur="emit('blur')"
    />
    <span v-if="maxlength" class="textarea__count">{{ model?.length ?? 0 }}/{{ maxlength }}</span>
  </AppField>
</template>

<style scoped>
.textarea {
  width: 100%;
  padding: var(--sp-3);
  resize: vertical;
  background: var(--surface);
  border: 1px solid var(--line-strong);
  border-radius: var(--r-md);
  font-size: var(--text-sm);
  line-height: 1.5;
  outline: none;
  transition: border-color var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease);
}
.textarea:focus { border-color: var(--primary); box-shadow: var(--focus-ring); }
.textarea--error { border-color: var(--danger); }
.textarea__count { align-self: flex-end; font-size: var(--text-xs); color: var(--text-3); margin-top: -2px; }
</style>
