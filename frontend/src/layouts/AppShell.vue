<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '@/ui/AppIcon.vue'
import AppAvatar from '@/ui/AppAvatar.vue'
import AppBadge from '@/ui/AppBadge.vue'
import AppLogo from '@/ui/AppLogo.vue'
import { useAuthStore } from '@/core/stores/auth'
import { useToast } from '@/core/composables/useToast'
import { ROLE_LABEL, ROLE_TONE } from '@/core/utils/constants'
import type { Role } from '@/core/api/types'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const drawer = ref(false)
const menu = ref(false)
const loggingOut = ref(false)
const collapsed = ref(false)
try { collapsed.value = localStorage.getItem('vidyara.sidebar') === 'collapsed' } catch { /* ignore */ }
watch(collapsed, (v) => { try { localStorage.setItem('vidyara.sidebar', v ? 'collapsed' : 'open') } catch { /* ignore */ } })

interface NavItem { to: string; label: string; icon: string; roles: Role[] }
interface NavGroup { label: string; items: NavItem[] }
const GROUPS: NavGroup[] = [
  { label: 'Overview', items: [{ to: '/dashboard', label: 'Dashboard', icon: 'dashboard', roles: ['admin', 'teacher', 'student'] }] },
  {
    label: 'People',
    items: [
      { to: '/students', label: 'Students', icon: 'students', roles: ['admin'] },
      { to: '/students', label: 'My students', icon: 'students', roles: ['teacher'] },
      { to: '/users', label: 'Users', icon: 'users', roles: ['admin'] },
    ],
  },
  {
    label: 'Academics',
    items: [
      { to: '/academics', label: 'My academics', icon: 'book', roles: ['student'] },
      { to: '/attendance', label: 'Attendance', icon: 'calendar', roles: ['admin', 'teacher', 'student'] },
      { to: '/assignments', label: 'Assignments', icon: 'edit', roles: ['admin', 'teacher', 'student'] },
      { to: '/timetable', label: 'Timetable', icon: 'clock', roles: ['admin', 'teacher', 'student'] },
      { to: '/announcements', label: 'Announcements', icon: 'inbox', roles: ['admin', 'teacher', 'student'] },
    ],
  },
]
const groups = computed(() =>
  GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => auth.role && i.roles.includes(auth.role)) })).filter((g) => g.items.length)
)
const isActive = (to: string) => route.path === to || route.path.startsWith(to + '/')

watch(() => route.fullPath, () => { drawer.value = false; menu.value = false })
const onDocClick = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest('.me')) menu.value = false }
onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))

