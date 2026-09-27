<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/ui/AppIcon.vue'

interface Pair { icon: string; topic: string; before: string; after: string; beforeTag: string; afterTag: string }
const PAIRS: Pair[] = [
  { icon: 'students', topic: 'Student records', beforeTag: 'Three spreadsheets', before: 'Names in one file, marks in another, phone numbers in a WhatsApp group. Nobody is sure which version is current.', afterTag: 'One profile', after: 'Every student has a single page: course, year, teacher, grades, attendance, guardian contact. Search it in a second.' },
  { icon: 'calendar', topic: 'Attendance', beforeTag: 'Paper register', before: 'Ticked in class, totalled at month end, noticed too late when someone has been missing for weeks.', afterTag: 'Marked in class, flagged the same day', after: 'Teachers tap Present, Late or Absent on a phone. Percentages update live and anyone under 75% is flagged for the admin.' },
  { icon: 'lock', topic: 'Who can see what', beforeTag: 'Shared password', before: 'One login for the office, passed around by message. Anyone with it can see — and change — everything.', afterTag: 'Approved & scoped', after: 'Teachers are approved before they get in, and only ever see the students assigned to them. Sign out ends every session.' },
  { icon: 'hat', topic: 'The student’s view', beforeTag: '“Ask your teacher”', before: 'Marks and attendance live on someone else’s desk. Students find out at the end of term, if at all.', afterTag: 'Their own dashboard', after: 'Grades, attendance, timetable and assignments the moment they’re entered. No asking, no surprises.' },
]

const after = ref(false)
</script>

<template>
  <div class="ba">
    <div class="ba__toggle" role="tablist">
      <button type="button" role="tab" :aria-selected="!after" class="ba__tab" :class="{ 'ba__tab--on': !after }" @click="after = false">Before Vidyara</button>
      <button type="button" role="tab" :aria-selected="after" class="ba__tab" :class="{ 'ba__tab--on': after }" @click="after = true">With Vidyara</button>
      <span class="ba__thumb" :class="{ 'ba__thumb--r': after }" />
    </div>

    <div class="ba__grid">
      <div v-for="(p, i) in PAIRS" :key="p.topic" class="flip" :class="{ 'flip--after': after }" :style="{ '--i': i }">
        <div class="flip__inner">
          <article class="face face--before">
            <span class="face__icon"><AppIcon :name="p.icon" :size="18" /></span>
            <p class="face__topic">{{ p.topic }}</p>
            <p class="face__tag">{{ p.beforeTag }}</p>
            <p class="face__text">{{ p.before }}</p>
          </article>
          <article class="face face--after">
            <span class="face__icon"><AppIcon :name="p.icon" :size="18" /></span>
            <p class="face__topic">{{ p.topic }}</p>
            <p class="face__tag"><AppIcon name="check" :size="12" /> {{ p.afterTag }}</p>
            <p class="face__text">{{ p.after }}</p>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ba__toggle { position: relative; display: inline-grid; grid-template-columns: 1fr 1fr; padding: 4px; border-radius: var(--r-full); background: var(--surface-3); margin: 0 auto var(--sp-8); left: 50%; transform: translateX(-50%); }
.ba__tab { position: relative; z-index: 1; padding: 10px 22px; border-radius: var(--r-full); font-size: var(--text-sm); font-weight: 600; color: var(--text-2); transition: color var(--dur); white-space: nowrap; }
.ba__tab--on { color: var(--on-primary); }
.ba__thumb { position: absolute; top: 4px; bottom: 4px; left: 4px; width: calc(50% - 4px); border-radius: var(--r-full); background: var(--primary); transition: transform var(--dur-slow) var(--ease-spring); }
.ba__thumb--r { transform: translateX(100%); }

.ba__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--sp-5); perspective: 1600px; }
.flip__inner { display: grid; transform-style: preserve-3d; transition: transform 800ms var(--ease-out); transition-delay: calc(var(--i) * 70ms); }
.flip--after .flip__inner { transform: rotateY(180deg); }
.face { grid-area: 1 / 1; backface-visibility: hidden; -webkit-backface-visibility: hidden; padding: var(--sp-6); border-radius: var(--r-xl); border: 1px solid var(--line); display: flex; flex-direction: column; }
.face--before { background: var(--surface); }
.face--before .face__icon { background: var(--surface-3); color: var(--text-3); }
.face--before .face__tag { color: var(--danger-text); text-decoration: line-through; text-decoration-color: color-mix(in srgb, var(--danger) 50%, transparent); }
.face--after { transform: rotateY(180deg); background: linear-gradient(160deg, var(--primary-soft), var(--surface)); border-color: color-mix(in srgb, var(--primary) 30%, var(--line)); }
.face--after .face__icon { background: var(--primary); color: var(--on-primary); }
.face--after .face__tag { color: var(--primary-text); display: inline-flex; align-items: center; gap: 6px; }
.face__icon { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; margin-bottom: var(--sp-4); }
.face__topic { font-size: var(--text-xs); font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-3); }
.face__tag { font-family: var(--font-display); font-size: var(--text-xl); font-weight: 600; margin: 6px 0 var(--sp-3); }
.face__text { color: var(--text-2); font-size: var(--text-sm); line-height: 1.65; }

@media (max-width: 760px) {
  .ba__grid { grid-template-columns: 1fr; }
  .ba__tab { padding: 9px 14px; font-size: var(--text-xs); }
}
</style>
