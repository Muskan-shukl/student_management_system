<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/ui/AppIcon.vue'
import { DAYS, type Day, type TimetableSlot } from '@/core/api/types'
import { DAY_LABEL, formatTime } from '@/core/utils/format'

const props = defineProps<{ slots: TimetableSlot[]; today: Day; editable?: boolean }>()
const emit = defineEmits<{ edit: [slot: TimetableSlot]; remove: [slot: TimetableSlot]; add: [day: Day] }>()

const days = computed(() => DAYS.filter((d) => d !== 'sun' || props.slots.some((s) => s.day === 'sun')))
const byDay = computed(() => Object.fromEntries(days.value.map((d) => [d, props.slots.filter((s) => s.day === d)])) as Record<Day, TimetableSlot[]>)
</script>

<template>
  <div class="week">
    <section v-for="d in days" :key="d" class="day" :class="{ 'day--today': d === today }">
      <header class="day__head">
        <span class="day__name">{{ DAY_LABEL[d] }}</span>
        <span v-if="d === today" class="day__today">Today</span>
        <button v-if="editable" type="button" class="day__add" :aria-label="`Add class on ${DAY_LABEL[d]}`" @click="emit('add', d)"><AppIcon name="plus" :size="14" /></button>
      </header>
      <p v-if="!byDay[d].length" class="day__empty">No classes</p>
      <ul v-else class="day__list">
        <li v-for="(s, i) in byDay[d]" :key="s._id" class="slot reveal" :style="{ '--i': i }">
          <span class="slot__time mono">{{ formatTime(s.startTime) }}<br /><small>{{ formatTime(s.endTime) }}</small></span>
          <div class="slot__body">
            <p class="slot__subject">{{ s.subject }}</p>
            <p class="slot__meta"><template v-if="s.room">{{ s.room }}</template><template v-if="s.room && s.teacher"> · </template><template v-if="s.teacher">{{ s.teacher.name }}</template></p>
          </div>
          <div v-if="editable" class="slot__actions">
            <button type="button" class="iconbtn" title="Edit" @click="emit('edit', s)"><AppIcon name="edit" :size="14" /></button>
            <button type="button" class="iconbtn iconbtn--danger" title="Remove" @click="emit('remove', s)"><AppIcon name="trash" :size="14" /></button>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.week { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: var(--sp-4); }
.day { background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-lg); overflow: hidden; }
.day--today { border-color: var(--primary); box-shadow: 0 0 0 1px var(--primary); }
.day__head { display: flex; align-items: center; gap: 8px; padding: var(--sp-3) var(--sp-4); border-bottom: 1px solid var(--line); background: var(--surface-2); }
.day--today .day__head { background: var(--primary-soft); }
.day__name { font-family: var(--font-display); font-weight: 600; flex: 1; }
.day__today { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--primary-text); }
.day__add { width: 26px; height: 26px; display: grid; place-items: center; border-radius: var(--r-sm); color: var(--text-3); transition: all var(--dur-fast); }
.day__add:hover { background: var(--surface-3); color: var(--text); }
.day__empty { padding: var(--sp-5) var(--sp-4); font-size: var(--text-sm); color: var(--text-3); text-align: center; }
.day__list { display: flex; flex-direction: column; }
.slot { display: flex; gap: var(--sp-3); padding: var(--sp-3) var(--sp-4); border-bottom: 1px solid var(--line); align-items: flex-start; }
.slot:last-child { border-bottom: 0; }
.slot__time { font-size: var(--text-xs); font-weight: 600; line-height: 1.3; min-width: 58px; }
.slot__time small { color: var(--text-3); font-weight: 400; }
.slot__body { flex: 1; min-width: 0; }
.slot__subject { font-weight: 600; font-size: var(--text-sm); }
.slot__meta { font-size: var(--text-xs); color: var(--text-3); }
.slot__actions { display: flex; gap: 2px; opacity: 0; transition: opacity var(--dur-fast); }
.slot:hover .slot__actions, .slot:focus-within .slot__actions { opacity: 1; }
.iconbtn { padding: 5px; border-radius: var(--r-sm); color: var(--text-3); }
.iconbtn:hover { color: var(--primary-text); background: var(--primary-soft); }
.iconbtn--danger:hover { color: var(--danger-text); background: var(--danger-soft); }
@media (hover: none) { .slot__actions { opacity: 1; } }
</style>