const logout = async () => {
  loggingOut.value = true
  await auth.logout()
  toast.info('Signed out', 'See you next time.')
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="shell" :class="{ 'shell--collapsed': collapsed }">
    <aside class="sidebar" :class="{ 'sidebar--open': drawer }">
      <div class="sidebar__top">
        <RouterLink to="/dashboard" class="brand"><AppLogo light :hide-name="collapsed" /></RouterLink>
        <button type="button" class="collapse" :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'" :title="collapsed ? 'Expand' : 'Collapse'" @click="collapsed = !collapsed">
          <AppIcon :name="collapsed ? 'chevron-right' : 'chevron-left'" :size="16" />
        </button>
      </div>

      <nav class="nav">
        <div v-for="g in groups" :key="g.label" class="nav__group">
          <p class="nav__label">{{ g.label }}</p>
          <RouterLink v-for="item in g.items" :key="item.label" :to="item.to" class="nav__link" :class="{ 'nav__link--active': isActive(item.to) }" :title="collapsed ? item.label : undefined">
            <AppIcon :name="item.icon" :size="18" />
            <span class="nav__text">{{ item.label }}</span>
          </RouterLink>
        </div>
      </nav>

      <div v-if="auth.user" class="me">
        <button type="button" class="me__btn" :aria-expanded="menu" @click="menu = !menu">
          <AppAvatar :name="auth.user.name" :size="36" />
          <span class="me__text">
            <span class="me__name truncate">{{ auth.user.name }}</span>
            <AppBadge :tone="ROLE_TONE[auth.user.role]">{{ ROLE_LABEL[auth.user.role] }}</AppBadge>
          </span>
          <AppIcon name="chevron-down" :size="16" class="me__chev" />
        </button>
        <Transition name="menu">
          <div v-if="menu" class="menu" role="menu">
            <p class="menu__email truncate">{{ auth.user.email }}</p>
            <RouterLink to="/settings" class="menu__item" role="menuitem"><AppIcon name="settings" :size="16" /> Settings</RouterLink>
            <RouterLink to="/" class="menu__item" role="menuitem"><AppIcon name="hat" :size="16" /> Home page</RouterLink>
            <button type="button" class="menu__item menu__item--danger" role="menuitem" :disabled="loggingOut" @click="logout"><AppIcon name="logout" :size="16" /> Sign out</button>
          </div>
        </Transition>
      </div>
    </aside>
    <div v-if="drawer" class="scrim" @click="drawer = false" />

    <div class="main">
      <header class="topbar">
        <button type="button" class="topbar__menu" aria-label="Open menu" @click="drawer = true"><AppIcon name="menu" :size="22" /></button>
        <p class="topbar__crumb">{{ route.meta.title }}</p>
        <RouterLink to="/settings" class="topbar__me" aria-label="Account settings"><AppAvatar v-if="auth.user" :name="auth.user.name" :size="32" /></RouterLink>
      </header>
      <main class="content">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in"><component :is="Component" :key="route.path" /></Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<style scoped>
.shell { --sw: var(--sidebar-w); min-height: 100dvh; display: flex; }
.shell--collapsed { --sw: 76px; }
.sidebar {
  width: var(--sw); flex-shrink: 0; position: sticky; top: 0; height: 100dvh;
  display: flex; flex-direction: column; padding: var(--sp-4) var(--sp-3);
  background: var(--sidebar-bg); color: var(--sidebar-text);
  transition: width var(--dur) var(--ease), transform var(--dur-slow) var(--ease-out); z-index: 60;
}
.sidebar__top { display: flex; align-items: center; justify-content: space-between; padding: 0 var(--sp-2); }
.brand { color: var(--sidebar-text-strong); text-decoration: none; }
.collapse { width: 26px; height: 26px; display: grid; place-items: center; border-radius: 8px; color: var(--sidebar-text); transition: all var(--dur-fast); }
.collapse:hover { background: var(--sidebar-active); color: #fff; }
.shell--collapsed .sidebar__top { flex-direction: column; gap: var(--sp-2); }

.nav { display: flex; flex-direction: column; gap: var(--sp-5); margin-top: var(--sp-6); overflow-y: auto; }
.nav__group { display: flex; flex-direction: column; gap: 2px; }
.nav__label { font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--sidebar-text); opacity: 0.75; padding: 0 var(--sp-3); margin-bottom: 6px; white-space: nowrap; overflow: hidden; }
.shell--collapsed .nav__label { height: 1px; margin: 4px var(--sp-2); background: var(--sidebar-line); font-size: 0; }
.nav__link {
  display: flex; align-items: center; gap: var(--sp-3); padding: 9px var(--sp-3); border-radius: var(--r-md);
  color: var(--sidebar-text); font-weight: 500; font-size: var(--text-sm); text-decoration: none; position: relative; white-space: nowrap;
  transition: background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
}
.nav__link:hover { color: #fff; background: var(--sidebar-active); text-decoration: none; }
.nav__link--active { color: #fff; background: var(--sidebar-active); }
.nav__link--active::before { content: ''; position: absolute; left: calc(-1 * var(--sp-3)); top: 50%; transform: translateY(-50%); width: 3px; height: 20px; border-radius: 0 3px 3px 0; background: var(--accent); }
.shell--collapsed .nav__link { justify-content: center; padding: 10px; }
.shell--collapsed .nav__text { display: none; }

.me { position: relative; margin-top: auto; padding-top: var(--sp-3); border-top: 1px solid var(--sidebar-line); }
.me__btn { width: 100%; display: flex; align-items: center; gap: var(--sp-3); padding: var(--sp-2); border-radius: var(--r-md); color: inherit; text-align: left; transition: background var(--dur-fast); }
.me__btn:hover, .me__btn[aria-expanded='true'] { background: var(--sidebar-active); }
.me__text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; align-items: flex-start; }
.me__name { color: var(--sidebar-text-strong); font-weight: 600; font-size: var(--text-sm); max-width: 100%; }
.me__chev { color: var(--sidebar-text); }
.shell--collapsed .me__text, .shell--collapsed .me__chev { display: none; }
.shell--collapsed .me__btn { justify-content: center; }
.menu { position: absolute; left: 0; right: 0; bottom: calc(100% + 6px); background: var(--surface); color: var(--text); border: 1px solid var(--line); border-radius: var(--r-md); box-shadow: var(--shadow-lg); padding: 6px; z-index: 5; }
.shell--collapsed .menu { left: 0; right: auto; width: 200px; }
.menu__email { font-size: var(--text-xs); color: var(--text-3); padding: 6px 10px 8px; border-bottom: 1px solid var(--line); margin-bottom: 4px; }
.menu__item { width: 100%; display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: var(--r-sm); font-size: var(--text-sm); font-weight: 500; color: var(--text-2); text-decoration: none; transition: background var(--dur-fast), color var(--dur-fast); }
.menu__item:hover { background: var(--surface-2); color: var(--text); text-decoration: none; }
.menu__item--danger:hover { background: var(--danger-soft); color: var(--danger-text); }
.menu-enter-active, .menu-leave-active { transition: opacity var(--dur-fast), transform var(--dur-fast) var(--ease-out); }
.menu-enter-from, .menu-leave-to { opacity: 0; transform: translateY(6px); }

.main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.topbar { display: none; align-items: center; gap: var(--sp-3); height: var(--topbar-h); padding: 0 var(--sp-4); background: var(--surface); border-bottom: 1px solid var(--line); position: sticky; top: 0; z-index: 40; }
.topbar__menu { color: var(--text); padding: 6px; border-radius: var(--r-sm); }
.topbar__crumb { flex: 1; font-family: var(--font-display); font-weight: 600; font-size: var(--text-lg); }
.content { flex: 1; width: 100%; max-width: var(--content-max); margin: 0 auto; padding: var(--sp-8) var(--sp-8) var(--sp-16); }
.scrim { display: none; }

@media (max-width: 960px) {
  .shell { --sw: var(--sidebar-w); }
  .sidebar { position: fixed; left: 0; top: 0; transform: translateX(-100%); box-shadow: var(--shadow-lg); }
  .sidebar--open { transform: translateX(0); }
  .collapse { display: none; }
  .shell--collapsed .nav__text, .shell--collapsed .me__text, .shell--collapsed .me__chev { display: initial; }
  .shell--collapsed .me__text { display: flex; }
  .shell--collapsed .nav__link { justify-content: flex-start; padding: 9px var(--sp-3); }
  .shell--collapsed .nav__label { height: auto; margin: 0 0 6px; background: none; font-size: 10px; }
  .shell--collapsed .sidebar__top { flex-direction: row; }
  .scrim { display: block; position: fixed; inset: 0; background: rgba(12, 16, 22, 0.5); z-index: 50; animation: fade-in var(--dur); }
  .topbar { display: flex; }
  .content { padding: var(--sp-5) var(--sp-4) var(--sp-12); }
}
</style>
