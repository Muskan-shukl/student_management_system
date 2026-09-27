<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import AppLogo from '@/ui/AppLogo.vue'
import AppButton from '@/ui/AppButton.vue'
import { useAuthStore } from '@/core/stores/auth'

/** `darkHero` = the first viewport is a dark section, so the bar stays light-on-dark while over it. */
const props = defineProps<{ darkHero?: boolean }>()

const auth = useAuthStore()
const scrolled = ref(false)
const overHero = ref(true)
const onScroll = () => {
  scrolled.value = window.scrollY > 24
  overHero.value = window.scrollY < window.innerHeight - 72
}
onMounted(() => { onScroll(); window.addEventListener('scroll', onScroll, { passive: true }) })
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

const LINKS = [
  { href: '#roles', label: 'Roles' },
  { href: '#day', label: 'A day on campus' },
  { href: '#try', label: 'Try it' },
  { href: '#features', label: 'Features' },
]
</script>

<template>
  <header class="nav" :class="{ 'nav--scrolled': scrolled, 'nav--dark': props.darkHero && overHero }">
    <div class="nav__inner">
      <RouterLink to="/" class="brand"><AppLogo /></RouterLink>

      <nav class="links">
        <a v-for="l in LINKS" :key="l.href" :href="l.href" class="links__a">{{ l.label }}</a>
      </nav>

      <div class="actions">
        <template v-if="auth.isAuthenticated">
          <AppButton icon-right="arrow-right" @click="$router.push('/dashboard')">Go to dashboard</AppButton>
        </template>
        <template v-else>
          <AppButton variant="ghost" @click="$router.push({ name: 'login' })">Sign in</AppButton>
          <AppButton @click="$router.push({ name: 'signup' })">Get started</AppButton>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped>
.nav { position: sticky; top: 0; z-index: 50; transition: background var(--dur) var(--ease), box-shadow var(--dur) var(--ease), border-color var(--dur); border-bottom: 1px solid transparent; }
.nav--scrolled { background: color-mix(in srgb, var(--bg) 82%, transparent); backdrop-filter: blur(14px); border-color: var(--line); }
.nav__inner { max-width: 1560px; margin: 0 auto; padding: var(--sp-4) var(--sp-10); display: flex; align-items: center; gap: var(--sp-6); }
.brand { display: flex; align-items: center; gap: var(--sp-3); color: var(--text); text-decoration: none; }
.brand:hover { text-decoration: none; }
.links { display: flex; gap: var(--sp-1); margin-left: var(--sp-4); }
.links__a { padding: 8px 12px; border-radius: var(--r-sm); font-size: var(--text-sm); font-weight: 500; color: var(--text-2); transition: all var(--dur-fast); }
.links__a:hover { color: var(--text); background: var(--surface-3); text-decoration: none; }
.actions { margin-left: auto; display: flex; gap: var(--sp-2); }

/* over the dark hero */
.nav--dark.nav--scrolled { background: rgba(10, 17, 15, 0.72); border-color: rgba(255, 255, 255, 0.08); }
.nav--dark .brand :deep(.logo) { color: #f4f2ec; }
.nav--dark .links__a { color: rgba(244, 242, 236, 0.72); }
.nav--dark .links__a:hover { color: #fff; background: rgba(255, 255, 255, 0.08); }
.nav--dark :deep(.btn--ghost) { --btn-fg: rgba(244, 242, 236, 0.85); --btn-bg-hover: rgba(255, 255, 255, 0.1); }
.nav--dark :deep(.btn--ghost:hover:not(:disabled)) { color: #fff; }

@media (max-width: 960px) { .nav__inner { padding-left: var(--sp-6); padding-right: var(--sp-6); } }
@media (max-width: 760px) { .links { display: none; } .nav__inner { padding: var(--sp-3) var(--sp-4); } }
</style>
