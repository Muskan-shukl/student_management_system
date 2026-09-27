<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{ words: string[]; interval?: number }>()
const index = ref(0)
let timer = 0
onMounted(() => { timer = window.setInterval(() => (index.value = (index.value + 1) % props.words.length), props.interval ?? 2600) })
onBeforeUnmount(() => window.clearInterval(timer))
</script>

<template>
  <span class="rw">
    <Transition name="rw" mode="out-in">
      <em :key="words[index]" class="rw__word">{{ words[index] }}</em>
    </Transition>
  </span>
</template>

<style scoped>
.rw { display: inline-block; position: relative; }
.rw__word { display: inline-block; font-style: italic; font-weight: 500; color: var(--accent-text); }
.rw__word::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0.08em; height: 0.12em; background: var(--accent); opacity: 0.35; border-radius: 2px; transform-origin: left; animation: underline 2.6s var(--ease-out) both; }
@keyframes underline { from { transform: scaleX(0); } 30% { transform: scaleX(1); } }
.rw-enter-active { transition: opacity 320ms var(--ease-out), transform 320ms var(--ease-out); }
.rw-leave-active { transition: opacity 200ms var(--ease), transform 200ms var(--ease); }
.rw-enter-from { opacity: 0; transform: translateY(0.5em) rotate(2deg); }
.rw-leave-to { opacity: 0; transform: translateY(-0.5em); }
</style>
