<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppIcon from '@/ui/AppIcon.vue'
import AppButton from '@/ui/AppButton.vue'
import AppLogo from '@/ui/AppLogo.vue'
import LandingNav from '../components/LandingNav.vue'
import HeroPreview from '../components/HeroPreview.vue'
import SectionHeading from '../components/SectionHeading.vue'
import RotatingWord from '../components/RotatingWord.vue'
import Marquee from '../components/Marquee.vue'
import FactCounter from '../components/FactCounter.vue'
import RoleShowcase from '../components/RoleShowcase.vue'
import BentoTile from '../components/BentoTile.vue'
import FaqList from '../components/FaqList.vue'
import { useAuthStore } from '@/core/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const TICKER = [
  { icon: 'students', text: 'Student records in one place' },
  { icon: 'trending', text: 'Grades, subject by subject' },
  { icon: 'calendar', text: 'Attendance with automatic alerts' },
  { icon: 'user-check', text: 'Teachers approved before they get access' },
  { icon: 'book', text: 'Every teacher sees only their students' },
  { icon: 'hat', text: 'Students track their own progress' },
  { icon: 'search', text: 'Find any student in seconds' },
  { icon: 'monitor', text: 'Works on phone, tablet and desktop' },
]

const AUDIENCE = [
  { icon: 'shield', title: 'Schools & colleges', text: 'Keep every student\u2019s record, teacher and progress in one system instead of spreadsheets and WhatsApp groups.' },
  { icon: 'book', title: 'Coaching institutes', text: 'Assign batches to teachers, record test scores and attendance, and let students check their standing any time.' },
  { icon: 'users', title: 'Tuition & small academies', text: 'No IT team needed. Sign up, add your teachers and students, and you\u2019re running in an afternoon.' },
]

const FAQ = [
  { q: 'Is it free to use?', a: 'Yes. Create an account and start adding teachers and students right away. There is no card, no trial period and no setup call.' },
  { q: 'How do teachers get in?', a: 'Teachers sign up themselves with the Teacher option. Their account stays pending until an administrator approves it from the dashboard, so nobody gets access to student data by accident.' },
  { q: 'Can a teacher see every student?', a: 'No. Each teacher sees only the students an administrator has assigned to them. They can record grades, attendance and remarks for those students, but cannot change personal details.' },
  { q: 'What does a student see?', a: 'Their own dashboard: roll number, course, assigned teacher, subject-wise marks, attendance percentage and any remarks from the teacher. They can update their contact details and change their password.' },
  { q: 'Is our data safe?', a: 'Passwords are never stored in readable form, sign-in attempts are limited to stop guessing, every action is checked against the user\u2019s role, and signing out ends the session on every device.' },
  { q: 'Does it work on a phone?', a: 'Yes. Every page is designed for phones and tablets as well as desktops, and it follows your device\u2019s light or dark setting.' },
]

const STEPS = [
  { n: '01', icon: 'hat', title: 'Create your account', text: 'Sign up as the administrator, then add your teachers — or let them sign up and approve them with one click.' },
  { n: '02', icon: 'users', title: 'Add students & assign teachers', text: 'Enter students with their course and year, and assign each one to a teacher. Students get their own login.' },
  { n: '03', icon: 'trending', title: 'Record and track progress', text: 'Teachers enter marks and attendance after each class or test. Students and admins see it immediately.' },
]

const primaryCta = () => router.push(auth.isAuthenticated ? '/dashboard' : { name: 'signup' })
</script>

