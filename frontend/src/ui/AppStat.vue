<script setup lang="ts">
import { toRef } from 'vue'
import AppIcon from './AppIcon.vue'
import { useCountUp } from '@/core/composables/useCountUp'

const props = defineProps<{
  label: string
  value: number | null | undefined
  suffix?: string
  icon: string
  tone?: 'primary' | 'accent' | 'info' | 'danger'
  hint?: string
  loading?: boolean
}>()
const display = useCountUp(toRef(props, 'value'))
</script>

<template>
  <div class="stat" :class="`stat--${tone ?? 'primary'}`">
    <div class="stat__icon"><AppIcon :name="icon" :size="20" /></div>
    <div class="stat__content">
      <p class="stat__label">{{ label }}</p>
      <div v-if="loading" class="stat__skeleton" />
      <p v-else class="stat__value mono">
        <template v-if="value === null || value === undefined">—</template>
        <template v-else>{{ display }}<span v-if="suffix" class="stat__suffix">{{ suffix }}</span></template>
      </p>
      <p v-if="hint" class="stat__hint">{{ hint }}</p>
    </div>
  </div>
</template>

<style scoped>
.stat {
  --tone: var(--primary);
  --tone-soft: var(--primary-soft);
  display: flex;
  gap: var(--sp-4);
  padding: var(--sp-5);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-xs);
  position: relative;
  overflow: hidden;
  transition: transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease);
}
.stat::after {
  content: '';
  position: absolute;
  inset: auto -20px -40px auto;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--tone-soft);
  opacity: 0.55;
  transition: transform var(--dur-slow) var(--ease);
}
.stat:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.stat:hover::after { transform: scale(1.25); }
.stat--accent { --tone: var(--accent-text); --tone-soft: var(--accent-soft); }
.stat--info { --tone: var(--info-text); --tone-soft: var(--info-soft); }
.stat--danger { --tone: var(--danger-text); --tone-soft: var(--danger-soft); }
.stat__icon {
  width: 44px; height: 44px; border-radius: var(--r-md);
  display: grid; place-items: center;
  background: var(--tone-soft); color: var(--tone);
  flex-shrink: 0; position: relative; z-index: 1;
}
.stat__content { position: relative; z-index: 1; min-width: 0; }
.stat__label { font-size: var(--text-sm); color: var(--text-2); font-weight: 500; }
.stat__value { font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 600; line-height: 1.2; margin-top: 2px; }
.stat__suffix { font-size: var(--text-md); color: var(--text-3); margin-left: 2px; }
.stat__hint { font-size: var(--text-xs); color: var(--text-3); margin-top: 4px; }
.stat__skeleton { height: 30px; width: 70px; margin-top: 4px; border-radius: var(--r-sm); background: var(--surface-3); }
</style>
