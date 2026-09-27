<script setup lang="ts">
import AppButton from '@/ui/AppButton.vue'
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="nf">
    <p class="nf__code mono reveal">404</p>
    <h1 class="reveal" style="--i: 1">This page wandered off campus</h1>
    <p class="text-2 reveal" style="--i: 2">The link may be broken or the page may have moved.</p>
    <div class="reveal" style="--i: 3"><AppButton icon="arrow-left" @click="router.push('/dashboard')">Back to dashboard</AppButton></div>
  </div>
</template>

<style scoped>
.nf { min-height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: var(--sp-4); padding: var(--sp-6); }
.nf__code { font-family: var(--font-display); font-size: 6rem; font-weight: 700; line-height: 1; color: var(--primary-soft); -webkit-text-stroke: 2px var(--primary); }
</style>