<template>
  <div class="landing">
    <LandingNav />

    <!-- ============ HERO ============ -->
    <section class="hero">
      <div class="orb orb--1" /><div class="orb orb--2" /><div class="orb orb--3" />
      <div class="container hero__grid">
        <div class="hero__copy">
          <p class="hero__pill reveal"><span class="hero__pulse" /> Free for schools, colleges & coaching institutes</p>
          <h1 class="hero__title reveal" style="--i: 1">
            The whole campus,<br />
            <RotatingWord :words="['beautifully', 'calmly', 'securely', 'finally']" /> organised.
          </h1>
          <p class="hero__sub reveal" style="--i: 2">
            Student records, grades and attendance in one place — with a separate view for administrators, teachers and students, so everyone sees exactly what they need and nothing else.
          </p>
          <div class="hero__cta reveal" style="--i: 3">
            <AppButton size="lg" icon-right="arrow-right" class="hero__btn" @click="primaryCta">{{ auth.isAuthenticated ? 'Open dashboard' : 'Create free account' }}</AppButton>
            <AppButton v-if="!auth.isAuthenticated" size="lg" variant="secondary" @click="router.push({ name: 'login' })">Sign in</AppButton>
          </div>
          <div class="hero__proof reveal" style="--i: 4">
            <span class="hero__avatars"><i>MS</i><i>RV</i><i>SG</i><i>AS</i></span>
            <span>Try it instantly with a demo account — no sign-up needed</span>
          </div>
        </div>
        <div class="hero__art"><HeroPreview /></div>
      </div>
      <a href="#roles" class="hero__scroll" aria-label="Scroll to content"><span /></a>
    </section>

    <Marquee :items="TICKER" />

    <!-- ============ FACTS ============ -->
    <section class="facts">
      <div class="container facts__grid">
        <FactCounter :value="3" label="separate views: admin, teacher, student" />
        <FactCounter :value="75" suffix="%" label="attendance line — anyone below is flagged" :delay="120" />
        <FactCounter :value="1" label="click to approve a new teacher" :delay="240" />
        <FactCounter :value="0" label="spreadsheets needed" :delay="360" />
      </div>
    </section>

    <!-- ============ WHO IT'S FOR ============ -->
    <section class="section section--alt">
      <div class="container">
        <SectionHeading eyebrow="Who it's for" title="Built for the people who run a campus.">
          <template #title>Built for the people who <em>run a campus.</em></template>
        </SectionHeading>
        <div class="audience">
          <article v-for="(a, i) in AUDIENCE" :key="a.title" v-reveal="i * 100" class="aud">
            <span class="aud__icon"><AppIcon :name="a.icon" :size="20" /></span>
            <h3 class="aud__title">{{ a.title }}</h3>
            <p class="aud__text">{{ a.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- ============ ROLES ============ -->
    <section id="roles" class="section">
      <div class="container">
        <SectionHeading eyebrow="Three roles" title="One system. Three points of view." description="Everyone signs in at the same door, then sees a dashboard shaped around what they actually do. Pick a role to see it.">
          <template #title>One system. <em>Three</em> points of view.</template>
        </SectionHeading>
        <div v-reveal><RoleShowcase /></div>
      </div>
    </section>

    <!-- ============ FEATURES (bento) ============ -->
    <section id="features" class="section section--alt">
      <div class="container">
        <SectionHeading eyebrow="What you get" title="Everything a campus needs, nothing it doesn't." description="The day-to-day work of running a school, handled without spreadsheets, paper registers or group chats.">
          <template #title>Everything a campus needs, <em>nothing it doesn't.</em></template>
        </SectionHeading>
        <div class="bento">
          <div v-reveal class="bento__cell bento__cell--wide">
            <BentoTile wide icon="user-check" title="Approve teachers before they get in" text="New teachers can sign up themselves, but they can't see any student until an administrator approves them. One click to approve, one to decline.">
              <div class="demo-approve">
                <div class="demo-approve__card">
                  <span class="demo-approve__av">RV</span>
                  <span class="demo-approve__name">Rajat Verma<small>Teacher · CS</small></span>
                  <span class="demo-approve__badge"><i class="demo-approve__pending">Pending</i><i class="demo-approve__ok"><AppIcon name="check" :size="11" /> Approved</i></span>
                </div>
                <span class="demo-approve__cursor" />
              </div>
            </BentoTile>
          </div>
          <div v-reveal="80" class="bento__cell"><BentoTile icon="lock" title="Sign out everywhere" text="Signed in on a shared computer? Signing out (or changing your password) ends the session on every device at once." /></div>
          <div v-reveal="80" class="bento__cell"><BentoTile icon="trending" title="Marks & attendance per student" text="Teachers enter marks for each subject and classes attended. Averages and percentages are worked out for you and shown to the student." /></div>
          <div v-reveal="160" class="bento__cell bento__cell--wide">
            <BentoTile wide icon="monitor" title="Use it anywhere" text="Enter attendance from a phone in the classroom, review results on a laptop, present on a projector — it fits every screen and follows your light or dark setting.">
              <div class="demo-theme">
                <div class="demo-theme__card"><i /><i /><i /><b /></div>
                <span class="demo-theme__sun"><AppIcon name="sun" :size="14" /></span>
                <span class="demo-theme__moon"><AppIcon name="moon" :size="14" /></span>
              </div>
            </BentoTile>
          </div>
          <div v-reveal="80" class="bento__cell"><BentoTile icon="search" title="Find anyone in seconds" text="Search by name, email or roll number. Filter by course, year, status or teacher — and spot students who haven't been assigned yet." /></div>
          <div v-reveal="160" class="bento__cell"><BentoTile icon="check" title="Mistakes caught as you type" text="Every form tells you exactly what's wrong before you submit — a missing course, a weak password, marks above the maximum." /></div>
          <div v-reveal="240" class="bento__cell"><BentoTile icon="shield" title="Student data stays private" text="Each person sees only what their role allows. Passwords are never stored in readable form, and repeated sign-in attempts are blocked." /></div>
        </div>
      </div>
    </section>

    <!-- ============ HOW IT WORKS ============ -->
    <section id="how" class="section">
      <div class="container">
        <SectionHeading eyebrow="Getting started" title="Running in an afternoon, in three steps.">
          <template #title>Running in an afternoon, <em>in three steps.</em></template>
        </SectionHeading>
        <ol v-reveal class="timeline">
          <li v-for="(s, i) in STEPS" :key="s.n" class="tl" :style="{ '--i': i }">
            <div class="tl__node"><AppIcon :name="s.icon" :size="20" /><span class="tl__n">{{ s.n }}</span></div>
            <div class="tl__card">
              <h4 class="tl__title">{{ s.title }}</h4>
              <p class="tl__text">{{ s.text }}</p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <!-- ============ FAQ ============ -->
    <section class="section section--alt">
      <div class="container faq-grid">
        <SectionHeading eyebrow="Common questions" title="Before you sign up." align="left">
          <template #title>Before you <em>sign up.</em></template>
        </SectionHeading>
        <div v-reveal><FaqList :items="FAQ" /></div>
      </div>
    </section>

    <!-- ============ CTA ============ -->
    <section class="cta">
      <div class="container">
        <div v-reveal class="cta__band">
          <div class="aurora aurora--1" /><div class="aurora aurora--2" /><div class="aurora aurora--3" />
          <h2 class="cta__title">Ready to bring <em>order</em> to your campus?</h2>
          <p class="cta__sub">Free to use. Create your account in under a minute, or try a demo login first.</p>
          <div class="cta__actions">
            <AppButton size="lg" variant="accent" icon-right="arrow-right" @click="primaryCta">{{ auth.isAuthenticated ? 'Open dashboard' : 'Get started' }}</AppButton>
            <a v-if="!auth.isAuthenticated" class="cta__link" href="/login" @click.prevent="router.push({ name: 'login' })">I already have an account</a>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ FOOTER ============ -->
    <footer class="footer">
      <div class="container footer__inner">
        <div class="footer__brand"><AppLogo :size="28" /><span class="footer__dot">·</span><span class="text-3">Student Management System</span></div>
        <nav class="footer__links">
          <RouterLink :to="{ name: 'login' }">Sign in</RouterLink>
          <RouterLink :to="{ name: 'signup' }">Create account</RouterLink>
          <RouterLink :to="{ name: 'forgot-password' }">Forgot password</RouterLink>
        </nav>
        <p class="footer__meta text-3">Vue · Express · MongoDB — {{ new Date().getFullYear() }}</p>
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

/* ---------- hero ---------- */
.hero { position: relative; padding: var(--sp-12) 0 var(--sp-16); overflow: hidden; }
.hero::before { content: ''; position: absolute; inset: 0; background-image: radial-gradient(var(--line-strong) 1px, transparent 1px); background-size: 26px 26px; mask-image: radial-gradient(ellipse at 50% 0%, black 20%, transparent 70%); opacity: 0.6; pointer-events: none; }
.orb { position: absolute; border-radius: 50%; filter: blur(70px); opacity: 0.55; pointer-events: none; animation: drift 18s var(--ease) infinite alternate; }
.orb--1 { width: 520px; height: 520px; right: -140px; top: -160px; background: var(--pine-200); }
.orb--2 { width: 420px; height: 420px; left: -180px; bottom: -140px; background: var(--saffron-200); animation-delay: -6s; }
.orb--3 { width: 260px; height: 260px; left: 40%; top: 60%; background: var(--ocean-100); animation-delay: -12s; opacity: 0.4; }
:root[data-theme='dark'] .orb--1 { background: var(--pine-800); }
:root[data-theme='dark'] .orb--2 { background: #4a3413; }
:root[data-theme='dark'] .orb--3 { background: #1c2c45; }
@keyframes drift { from { transform: translate(0, 0) scale(1); } to { transform: translate(60px, -40px) scale(1.15); } }
.hero__grid { position: relative; display: grid; grid-template-columns: 1.05fr 1fr; gap: var(--sp-12); align-items: center; }
.hero__pill { display: inline-flex; align-items: center; gap: 10px; padding: 6px 14px 6px 10px; border-radius: var(--r-full); background: var(--surface); border: 1px solid var(--line); box-shadow: var(--shadow-xs); font-size: var(--text-xs); font-weight: 600; color: var(--text-2); }
.hero__pulse { width: 8px; height: 8px; border-radius: 50%; background: var(--success); box-shadow: 0 0 0 0 var(--success); animation: pulse 2s var(--ease) infinite; }
@keyframes pulse { 70% { box-shadow: 0 0 0 8px transparent; } 100% { box-shadow: 0 0 0 0 transparent; } }
.hero__title { font-size: clamp(2.5rem, 5.4vw, 4.3rem); line-height: 1.02; letter-spacing: -0.025em; margin: var(--sp-5) 0; font-weight: 600; }
.hero__sub { font-size: var(--text-lg); color: var(--text-2); line-height: 1.65; max-width: 52ch; }
.hero__cta { display: flex; gap: var(--sp-3); flex-wrap: wrap; margin-top: var(--sp-8); }
.hero__btn { position: relative; overflow: hidden; }
.hero__btn::after { content: ''; position: absolute; inset: 0; background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.25) 50%, transparent 70%); transform: translateX(-100%); animation: shine 3.5s var(--ease) infinite; animation-delay: 1.5s; }
@keyframes shine { 30%, 100% { transform: translateX(100%); } }
.hero__proof { display: flex; align-items: center; gap: var(--sp-3); margin-top: var(--sp-6); font-size: var(--text-sm); color: var(--text-3); }
.hero__avatars { display: flex; }
.hero__avatars i { width: 28px; height: 28px; border-radius: 40%; display: grid; place-items: center; font-style: normal; font-size: 10px; font-weight: 700; font-family: var(--font-display); background: var(--primary-soft); color: var(--primary-text); border: 2px solid var(--bg); margin-left: -8px; }
.hero__avatars i:first-child { margin-left: 0; }
.hero__avatars i:nth-child(2) { background: var(--accent-soft); color: var(--accent-text); }
.hero__avatars i:nth-child(3) { background: var(--info-soft); color: var(--info-text); }
.hero__scroll { position: absolute; left: 50%; bottom: 18px; transform: translateX(-50%); width: 22px; height: 36px; border: 2px solid var(--line-strong); border-radius: 12px; display: flex; justify-content: center; padding-top: 6px; }
.hero__scroll span { width: 3px; height: 8px; border-radius: 2px; background: var(--primary); animation: wheel 1.8s var(--ease) infinite; }
@keyframes wheel { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(12px); opacity: 0; } }

/* ---------- facts ---------- */
.facts { background: var(--surface); border-bottom: 1px solid var(--line); }
.facts__grid { display: grid; grid-template-columns: repeat(4, 1fr); }
.facts__grid > * + * { border-left: 1px solid var(--line); }

/* ---------- audience ---------- */
.audience { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--sp-5); }
.aud { padding: var(--sp-6); border-radius: var(--r-xl); background: var(--bg); border: 1px solid var(--line); transition: transform var(--dur) var(--ease), box-shadow var(--dur); }
.aud:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
.aud__icon { width: 44px; height: 44px; border-radius: 13px; display: grid; place-items: center; background: var(--accent-soft); color: var(--accent-text); margin-bottom: var(--sp-5); }
.aud__title { font-size: var(--text-xl); margin-bottom: var(--sp-2); }
.aud__text { color: var(--text-2); font-size: var(--text-sm); line-height: 1.65; }

