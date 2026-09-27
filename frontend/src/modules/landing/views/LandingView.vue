<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppIcon from '@/ui/AppIcon.vue'
import AppLogo from '@/ui/AppLogo.vue'
import LandingNav from '../components/LandingNav.vue'
import Preloader from '../components/Preloader.vue'
import HeroScene from '../components/HeroScene.vue'
import AccessOrbit from '../components/AccessOrbit.vue'
import ActivityTicker from '../components/ActivityTicker.vue'
import DayTimeline from '../components/DayTimeline.vue'
import TryRegister from '../components/TryRegister.vue'
import BeforeAfter from '../components/BeforeAfter.vue'
import FeatureShowcase from '../components/FeatureShowcase.vue'
import SectionHeading from '../components/SectionHeading.vue'
import FaqList from '../components/FaqList.vue'
import { useAuthStore } from '@/core/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const HEADLINE: string[][] = [['Run', 'the', 'campus.'], ['Not', 'the', 'paperwork.']]
const ROLE_CHIPS = ['Admin', 'Teacher', 'Student']

const FAQ = [
  { q: 'What does it cost?', a: 'Nothing. Create an account and start adding teachers and students right away. There is no card, no trial period and no setup call.' },
  { q: 'How do teachers get access?', a: 'They sign up with the Teacher option. Their account stays pending — they can’t see a single student — until an administrator approves it from the dashboard.' },
  { q: 'Can a teacher see every student?', a: 'No. Each teacher sees only the students an administrator has assigned to them. They can record grades, attendance and remarks for those students, but cannot change personal details.' },
  { q: 'What does a student see?', a: 'Their own dashboard: roll number, course, teacher, subject-wise marks, attendance percentage, today’s timetable, pending assignments and any notices. They can update their contact details and password.' },
  { q: 'Is the data safe?', a: 'Passwords are never stored in readable form, sign-in attempts are rate-limited, every request is checked against the user’s role, and signing out (or changing a password) ends the session on every device.' },
  { q: 'Does it work on a phone?', a: 'Yes. Every page is built for phones and tablets as well as desktops, and it follows your device’s light or dark setting.' },
]

const CHECKLIST = [
  { t: 'Create the admin account', s: 'No card, no setup call', m: '1 min' },
  { t: 'Add or approve teachers', s: 'Pending until you say yes', m: '5 min' },
  { t: 'Add students, assign teachers', s: 'One at a time or in bulk', m: '20 min' },
  { t: 'Mark the first register', s: 'From a phone, in class', m: '30 sec' },
]

const primaryCta = () => router.push(auth.isAuthenticated ? '/dashboard' : { name: 'signup' })
</script>

