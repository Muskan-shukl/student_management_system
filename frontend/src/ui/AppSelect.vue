<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import AppField from './AppField.vue'
import AppIcon from './AppIcon.vue'

export interface SelectOption {
  value: string | number
  label: string
}

/**
 * Custom dropdown (replaces the native <select>, whose menu can't be styled and
 * misbehaves on narrow screens). Keyboard: ↑ ↓ Home End Enter Space Esc, type-ahead.
 * The list is teleported to <body> so it is never clipped inside scrolling modals.
 */
const props = defineProps<{
  label?: string
  error?: string
  hint?: string
  required?: boolean
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
}>()
const emit = defineEmits<{ blur: [] }>()
const model = defineModel<string | number | null | undefined>()

const id = useId()
const open = ref(false)
const active = ref(-1)
const trigger = ref<HTMLButtonElement | null>(null)
const list = ref<HTMLUListElement | null>(null)
const pos = ref({ top: 0, left: 0, width: 0, up: false, maxHeight: 280 })

const selectedIndex = computed(() => props.options.findIndex((o) => o.value === model.value))
const selected = computed(() => props.options[selectedIndex.value])

const place = () => {
  const r = trigger.value?.getBoundingClientRect()
  if (!r) return
  const below = window.innerHeight - r.bottom - 12
  const above = r.top - 12
  const up = below < 200 && above > below
  const maxHeight = Math.min(280, Math.max(140, up ? above : below))
  pos.value = { top: up ? r.top : r.bottom, left: r.left, width: r.width, up, maxHeight }
}

const show = () => {
  if (props.disabled) return
  place()
  open.value = true
  active.value = selectedIndex.value >= 0 ? selectedIndex.value : 0
  nextTick(() => list.value?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: 'nearest' }))
}
const hide = (focusBack = true) => {
  if (!open.value) return
  open.value = false
  emit('blur')
  if (focusBack) trigger.value?.focus()
}
const choose = (i: number) => {
  const opt = props.options[i]
  if (!opt) return
  model.value = opt.value
  hide()
}

let typed = ''
let typedTimer = 0
const onKey = (e: KeyboardEvent) => {
  const n = props.options.length
  if (!open.value) {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); show() }
    return
  }
  switch (e.key) {
    case 'ArrowDown': e.preventDefault(); active.value = (active.value + 1) % n; break
    case 'ArrowUp': e.preventDefault(); active.value = (active.value - 1 + n) % n; break
    case 'Home': e.preventDefault(); active.value = 0; break
    case 'End': e.preventDefault(); active.value = n - 1; break
    case 'Enter': case ' ': e.preventDefault(); choose(active.value); return
    case 'Escape': e.preventDefault(); hide(); return
    case 'Tab': hide(false); return
    default:
      if (e.key.length === 1) {
        typed += e.key.toLowerCase()
        window.clearTimeout(typedTimer)
        typedTimer = window.setTimeout(() => (typed = ''), 600)
        const i = props.options.findIndex((o) => o.label.toLowerCase().startsWith(typed))
        if (i !== -1) active.value = i
      }
      return
  }
  nextTick(() => list.value?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: 'nearest' }))
}

const onDocPointer = (e: Event) => {
  const t = e.target as Node
  if (trigger.value?.contains(t) || list.value?.contains(t)) return
  hide(false)
}
const onWindow = () => open.value && hide(false)
watch(open, (o) => {
  const m = o ? 'addEventListener' : 'removeEventListener'
  document[m]('pointerdown', onDocPointer, true)
  window[m]('resize', onWindow)
  window[m]('scroll', onWindow, true)
})
onBeforeUnmount(() => { document.removeEventListener('pointerdown', onDocPointer, true); window.removeEventListener('resize', onWindow); window.removeEventListener('scroll', onWindow, true) })
</script>

<template>
  <AppField :label="label" :error="error" :hint="hint" :required="required" :for="id">
    <button
      :id="id"
      ref="trigger"
      type="button"
      class="sel"
      :class="{ 'sel--open': open, 'sel--error': error, 'sel--placeholder': !selected }"
      :disabled="disabled"
      role="combobox"
      :aria-expanded="open"
      :aria-controls="`${id}-list`"
      aria-haspopup="listbox"
      :aria-invalid="Boolean(error)"
      @click="open ? hide() : show()"
      @keydown="onKey"
    >
      <span class="sel__text truncate">{{ selected?.label ?? placeholder ?? 'Select' }}</span>
      <AppIcon name="chevron-down" :size="16" class="sel__chevron" />
    </button>

    <Teleport to="body">
      <Transition name="sel">
        <ul
          v-if="open"
          :id="`${id}-list`"
          ref="list"
          class="sel__list"
          :class="{ 'sel__list--up': pos.up }"
          role="listbox"
          :style="{ top: `${pos.top}px`, left: `${pos.left}px`, width: `${pos.width}px`, maxHeight: `${pos.maxHeight}px` }"
        >
          <li
            v-for="(opt, i) in options"
            :key="opt.value"
            role="option"
            :aria-selected="opt.value === model"
            :data-active="i === active"
            class="sel__opt"
            :class="{ 'sel__opt--active': i === active, 'sel__opt--selected': opt.value === model }"
            @pointerenter="active = i"
            @click="choose(i)"
          >
            <span class="truncate">{{ opt.label }}</span>
            <AppIcon v-if="opt.value === model" name="check" :size="15" />
          </li>
          <li v-if="!options.length" class="sel__empty">No options</li>
        </ul>
      </Transition>
    </Teleport>
  </AppField>
</template>

<style scoped>
.sel {
  width: 100%; height: 44px; display: flex; align-items: center; gap: var(--sp-2);
  padding: 0 var(--sp-3); text-align: left;
  background: var(--surface); border: 1px solid var(--line-strong); border-radius: var(--r-md);
  font-size: var(--text-sm); color: var(--text);
  transition: border-color var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease);
}
.sel:focus-visible, .sel--open { border-color: var(--primary); box-shadow: var(--focus-ring); outline: none; }
.sel--error { border-color: var(--danger); }
.sel--placeholder { color: var(--text-3); }
.sel:disabled { background: var(--surface-2); opacity: 0.7; cursor: not-allowed; }
.sel__text { flex: 1; }
.sel__chevron { color: var(--text-3); transition: transform var(--dur) var(--ease); flex-shrink: 0; }
.sel--open .sel__chevron { transform: rotate(180deg); }
</style>

<style>
/* Global: the list is teleported to <body>, so scoped styles can't reach it. */
.sel__list {
  position: fixed; z-index: 300; margin: 0; padding: 6px; list-style: none;
  background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-md);
  box-shadow: var(--shadow-lg); overflow-y: auto; transform-origin: top; margin-top: 6px;
}
.sel__list--up { transform: translateY(calc(-100% - 12px)); transform-origin: bottom; }
.sel__opt {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 9px 10px; border-radius: var(--r-sm); font-size: var(--text-sm); color: var(--text); cursor: pointer;
}
.sel__opt--active { background: var(--surface-3); }
.sel__opt--selected { color: var(--primary-text); font-weight: 600; }
.sel__opt--selected svg { color: var(--primary-text); }
.sel__empty { padding: 10px; font-size: var(--text-sm); color: var(--text-3); text-align: center; }
.sel-enter-active { transition: opacity var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out); }
.sel-leave-active { transition: opacity 100ms var(--ease); }
.sel-enter-from { opacity: 0; transform: translateY(-4px); }
.sel__list--up.sel-enter-from { transform: translateY(calc(-100% - 8px)); }
.sel-leave-to { opacity: 0; }
</style>