/* ---------- faq ---------- */
.faq-grid { display: grid; grid-template-columns: 1fr 1.6fr; gap: var(--sp-12); align-items: start; }
.faq-grid :deep(.sh) { margin-bottom: 0; position: sticky; top: 100px; }

/* ---------- bento ---------- */
.bento { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--sp-5); }
.bento__cell { display: grid; }
.bento__cell--wide { grid-column: span 2; }
.bento__cell > * { height: 100%; }

.demo-approve { position: relative; width: 100%; max-width: 300px; }
.demo-approve__card { display: flex; align-items: center; gap: 10px; padding: 12px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-md); box-shadow: var(--shadow-sm); font-size: var(--text-sm); }
.demo-approve__av { width: 34px; height: 34px; border-radius: 40%; display: grid; place-items: center; background: var(--info-soft); color: var(--info-text); font-family: var(--font-display); font-weight: 600; font-size: 12px; }
.demo-approve__name { flex: 1; display: flex; flex-direction: column; font-weight: 600; line-height: 1.2; }
.demo-approve__name small { font-weight: 400; color: var(--text-3); font-size: 11px; }
.demo-approve__badge { position: relative; width: 84px; height: 24px; }
.demo-approve__badge i { position: absolute; inset: 0; display: inline-flex; align-items: center; justify-content: center; gap: 4px; font-style: normal; font-size: 11px; font-weight: 700; border-radius: var(--r-full); animation: approve 4.5s var(--ease) infinite; }
.demo-approve__pending { background: var(--accent-soft); color: var(--accent-text); }
.demo-approve__ok { background: var(--success-soft); color: var(--success-text); opacity: 0; animation-name: approve-ok !important; }
@keyframes approve { 0%, 44% { opacity: 1; transform: scale(1); } 50%, 100% { opacity: 0; transform: scale(0.8); } }
@keyframes approve-ok { 0%, 46% { opacity: 0; transform: scale(0.8); } 52%, 92% { opacity: 1; transform: scale(1); } 100% { opacity: 0; } }
.demo-approve__cursor { position: absolute; width: 14px; height: 14px; border: 2px solid var(--text); border-radius: 50% 50% 50% 0; transform: rotate(-45deg); right: 40px; top: 40px; opacity: 0; animation: cursor 4.5s var(--ease) infinite; }
@keyframes cursor { 0% { opacity: 0; transform: translate(40px, 30px) rotate(-45deg); } 20%, 40% { opacity: 1; transform: translate(0, 0) rotate(-45deg); } 46% { transform: translate(0, 0) rotate(-45deg) scale(0.8); } 60%, 100% { opacity: 0; transform: translate(0, 0) rotate(-45deg); } }