<template>
  <div class="landing">
    <Preloader />
    <LandingNav />

    <!-- ================= HERO ================= -->
    <section class="hero">
      <div class="hero__bg" aria-hidden="true">
        <span class="hero__ell hero__ell--a" /><span class="hero__ell hero__ell--b" /><span class="hero__ell hero__ell--c" />
        <span class="hero__grain" />
      </div>
      <HeroScene />

      <div class="hero__top container">
        <p class="hero__eyebrow blur-in" style="--i: 0"><span class="hero__pulse" /> Free for schools, colleges &amp; coaching institutes</p>
      </div>

      <div class="hero__bottom container">
        <div class="hero__copy">
          <h1 class="hero__title" aria-label="Run the campus. Not the paperwork.">
            <span v-for="(line, li) in HEADLINE" :key="li" class="line" :class="{ 'line--dim': li === 1 }">
              <span v-for="(w, wi) in line" :key="w" class="word" :style="{ '--i': li * 3 + wi + 1 }"><span>{{ w }}</span></span>
            </span>
          </h1>
          <p class="hero__sub blur-in" style="--i: 8">
            Admissions, attendance, grades, timetable and homework in one place — with a separate, honest view for administrators, teachers and students.
          </p>
          <div class="hero__cta blur-in" style="--i: 9">
            <button type="button" class="hero__btn" @click="primaryCta"><span>{{ auth.isAuthenticated ? 'Open dashboard' : 'Create free account' }}</span><i><AppIcon name="arrow-right" :size="16" /></i></button>
            <a class="hero__try" href="#try">Try marking a register</a>
          </div>
        </div>

        <div class="hero__aside blur-in" style="--i: 10">
          <p class="hero__aside-text">Whether it is a 40-student tuition or a 2,000-student college, <span>everyone signs in at the same door</span> and sees only what is theirs.</p>
          <ul class="hero__chips">
            <li v-for="c in ROLE_CHIPS" :key="c">{{ c }}</li>
            <li class="hero__chip-plus">+</li>
          </ul>
        </div>
      </div>

      <a href="#roles" class="hero__scroll blur-in" style="--i: 11" aria-label="Scroll"><span /><em>Scroll</em></a>
    </section>

    <ActivityTicker />

    <!-- ================= THREE VIEWS ================= -->
    <section id="roles" class="section">
      <div class="container">
        <SectionHeading eyebrow="Who sees what" title="One login. Three circles of trust." description="Pick a role. The ring shows exactly which data lights up for them — full access, their own records only, or nothing at all.">
          <template #title>One login. <em>Three circles of trust.</em></template>
        </SectionHeading>
        <div v-reveal><AccessOrbit /></div>
      </div>
    </section>

    <!-- ================= A DAY ================= -->
    <section id="day" class="section section--alt">
      <div class="container">
        <SectionHeading eyebrow="A day on campus" title="Five moments. Three people. One record.">
          <template #title>Five moments. Three people. <em>One record.</em></template>
        </SectionHeading>
        <DayTimeline />
      </div>
    </section>

    <!-- ================= TRY ================= -->
    <section id="try" class="section">
      <div class="container">
        <SectionHeading eyebrow="Try it here" title="Mark a register. Watch the number move." description="This is the same control teachers use in the classroom. Tap a status for each student and save — nothing is stored, it just shows you how it feels.">
          <template #title>Mark a register. <em>Watch the number move.</em></template>
        </SectionHeading>
        <div v-reveal><TryRegister /></div>
      </div>
    </section>

    <!-- ================= BEFORE / AFTER ================= -->
    <section id="compare" class="section section--alt">
      <div class="container">
        <SectionHeading eyebrow="What changes" title="The same campus, without the chaos.">
          <template #title>The same campus, <em>without the chaos.</em></template>
        </SectionHeading>
        <div v-reveal><BeforeAfter /></div>
      </div>
    </section>

    <!-- ================= FEATURES (showcase) ================= -->
    <section id="features" class="section">
      <div class="container">
        <SectionHeading eyebrow="What you get" title="Everything a campus needs. Nothing it doesn’t." description="Pick one — or let it walk itself through. Every part below is included, no add-ons to buy.">
          <template #title>Everything a campus needs. <em>Nothing it doesn’t.</em></template>
        </SectionHeading>
        <div v-reveal><FeatureShowcase /></div>
      </div>
    </section>

    <!-- ================= FAQ ================= -->
    <section id="faq" class="section section--alt">
      <div class="container faq-grid">
        <SectionHeading eyebrow="Common questions" title="Before you sign up." align="left">
          <template #title>Before you <em>sign up.</em></template>
        </SectionHeading>
        <div v-reveal><FaqList :items="FAQ" /></div>
      </div>
    </section>

    <!-- ================= CTA ================= -->
    <section class="cta">
      <div class="cta__glow cta__glow--a" /><div class="cta__glow cta__glow--b" />
      <div class="container cta__grid">
        <div v-reveal class="cta__copy">
          <p class="cta__eyebrow"><span class="hero__pulse" /> Ready when you are</p>
          <h2 class="cta__title">Give your campus one <em>calm</em> place to live.</h2>
          <p class="cta__sub">Free to use. Your admin account takes under a minute — or sign in with a demo account first and look around.</p>
          <div class="cta__actions">
            <button type="button" class="cta__btn" @click="primaryCta"><span>{{ auth.isAuthenticated ? 'Open dashboard' : 'Create free account' }}</span><i><AppIcon name="arrow-right" :size="16" /></i></button>
            <a v-if="!auth.isAuthenticated" class="cta__link" href="/login" @click.prevent="router.push({ name: 'login' })">I already have an account</a>
          </div>
          <ul class="cta__stats">
            <li><b>3</b><span>roles, one door</span></li>
            <li><b>75%</b><span>attendance line, watched</span></li>
            <li><b>0</b><span>spreadsheets</span></li>
          </ul>
        </div>

        <div v-reveal="120" class="cta__card">
          <p class="cta__card-title">Your first day</p>
          <ol class="checklist">
            <li v-for="(c, i) in CHECKLIST" :key="c.t" class="check" :style="{ '--i': i }">
              <span class="check__box"><AppIcon name="check" :size="13" /></span>
              <span class="check__text"><b>{{ c.t }}</b><small>{{ c.s }}</small></span>
              <span class="check__time mono">{{ c.m }}</span>
            </li>
          </ol>
          <p class="cta__card-foot"><AppIcon name="sparkle" :size="14" /> Most campuses are running before lunch.</p>
        </div>
      </div>
    </section>

    <!-- ================= FOOTER ================= -->
    <footer class="footer">
      <div class="container">
        <div class="footer__grid">
          <div class="footer__brand">
            <AppLogo :size="32" />
            <p class="footer__tag">A calm student management system for schools, colleges and coaching institutes. One login, three honest views.</p>
            <p class="footer__stack"><span>Vue</span><span>Express</span><span>MongoDB</span></p>
          </div>
          <nav class="footer__col" aria-label="Product">
            <p class="footer__head">Product</p>
            <a href="#roles">Who sees what</a><a href="#day">A day on campus</a><a href="#try">Try marking a register</a><a href="#features">Features</a>
          </nav>
          <nav class="footer__col" aria-label="Account">
            <p class="footer__head">Account</p>
            <RouterLink :to="{ name: 'login' }">Sign in</RouterLink>
            <RouterLink :to="{ name: 'signup' }">Create account</RouterLink>
            <RouterLink :to="{ name: 'forgot-password' }">Forgot password</RouterLink>
            <a href="#faq">Common questions</a>
          </nav>
          <div class="footer__col">
            <p class="footer__head">Roles</p>
            <span class="footer__role footer__role--accent"><AppIcon name="shield" :size="14" /> Administrator</span>
            <span class="footer__role footer__role--info"><AppIcon name="book" :size="14" /> Teacher</span>
            <span class="footer__role footer__role--primary"><AppIcon name="hat" :size="14" /> Student</span>
          </div>
        </div>
        <p class="footer__word" aria-hidden="true">Vidyara</p>
        <div class="footer__bar">
          <p>© {{ new Date().getFullYear() }} Vidyara · Student Management System</p>
          <p class="text-3">Built for campuses that run on trust, not spreadsheets.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.landing { overflow-x: clip; }
