<script setup lang="ts">
import AppLogo from '@/ui/AppLogo.vue'
import AppIcon from '@/ui/AppIcon.vue'
import AuthScene from '@/modules/auth/components/AuthScene.vue'

defineProps<{ title: string; subtitle: string }>()
</script>

<template>
  <div class="auth">
    <aside class="auth__hero">
      <AuthScene />
      <RouterLink to="/" class="auth__brand"><AppLogo light :size="40" /></RouterLink>
    </aside>

    <main class="auth__panel">
      <RouterLink to="/" class="auth__back"><AppIcon name="arrow-left" :size="16" /> Back to site</RouterLink>
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

/* ---- left hero: matches the landing page (light default, theme-aware) ---- */
.auth__hero {
  --h-fg: var(--ink-900); --h-fg2: var(--ink-600);
  --h-glass: rgba(255, 255, 255, 0.6); --h-line: rgba(20, 24, 31, 0.14);
  --h-ell-a: rgba(101, 130, 90, 0.35); --h-ell-b: rgba(232, 163, 61, 0.26); --h-ell-c: rgba(140, 164, 126, 0.22);
  position: relative; overflow: hidden; isolation: isolate;
  display: flex; flex-direction: column; justify-content: space-between;
  padding: var(--sp-10);
  background:
    radial-gradient(720px 520px at 8% 6%, var(--h-ell-c), transparent 60%),
    radial-gradient(820px 560px at 100% 8%, var(--h-ell-a), transparent 62%),
    radial-gradient(760px 520px at 12% 108%, var(--h-ell-b), transparent 60%),
    var(--paper-100);
  color: var(--h-fg);
  transition: background var(--dur) var(--ease), color var(--dur) var(--ease);
}
:root[data-theme='dark'] .auth__hero {
  --h-fg: #f4f2ec; --h-fg2: rgba(244, 242, 236, 0.66);
  --h-glass: rgba(255, 255, 255, 0.05); --h-line: rgba(244, 242, 236, 0.14);
  --h-ell-a: rgba(101, 130, 90, 0.5); --h-ell-b: rgba(232, 163, 61, 0.24); --h-ell-c: rgba(159, 211, 184, 0.14);
  background:
    radial-gradient(720px 520px at 8% 6%, var(--h-ell-c), transparent 60%),
    radial-gradient(820px 560px at 100% 8%, var(--h-ell-a), transparent 62%),
    radial-gradient(760px 520px at 12% 108%, var(--h-ell-b), transparent 60%),
    #0b1412;
}
/* dotted grain, faded at the edges */
.auth__hero::before {
  content: ''; position: absolute; inset: 0; z-index: -1;
  background-image: radial-gradient(currentColor 1px, transparent 1px);
  background-size: 24px 24px; opacity: 0.05;
  mask-image: radial-gradient(120% 90% at 50% 40%, black, transparent 78%);
}
.auth__brand { position: relative; display: flex; align-items: center; gap: var(--sp-3); width: fit-content; text-decoration: none; }
.auth__brand:hover { text-decoration: none; }

/* ---- right panel: the form ---- */
.auth__panel { position: relative; display: grid; place-items: center; padding: var(--sp-5) var(--sp-6); background: var(--bg); }
.auth__back { position: absolute; top: var(--sp-5); right: var(--sp-8); display: inline-flex; align-items: center; gap: 6px; font-size: var(--text-sm); font-weight: 500; color: var(--text-3); }
.auth__back:hover { color: var(--primary-text); text-decoration: none; }
.auth__form { width: 100%; max-width: 440px; }
.auth__head { margin-bottom: var(--sp-5); }
.auth__head h1 { font-size: var(--text-2xl); margin-bottom: var(--sp-1); }

@media (max-width: 900px) {
  .auth { grid-template-columns: 1fr; }
  .auth__hero { padding: var(--sp-6); min-height: 260px; }
  .auth__back { display: none; }
  .auth__panel { padding: var(--sp-6) var(--sp-4) var(--sp-8); align-items: start; }
}
</style>
