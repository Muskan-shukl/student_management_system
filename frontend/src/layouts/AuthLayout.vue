<script setup lang="ts">
import AppLogo from '@/ui/AppLogo.vue'

defineProps<{ title: string; subtitle: string }>()
</script>

<template>
  <div class="auth">
    <aside class="auth__hero">
      <RouterLink to="/" class="auth__brand"><AppLogo light :size="40" /></RouterLink>
      <div class="auth__copy">
        <p class="auth__eyebrow">Student management, done right</p>
        <h2 class="auth__headline">One campus. <br /><em>Three roles.</em> <br />Zero confusion.</h2>
        <p class="auth__sub">Admins run the system, teachers track progress, students see exactly what matters to them.</p>
      </div>
      <ul class="auth__cards" aria-hidden="true">
        <li class="fcard fcard--1"><span class="fcard__dot" />Attendance 92%</li>
        <li class="fcard fcard--2"><span class="fcard__dot fcard__dot--amber" />Teacher approved</li>
        <li class="fcard fcard--3"><span class="fcard__dot fcard__dot--blue" />Grades updated</li>
      </ul>
    </aside>

    <main class="auth__panel">
      <div class="auth__form">
        <header class="auth__head reveal">
          <h1>{{ title }}</h1>
          <p class="text-2">{{ subtitle }}</p>
        </header>
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.auth { min-height: 100dvh; display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 6fr); }

.auth__hero {
  position: relative; overflow: hidden;
  display: flex; flex-direction: column; justify-content: space-between;
  padding: var(--sp-10);
  background:
    radial-gradient(900px 500px at -10% 110%, rgba(232, 163, 61, 0.28), transparent 60%),
    radial-gradient(700px 500px at 110% -10%, rgba(42, 147, 119, 0.5), transparent 60%),
    var(--pine-900);
  color: rgba(244, 242, 236, 0.85);
}
.auth__hero::before {
  content: ''; position: absolute; inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px);
  background-size: 22px 22px;
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}
.auth__brand { position: relative; display: flex; align-items: center; gap: var(--sp-3); font-family: var(--font-display); font-size: var(--text-xl); font-weight: 600; color: #fff; text-decoration: none; width: fit-content; }
.auth__brand:hover { text-decoration: none; }
.auth__copy { position: relative; max-width: 440px; margin: var(--sp-12) 0; }
.auth__eyebrow { font-size: var(--text-xs); font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--saffron-200); animation: fade-up var(--dur-slow) var(--ease-out) both; }
.auth__headline { font-size: clamp(2.2rem, 4vw, 3.4rem); color: #fff; margin: var(--sp-4) 0; line-height: 1.05; animation: fade-up var(--dur-slow) var(--ease-out) 80ms both; }
.auth__headline em { font-style: italic; font-weight: 500; color: var(--saffron-200); }
.auth__sub { font-size: var(--text-md); line-height: 1.6; animation: fade-up var(--dur-slow) var(--ease-out) 160ms both; }

.auth__cards { position: relative; display: flex; gap: var(--sp-3); flex-wrap: wrap; }
.fcard {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 14px; border-radius: var(--r-full);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(8px);
  font-size: var(--text-sm); font-weight: 500; color: #fff;
  animation: float 6s var(--ease) infinite;
}
.fcard--1 { --rot: -2deg; }
.fcard--2 { --rot: 1.5deg; animation-delay: -2s; }
.fcard--3 { --rot: -1deg; animation-delay: -4s; }
.fcard__dot { width: 8px; height: 8px; border-radius: 50%; background: #5dd6b1; box-shadow: 0 0 0 4px rgba(93, 214, 177, 0.2); }
.fcard__dot--amber { background: var(--accent); box-shadow: 0 0 0 4px rgba(232, 163, 61, 0.2); }
.fcard__dot--blue { background: #7fb0ff; box-shadow: 0 0 0 4px rgba(127, 176, 255, 0.2); }

.auth__panel { display: grid; place-items: center; padding: var(--sp-8) var(--sp-6); }
.auth__form { width: 100%; max-width: 440px; }
.auth__head { margin-bottom: var(--sp-8); }
.auth__head h1 { font-size: var(--text-3xl); margin-bottom: var(--sp-2); }

@media (max-width: 900px) {
  .auth { grid-template-columns: 1fr; }
  .auth__hero { padding: var(--sp-6); min-height: 0; }
  .auth__copy { margin: var(--sp-6) 0; }
  .auth__headline { font-size: 1.9rem; }
  .auth__headline br { display: none; }
  .auth__sub { display: none; }
  .auth__cards { display: none; }
  .auth__panel { padding: var(--sp-8) var(--sp-4) var(--sp-12); align-items: start; }
}
</style>