.container { max-width: 1180px; margin: 0 auto; padding: 0 var(--sp-6); }
.section { padding: var(--sp-16) 0; }
.section--alt { background: var(--surface); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
em { font-style: italic; font-weight: 500; color: var(--accent-text); }

/* ---------- hero (follows the site theme: light by default, cinematic dark in dark mode) ---------- */
.hero {
  --h-bg: var(--paper-100); --h-fg: var(--ink-900); --h-fg2: var(--ink-600); --h-fg3: var(--ink-400);
  --h-line: rgba(20, 24, 31, 0.14); --h-glass: rgba(255, 255, 255, 0.55);
  --h-ell-a: rgba(101, 130, 90, 0.35); --h-ell-b: rgba(232, 163, 61, 0.28); --h-ell-c: rgba(140, 164, 126, 0.25);
  --h-btn-bg: var(--ink-900); --h-btn-fg: #f4f2ec; --h-grain: 0.18;
  position: relative; min-height: 100svh; margin-top: calc(-1 * var(--topnav, 72px)); padding-top: var(--topnav, 72px);
  display: flex; flex-direction: column; justify-content: space-between;
  background: var(--h-bg); color: var(--h-fg); overflow: hidden; isolation: isolate;
  transition: background var(--dur) var(--ease), color var(--dur) var(--ease);
}
:root[data-theme='dark'] .hero {
  --h-bg: #0b1412; --h-fg: #f4f2ec; --h-fg2: rgba(244, 242, 236, 0.66); --h-fg3: rgba(244, 242, 236, 0.42);
  --h-line: rgba(244, 242, 236, 0.14); --h-glass: rgba(255, 255, 255, 0.04);
  --h-ell-a: rgba(101, 130, 90, 0.55); --h-ell-b: rgba(232, 163, 61, 0.28); --h-ell-c: rgba(159, 211, 184, 0.16);
  --h-btn-bg: #f4f2ec; --h-btn-fg: #0b1412; --h-grain: 0.35;
}
.hero__bg { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.hero__ell { position: absolute; border-radius: 50%; filter: blur(90px); animation: breathe 14s var(--ease) infinite alternate; }
.hero__ell--a { width: 720px; height: 720px; right: -12%; top: -30%; background: radial-gradient(circle, var(--h-ell-a), transparent 65%); }
.hero__ell--b { width: 560px; height: 560px; left: -16%; bottom: -30%; background: radial-gradient(circle, var(--h-ell-b), transparent 65%); animation-delay: -6s; }
.hero__ell--c { width: 420px; height: 420px; left: 38%; top: 30%; background: radial-gradient(circle, var(--h-ell-c), transparent 65%); animation-delay: -10s; }
@keyframes breathe { to { transform: translate(40px, 30px) scale(1.12); } }
.hero__grain { position: absolute; inset: 0; opacity: var(--h-grain); mix-blend-mode: overlay; background-image: radial-gradient(rgba(255, 255, 255, 0.35) 0.6px, transparent 0.6px); background-size: 3px 3px; }
.hero :deep(.scene) { z-index: 1; }

.hero__top { position: relative; z-index: 2; padding-top: var(--sp-6); }
.hero__eyebrow { display: inline-flex; align-items: center; gap: 10px; padding: 7px 14px 7px 10px; border-radius: var(--r-full); border: 1px solid var(--h-line); background: var(--h-glass); backdrop-filter: blur(8px); font-size: var(--text-xs); font-weight: 600; letter-spacing: 0.04em; color: var(--h-fg2); }
.hero__pulse { width: 8px; height: 8px; border-radius: 50%; background: var(--saffron-500); box-shadow: 0 0 0 0 var(--saffron-500); animation: pulse 2.2s var(--ease) infinite; }
@keyframes pulse { 70% { box-shadow: 0 0 0 9px transparent; } 100% { box-shadow: 0 0 0 0 transparent; } }

.hero__bottom { position: relative; z-index: 2; display: grid; grid-template-columns: 1.7fr 1fr; gap: var(--sp-10); align-items: end; padding-top: var(--sp-16); padding-bottom: var(--sp-16); }
.hero .container { width: 100%; max-width: 1560px; padding-left: var(--sp-10); padding-right: var(--sp-10); }
.hero__title { font-size: clamp(2.5rem, 4.6vw, 4.25rem); line-height: 0.98; letter-spacing: -0.035em; font-weight: 600; color: var(--h-fg); }
.line { display: flex; flex-wrap: wrap; gap: 0 0.24em; }
.line--dim { color: var(--h-fg3); }
.word { display: inline-block; overflow: hidden; padding-bottom: 0.12em; margin-bottom: -0.12em; }
.word > span { display: inline-block; transform: translateY(110%); filter: blur(6px); animation: rise 1s var(--ease-out) forwards; animation-delay: calc(var(--i) * 80ms + 300ms); }
@keyframes rise { to { transform: none; filter: blur(0); } }
.hero__sub { margin-top: var(--sp-6); font-size: var(--text-lg); line-height: 1.6; color: var(--h-fg2); max-width: 46ch; }
.hero__cta { display: flex; align-items: center; gap: var(--sp-6); flex-wrap: wrap; margin-top: var(--sp-8); }
.hero__btn { display: inline-flex; align-items: center; gap: 12px; padding: 6px 6px 6px 22px; border-radius: var(--r-full); background: var(--h-btn-bg); color: var(--h-btn-fg); font-weight: 700; font-size: var(--text-sm); letter-spacing: 0.02em; transition: transform var(--dur) var(--ease), box-shadow var(--dur); box-shadow: 0 10px 40px -12px rgba(232, 163, 61, 0.5); }
.hero__btn i { width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; background: var(--saffron-500); color: var(--ink-900); transition: transform var(--dur-slow) var(--ease-spring); }
.hero__btn:hover { transform: translateY(-2px); box-shadow: 0 16px 50px -12px rgba(232, 163, 61, 0.7); }
.hero__btn:hover i { transform: rotate(-45deg); }
.hero__try { color: var(--h-fg2); font-weight: 600; font-size: var(--text-sm); border-bottom: 1px solid var(--h-line); padding-bottom: 3px; transition: color var(--dur), border-color var(--dur); }
.hero__try:hover { color: var(--h-fg); border-color: var(--saffron-500); text-decoration: none; }

.hero__aside { justify-self: end; max-width: 340px; }
.hero__aside-text { font-size: var(--text-md); line-height: 1.6; color: var(--h-fg3); }
.hero__aside-text span { color: var(--h-fg); }
.hero__chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: var(--sp-5); }
.hero__chips li { padding: 7px 14px; border-radius: var(--r-full); border: 1px solid var(--h-line); font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--h-fg2); transition: all var(--dur); }
.hero__chips li:hover { border-color: var(--saffron-500); color: var(--h-fg); }
.hero__chip-plus { width: 34px; text-align: center; padding-left: 0 !important; padding-right: 0 !important; }

