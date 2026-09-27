<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

/**
 * Abstract 3D for the auth panel: a slowly turning glass knot with a soft
 * halo of drifting particles and a few gold accent orbs. Reacts to the
 * cursor within its own panel; theme-aware; respects reduced-motion.
 */
const host = ref<HTMLElement | null>(null)
const ready = ref(false)

let renderer: THREE.WebGLRenderer | null = null
let raf = 0
let cleanup: (() => void) | null = null

onMounted(() => {
  const el = host.value
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(el.clientWidth, el.clientHeight)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.25
  el.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(34, el.clientWidth / el.clientHeight, 0.1, 100)
  camera.position.set(0, 0, 9)

  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

  const key = new THREE.DirectionalLight(0xffe6bd, 2.6); key.position.set(5, 6, 6); scene.add(key)
  const rim = new THREE.DirectionalLight(0x9fd3b8, 1.8); rim.position.set(-6, -2, -3); scene.add(rim)
  scene.add(new THREE.AmbientLight(0xffffff, 0.3))

  const geoms: THREE.BufferGeometry[] = []
  const G = <T extends THREE.BufferGeometry>(g: T) => { geoms.push(g); return g }

  // ---- glass knot (the hero object) ----
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xd7ede2, transmission: 0.96, thickness: 1.4, roughness: 0.06, metalness: 0,
    ior: 1.5, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.5,
    iridescence: 0.6, iridescenceIOR: 1.3, transparent: true,
  })
  const knot = new THREE.Mesh(G(new THREE.TorusKnotGeometry(1.35, 0.42, 240, 36, 2, 3)), glassMat)
  scene.add(knot)

  // a thin gold wire knot woven through, for a warm accent
  const wireMat = new THREE.MeshStandardMaterial({ color: 0xe8a33d, metalness: 1, roughness: 0.3, envMapIntensity: 1.6 })
  const wire = new THREE.Mesh(G(new THREE.TorusKnotGeometry(1.35, 0.055, 200, 12, 2, 3)), wireMat)
  scene.add(wire)

  // ---- orbiting accent orbs ----
  const orbMat = new THREE.MeshStandardMaterial({ color: 0x65825a, metalness: 0.4, roughness: 0.3, envMapIntensity: 1.4 })
  const orbGold = new THREE.MeshStandardMaterial({ color: 0xe8a33d, metalness: 1, roughness: 0.25 })
  const orbGeo = G(new THREE.SphereGeometry(0.11, 32, 32))
  const orbs: { mesh: THREE.Mesh; r: number; sp: number; ph: number; yr: number }[] = []
  const orbMats = [orbGold, orbMat, orbGold, orbMat, orbGold]
  for (let i = 0; i < 5; i++) {
    const m = new THREE.Mesh(orbGeo, orbMats[i])
    scene.add(m)
    orbs.push({ mesh: m, r: 2.5 + (i % 2) * 0.5, sp: 0.22 + i * 0.05, ph: (i / 5) * Math.PI * 2, yr: (i - 2) * 0.5 })
  }

  // ---- particle halo ----
  const N = 240
  const pos = new Float32Array(N * 3)
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 14; pos[i * 3 + 1] = (Math.random() - 0.5) * 11; pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1 }
  const pGeo = G(new THREE.BufferGeometry()); pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const pMat = new THREE.PointsMaterial({ color: 0xcfe3d8, size: 0.036, transparent: true, opacity: 0.5, sizeAttenuation: true })
  const points = new THREE.Points(pGeo, pMat)
  scene.add(points)

  // ---- theme ----
  const applyTheme = () => {
    const dark = document.documentElement.dataset.theme === 'dark'
    pMat.color.set(dark ? 0xcfe3d8 : 0x4d6244)
    pMat.opacity = dark ? 0.5 : 0.4
    renderer!.toneMappingExposure = dark ? 1.15 : 1.45
    key.intensity = dark ? 2.6 : 3.2
    rim.intensity = dark ? 1.8 : 1.5
    glassMat.color.set(dark ? 0xbfe0d2 : 0xd7ede2)
    orbMat.color.set(dark ? 0x8ca47e : 0x65825a)
  }
  applyTheme()
  const themeObs = new MutationObserver(applyTheme)
  themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

  // ---- interaction (pointer scoped to this panel) ----
  const target = { x: 0, y: 0 }
  const current = { x: 0, y: 0 }
  const onMove = (e: PointerEvent) => {
    const r = el.getBoundingClientRect()
    target.x = ((e.clientX - r.left) / r.width - 0.5) * 2
    target.y = ((e.clientY - r.top) / r.height - 0.5) * 2
  }
  window.addEventListener('pointermove', onMove, { passive: true })

  const ro = new ResizeObserver(() => {
    if (!renderer) return
    const w = el.clientWidth, h = el.clientHeight
    renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix()
  })
  ro.observe(el)

  const clock = new THREE.Clock()
  const tick = () => {
    const t = clock.getElapsedTime()
    current.x += (target.x - current.x) * 0.05
    current.y += (target.y - current.y) * 0.05
    const idle = reduce ? 0 : t

    knot.rotation.y = idle * 0.28 + current.x * 0.5
    knot.rotation.x = idle * 0.16 + current.y * 0.4
    knot.position.y = Math.sin(idle * 0.7) * 0.12
    wire.rotation.copy(knot.rotation)
    wire.position.copy(knot.position)

    for (const o of orbs) {
      const a = idle * o.sp + o.ph
      o.mesh.position.set(Math.cos(a) * o.r + current.x * 0.3, o.yr + Math.sin(a * 1.3) * 0.4 - current.y * 0.3, Math.sin(a) * o.r)
    }
    points.rotation.y = idle * 0.02

    camera.position.x += ((current.x * 0.4) - camera.position.x) * 0.04
    camera.position.y += ((-current.y * 0.35) - camera.position.y) * 0.04
    camera.lookAt(0, 0, 0)

    renderer?.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }
  tick()
  ready.value = true

  cleanup = () => {
    cancelAnimationFrame(raf)
    ro.disconnect()
    themeObs.disconnect()
    window.removeEventListener('pointermove', onMove)
    geoms.forEach((g) => g.dispose())
    ;[glassMat, wireMat, orbMat, orbGold, pMat].forEach((m) => m.dispose())
    scene.environment?.dispose()
    pmrem.dispose()
    renderer?.dispose()
    renderer?.domElement.remove()
    renderer = null
  }
})

onBeforeUnmount(() => cleanup?.())
</script>

<template>
  <div ref="host" class="ascene" :class="{ 'ascene--ready': ready }" aria-hidden="true" />
</template>

<style scoped>
.ascene { position: absolute; inset: 0; opacity: 0; transition: opacity 1.4s var(--ease-out) 200ms; }
.ascene--ready { opacity: 1; }
.ascene :deep(canvas) { display: block; width: 100% !important; height: 100% !important; }
</style>
