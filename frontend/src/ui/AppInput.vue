<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import AppField from './AppField.vue'
import AppIcon from './AppIcon.vue'

const props = defineProps<{
  label?: string
  error?: string
  hint?: string
  required?: boolean
  type?: string
  placeholder?: string
  icon?: string
  disabled?: boolean
  autocomplete?: string
  min?: string | number
  max?: string | number
  maxlength?: number | string
  inputmode?: 'text' | 'numeric' | 'tel' | 'email' | 'search' | 'none' | 'decimal' | 'url'
  /** Strip anything but digits as the user types (for phone-style fields). */
  digitsOnly?: boolean
}>()
const emit = defineEmits<{ blur: [] }>()
const model = defineModel<string | number | null>()

const id = useId()
const reveal = ref(false)
const isPassword = computed(() => props.type === 'password')
const inputType = computed(() => (isPassword.value && reveal.value ? 'text' : (props.type ?? 'text')))

const onInput = (e: Event) => {
  if (!props.digitsOnly) return
  const el = e.target as HTMLInputElement
  const digits = el.value.replace(/\D/g, '')
  if (digits !== el.value) {
    el.value = digits
    model.value = digits
  }
}
</script>

<template>
  <AppField :label="label" :error="error" :hint="hint" :required="required" :for="id">
    <div class="control" :class="{ 'control--error': error, 'control--disabled': disabled }">
      <AppIcon v-if="icon" :name="icon" :size="17" class="control__icon" />
      <input
        :id="id"
        v-model="model"
        :type="inputType"
        :placeholder="placeholder"
        :disabled="disabled"
        :autocomplete="autocomplete"
        :min="min"
        :max="max"
        :maxlength="maxlength"
        :inputmode="inputmode"
        :aria-invalid="Boolean(error)"
        class="control__input"
        @input="onInput"
        @blur="emit('blur')"
      />
      <button v-if="isPassword" type="button" class="control__toggle" :aria-label="reveal ? 'Hide password' : 'Show password'" @click="reveal = !reveal">
        <AppIcon :name="reveal ? 'eye-off' : 'eye'" :size="17" />
      </button>
    </div>
  </AppField>
</template>

<style scoped>
.control {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  height: 44px;
  padding: 0 var(--sp-3);
  background: var(--surface);
  border: 1px solid var(--line-strong);
  border-radius: var(--r-md);
  transition: border-color var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease), background var(--dur-fast);
}
.control:focus-within { border-color: var(--primary); box-shadow: var(--focus-ring); }
.control--error { border-color: var(--danger); }
.control--error:focus-within { box-shadow: 0 0 0 3px color-mix(in srgb, var(--danger) 22%, transparent); }
.control--disabled { background: var(--surface-2); opacity: 0.7; }
.control__icon { color: var(--text-3); }
.control__input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 0;
  background: transparent;
  outline: none;
  font-size: var(--text-sm);
}
.control__input::placeholder { color: var(--text-3); }
.control__input:focus, .control__input:focus-visible { outline: none; box-shadow: none; }
.control__input::-ms-reveal, .control__input::-ms-clear { display: none; }
.control__input::-webkit-credentials-auto-fill-button { visibility: hidden; }
.control__toggle { color: var(--text-3); display: grid; place-items: center; padding: 4px; border-radius: var(--r-sm); }
.control__toggle:hover { color: var(--text); }
input[type='date']::-webkit-calendar-picker-indicator { opacity: 0.55; cursor: pointer; }
</style>
