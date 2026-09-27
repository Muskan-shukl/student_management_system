<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

/** Lightweight twinkling starfield on a canvas; pauses when off-screen. */
const canvas = ref<HTMLCanvasElement | null>(null)
let frame = 0
let stars: { x: number; y: number; r: number; p: number; s: number }[] = []
let visible = true

onMounted(() => {
  const el = canvas.value!
  const ctx = el.getContext('2d')!
  const dpr = Math.min(2, window.devicePixelRatio || 1)

  const resize = () => {
    el.width = el.offsetWidth * dpr
    el.height = el.offsetHeight * dpr
    const count = Math.round((el.offsetWidth * el.offsetHeight) / 9000)
    stars = Array.from({ length: count }, () => ({
      x: Math.random(), y: Math.random(), r: Math.random() * 1.4 + 0.3, p: Math.random() * Math.PI * 2, s: 0.4 + Math.random() * 1.2,
    }))
  }
  const draw = (t: number) => {
    if (visible) {
      ctx.clearRect(0, 0, el.width, el.height)
      for (const s of stars) {
        const a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin((t / 1000) * s.s + s.p))
        ctx.beginPath()
        ctx.arc(s.x * el.width, s.y * el.height, s.r * dpr, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(241, 237, 227, ${a})`
        ctx.fill()
      }
    }
    frame = requestAnimationFrame(draw)
  }
  resize()
  window.addEventListener('resize', resize)
  const io = new IntersectionObserver((e) => (visible = e[0]?.isIntersecting ?? true))
  io.observe(el)
  frame = requestAnimationFrame(draw)
  onBeforeUnmount(() => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); io.disconnect() })
})
</script>

<template><canvas ref="canvas" class="stars" aria-hidden="true" /></template>

<style scoped>
.stars { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
</style>