.demo-theme { position: relative; width: 190px; height: 130px; }
.demo-theme__card { position: absolute; inset: 0; border-radius: var(--r-md); border: 1px solid var(--line); padding: 14px; display: flex; flex-direction: column; gap: 8px; animation: theme 6s var(--ease) infinite; }
.demo-theme__card i { height: 8px; border-radius: 4px; background: currentColor; opacity: 0.25; }
.demo-theme__card i:nth-child(2) { width: 70%; }
.demo-theme__card i:nth-child(3) { width: 50%; }
.demo-theme__card b { margin-top: auto; height: 26px; width: 80px; border-radius: 8px; background: var(--primary); }
@keyframes theme { 0%, 40% { background: #fff; color: #1a1f2b; border-color: #e6e2d8; } 50%, 90% { background: #1b2029; color: #ece9e1; border-color: #2b323d; } }
.demo-theme__sun, .demo-theme__moon { position: absolute; top: -12px; width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; box-shadow: var(--shadow-md); animation: sunmoon 6s var(--ease) infinite; }
.demo-theme__sun { right: -10px; background: var(--accent); color: var(--ink-900); }
.demo-theme__moon { right: -10px; background: var(--pine-900); color: #fff; animation-name: moonsun; }
@keyframes sunmoon { 0%, 40% { opacity: 1; transform: rotate(0); } 50%, 90% { opacity: 0; transform: rotate(120deg); } }
@keyframes moonsun { 0%, 40% { opacity: 0; transform: rotate(-120deg); } 50%, 90% { opacity: 1; transform: rotate(0); } }

/* ---------- timeline ---------- */
.timeline { position: relative; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--sp-6); }
.timeline::before { content: ''; position: absolute; top: 32px; left: calc(16.66% + 32px); right: calc(16.66% + 32px); height: 2px; background: var(--line-strong); }
.timeline::after { content: ''; position: absolute; top: 32px; left: calc(16.66% + 32px); width: calc(66.66% - 64px); height: 2px; background: var(--primary); transform: scaleX(0); transform-origin: left; transition: transform 1.4s var(--ease-out) 300ms; }
.timeline.is-visible::after { transform: scaleX(1); }
.tl { text-align: center; }
.tl__node { position: relative; width: 64px; height: 64px; margin: 0 auto var(--sp-5); border-radius: 50%; display: grid; place-items: center; background: var(--surface); border: 2px solid var(--line-strong); color: var(--text-3); box-shadow: 0 0 0 8px var(--bg); transition: all var(--dur-slow) var(--ease-spring); transition-delay: calc(var(--i) * 450ms + 300ms); }
.timeline.is-visible .tl__node { background: var(--primary); border-color: var(--primary); color: var(--on-primary); transform: scale(1.06); }
.tl__n { position: absolute; top: -8px; right: -8px; width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; background: var(--accent); color: var(--ink-900); font-family: var(--font-display); font-weight: 700; font-size: 11px; }
.tl__card { padding: var(--sp-5); background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-lg); transition: transform var(--dur) var(--ease), box-shadow var(--dur); }
.tl__card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
.tl__title { font-size: var(--text-xl); margin-bottom: var(--sp-2); }
.tl__text { color: var(--text-2); font-size: var(--text-sm); line-height: 1.6; }

/* ---------- cta ---------- */
.cta { padding: var(--sp-16) 0; }
.cta__band { position: relative; overflow: hidden; text-align: center; padding: var(--sp-16) var(--sp-8); border-radius: var(--r-xl); background: var(--pine-900); color: rgba(244, 242, 236, 0.8); isolation: isolate; }
.aurora { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.6; z-index: -1; animation: aurora 14s var(--ease) infinite alternate; }
.aurora--1 { width: 520px; height: 520px; right: -160px; top: -260px; background: rgba(232, 163, 61, 0.45); }
.aurora--2 { width: 460px; height: 460px; left: -160px; bottom: -220px; background: rgba(42, 147, 119, 0.7); animation-delay: -5s; }
.aurora--3 { width: 300px; height: 300px; left: 45%; top: -120px; background: rgba(59, 123, 212, 0.35); animation-delay: -9s; }
@keyframes aurora { to { transform: translate(-60px, 40px) scale(1.2) rotate(20deg); } }
.cta__title { font-size: clamp(2rem, 4vw, 3rem); color: #fff; letter-spacing: -0.02em; }
.cta__title em { color: var(--saffron-200); }
.cta__sub { margin: var(--sp-4) auto var(--sp-8); font-size: var(--text-lg); max-width: 48ch; }
.cta__actions { display: flex; gap: var(--sp-4); justify-content: center; align-items: center; flex-wrap: wrap; }
.cta__link { color: #fff; font-size: var(--text-sm); font-weight: 500; opacity: 0.85; }

/* ---------- footer ---------- */
.footer { border-top: 1px solid var(--line); padding: var(--sp-8) 0; }
.footer__inner { display: flex; align-items: center; gap: var(--sp-6); flex-wrap: wrap; font-size: var(--text-sm); }
.footer__brand { display: flex; align-items: center; gap: var(--sp-2); }
.footer__dot { color: var(--text-3); }
.footer__links { display: flex; gap: var(--sp-5); margin-left: auto; }
.footer__links a { color: var(--text-2); }
.footer__meta { width: 100%; }

@media (max-width: 960px) {
  .hero__grid { grid-template-columns: 1fr; gap: var(--sp-10); text-align: center; }
  .hero__sub { margin: 0 auto; }
  .hero__cta, .hero__proof { justify-content: center; }
  .hero__scroll { display: none; }
  .bento { grid-template-columns: 1fr; }
  .audience { grid-template-columns: 1fr; }
  .faq-grid { grid-template-columns: 1fr; gap: var(--sp-6); }
  .faq-grid :deep(.sh) { position: static; }
  .bento__cell--wide { grid-column: auto; }
  .timeline { grid-template-columns: 1fr; gap: var(--sp-8); }
  .timeline::before, .timeline::after { display: none; }
  .facts__grid { grid-template-columns: 1fr 1fr; }
  .facts__grid > :nth-child(3) { border-left: 0; }
  .facts__grid > :nth-child(n + 3) { border-top: 1px solid var(--line); }
}
@media (max-width: 560px) {
  .container { padding: 0 var(--sp-4); }
  .section { padding: var(--sp-12) 0; }
  .hero { padding: var(--sp-8) 0 var(--sp-12); }
  .hero__title br { display: none; }
  .cta__band { padding: var(--sp-10) var(--sp-5); }
  .footer__links { margin-left: 0; }
}
</style>