.hero__scroll { position: absolute; z-index: 2; left: 50%; bottom: 22px; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--h-fg3); font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; }
.hero__scroll:hover { text-decoration: none; color: var(--h-fg); }
.hero__scroll span { width: 1px; height: 44px; background: linear-gradient(var(--h-fg3), transparent); position: relative; overflow: hidden; }
.hero__scroll span::after { content: ''; position: absolute; left: 0; top: -100%; width: 100%; height: 100%; background: var(--saffron-500); animation: drop 1.8s var(--ease) infinite; }
@keyframes drop { to { top: 100%; } }
.hero__scroll em { font-style: normal; }

/* blur-in entrance used across the hero */
.blur-in { opacity: 0; filter: blur(10px); transform: translateY(14px); animation: blur-in 1.1s var(--ease-out) forwards; animation-delay: calc(var(--i, 0) * 80ms + 300ms); }
@keyframes blur-in { to { opacity: 1; filter: blur(0); transform: none; } }

/* ---------- features ---------- */

/* ---------- faq ---------- */
.faq-grid { display: grid; grid-template-columns: 1fr 1.6fr; gap: var(--sp-12); align-items: start; }
.faq-grid :deep(.sh) { margin-bottom: 0; position: sticky; top: 100px; }

/* ---------- cta (dark band in both themes, warm glow) ---------- */
.cta { position: relative; overflow: hidden; isolation: isolate; padding: var(--sp-16) 0; background: #14211d; color: #f4f2ec; }
:root[data-theme='dark'] .cta { background: #0f1917; }
.cta__glow { position: absolute; z-index: -1; border-radius: 50%; filter: blur(90px); pointer-events: none; animation: breathe 14s var(--ease) infinite alternate; }
.cta__glow--a { width: 620px; height: 620px; right: -10%; top: -40%; background: radial-gradient(circle, rgba(232, 163, 61, 0.35), transparent 65%); }
.cta__glow--b { width: 520px; height: 520px; left: -12%; bottom: -45%; background: radial-gradient(circle, rgba(140, 164, 126, 0.45), transparent 65%); animation-delay: -6s; }
.cta__grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: var(--sp-12); align-items: center; }
.cta__eyebrow { display: inline-flex; align-items: center; gap: 10px; font-size: var(--text-xs); font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(244, 242, 236, 0.6); margin-bottom: var(--sp-4); }
.cta__title { font-size: clamp(2.2rem, 4.6vw, 3.6rem); letter-spacing: -0.025em; line-height: 1.02; color: #fff; }
.cta__title em { color: var(--saffron-500); }
.cta__sub { margin: var(--sp-5) 0 var(--sp-8); font-size: var(--text-lg); color: rgba(244, 242, 236, 0.66); max-width: 46ch; line-height: 1.6; }
.cta__actions { display: flex; align-items: center; gap: var(--sp-6); flex-wrap: wrap; }
.cta__btn { display: inline-flex; align-items: center; gap: 12px; padding: 6px 6px 6px 22px; border-radius: var(--r-full); background: #f4f2ec; color: #14211d; font-weight: 700; font-size: var(--text-sm); box-shadow: 0 12px 40px -12px rgba(232, 163, 61, 0.6); transition: transform var(--dur), box-shadow var(--dur); }
.cta__btn i { width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; background: var(--saffron-500); color: var(--ink-900); transition: transform var(--dur-slow) var(--ease-spring); }
.cta__btn:hover { transform: translateY(-2px); box-shadow: 0 18px 50px -12px rgba(232, 163, 61, 0.8); }
.cta__btn:hover i { transform: rotate(-45deg); }
.cta__link { color: rgba(244, 242, 236, 0.8); font-size: var(--text-sm); font-weight: 600; border-bottom: 1px solid rgba(244, 242, 236, 0.25); padding-bottom: 2px; }
.cta__link:hover { color: #fff; text-decoration: none; border-color: var(--saffron-500); }
.cta__stats { display: flex; gap: var(--sp-8); margin-top: var(--sp-10); padding-top: var(--sp-6); border-top: 1px solid rgba(244, 242, 236, 0.12); flex-wrap: wrap; }
.cta__stats li { display: flex; flex-direction: column; gap: 4px; font-size: var(--text-xs); color: rgba(244, 242, 236, 0.55); }
.cta__stats b { font-family: var(--font-display); font-size: var(--text-2xl); color: #fff; line-height: 1; }

.cta__card { position: relative; padding: var(--sp-6); border-radius: var(--r-xl); background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(12px); box-shadow: 0 30px 80px -30px rgba(0, 0, 0, 0.6); }
.cta__card-title { font-family: var(--font-display); font-size: var(--text-xl); font-weight: 600; margin-bottom: var(--sp-4); color: #fff; }
.checklist { display: flex; flex-direction: column; gap: 6px; }
.check { display: flex; align-items: center; gap: var(--sp-3); padding: 12px 14px; border-radius: var(--r-md); background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.06); }
.check__box { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; flex-shrink: 0; background: transparent; border: 1.5px solid rgba(244, 242, 236, 0.35); color: transparent; transition: all var(--dur-slow) var(--ease-spring); transition-delay: calc(var(--i) * 260ms + 400ms); }
.reveal-on-scroll.is-visible .check__box { background: var(--saffron-500); border-color: var(--saffron-500); color: var(--ink-900); transform: scale(1.05); }
.check__text { flex: 1; display: flex; flex-direction: column; line-height: 1.25; min-width: 0; }
.check__text b { font-size: var(--text-sm); font-weight: 600; color: #fff; }
.check__text small { font-size: 11px; color: rgba(244, 242, 236, 0.5); }
.check__time { font-size: 11px; color: rgba(244, 242, 236, 0.55); white-space: nowrap; }
.cta__card-foot { display: flex; align-items: center; gap: 8px; margin-top: var(--sp-4); font-size: var(--text-xs); color: rgba(244, 242, 236, 0.6); }
.cta__card-foot :deep(svg) { color: var(--saffron-500); }

/* ---------- footer ---------- */
.footer { position: relative; overflow: hidden; padding: var(--sp-16) 0 var(--sp-6); background: var(--surface); border-top: 1px solid var(--line); }
.footer__grid { display: grid; grid-template-columns: 1.6fr 1fr 1fr 1fr; gap: var(--sp-10); position: relative; z-index: 1; }
.footer__brand { display: flex; flex-direction: column; gap: var(--sp-4); align-items: flex-start; }
.footer__tag { font-size: var(--text-sm); color: var(--text-2); line-height: 1.6; max-width: 34ch; }
.footer__stack { display: flex; gap: 6px; }
.footer__stack span { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 4px 9px; border-radius: var(--r-full); border: 1px solid var(--line-strong); color: var(--text-3); }
.footer__col { display: flex; flex-direction: column; gap: 10px; font-size: var(--text-sm); }
.footer__col a { color: var(--text-2); width: fit-content; transition: color var(--dur-fast), transform var(--dur-fast); }
.footer__col a:hover { color: var(--primary-text); text-decoration: none; transform: translateX(3px); }
.footer__head { font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--text-3); margin-bottom: 4px; }
.footer__role { display: inline-flex; align-items: center; gap: 8px; width: fit-content; padding: 6px 12px; border-radius: var(--r-full); font-size: var(--text-xs); font-weight: 600; }
.footer__role--accent { background: var(--accent-soft); color: var(--accent-text); }
.footer__role--info { background: var(--info-soft); color: var(--info-text); }
.footer__role--primary { background: var(--primary-soft); color: var(--primary-text); }
.footer__word { position: relative; margin: var(--sp-10) 0 0; font-family: var(--font-display); font-weight: 700; font-size: clamp(5rem, 17vw, 15rem); line-height: 0.8; letter-spacing: -0.04em; text-align: center; color: transparent; -webkit-text-stroke: 1px var(--line-strong); user-select: none; pointer-events: none; opacity: 0.9; mask-image: linear-gradient(#000 20%, transparent 100%); }
.footer__bar { display: flex; justify-content: space-between; gap: var(--sp-4); flex-wrap: wrap; padding-top: var(--sp-5); border-top: 1px solid var(--line); font-size: var(--text-xs); color: var(--text-2); margin-top: var(--sp-2); position: relative; z-index: 1; }

@media (max-width: 960px) {
  .hero__bottom { grid-template-columns: 1fr; gap: var(--sp-8); padding-top: 46vh; padding-bottom: 3.5rem; }
  .hero .container { padding-left: var(--sp-6); padding-right: var(--sp-6); }
  .hero__aside { justify-self: start; max-width: none; }
  .hero__scroll { display: none; }
  .faq-grid { grid-template-columns: 1fr; gap: var(--sp-6); }
  .faq-grid :deep(.sh) { position: static; }
  .cta__grid { grid-template-columns: 1fr; gap: var(--sp-8); }
  .footer__grid { grid-template-columns: 1fr 1fr; gap: var(--sp-8); }
  .footer__brand { grid-column: 1 / -1; }
}
@media (max-width: 640px) {
  .container { padding: 0 var(--sp-4); }
  .section { padding: var(--sp-12) 0; }
  .hero .container { padding-left: var(--sp-4); padding-right: var(--sp-4); }
  .hero__top { padding-top: var(--sp-4); }
  .hero__bottom { padding-top: 40vh; padding-bottom: var(--sp-12); }
  .cta { padding: var(--sp-12) 0; }
  .cta__stats { gap: var(--sp-6); }
  .footer__grid { grid-template-columns: 1fr; }
  .footer__bar { flex-direction: column; }
}
</style>
