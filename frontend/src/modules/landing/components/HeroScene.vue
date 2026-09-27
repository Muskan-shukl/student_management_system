<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

/**
 * The hero's 3D object: a glass graduation cap with three orbiting "record"
 * plates (admin / teacher / student) and a slow drift of particles.
 * Reacts to the cursor and to scroll; respects reduced-motion.
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

  // ---- renderer / scene / camera ----
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(el.clientWidth, el.clientHeight)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  el.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(32, el.clientWidth / el.clientHeight, 0.1, 100)
  camera.position.set(0, 1.9, 9)

  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

  const key = new THREE.DirectionalLight(0xffe2b0, 2.2); key.position.set(4, 6, 5); scene.add(key)
  const rim = new THREE.DirectionalLight(0x9fd3b8, 1.6); rim.position.set(-6, 2, -4); scene.add(rim)
  scene.add(new THREE.AmbientLight(0xffffff, 0.25))

  // ---- materials ----
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xdff3ea, transmission: 0.92, thickness: 0.9, roughness: 0.12, metalness: 0,
    ior: 1.45, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 1.4, transparent: true,
  })
  const glassDark = glass.clone(); glassDark.color = new THREE.Color(0x9fc2ad); glassDark.transmission = 0.78
  const gold = new THREE.MeshStandardMaterial({ color: 0xe8a33d, metalness: 1, roughness: 0.28, envMapIntensity: 1.6 })
  const ivory = new THREE.MeshStandardMaterial({ color: 0xf4f2ec, metalness: 0.1, roughness: 0.45 })
  const sage = new THREE.MeshStandardMaterial({ color: 0x65825a, metalness: 0.3, roughness: 0.4 })
  const ink = new THREE.MeshStandardMaterial({ color: 0x1f2a27, metalness: 0.6, roughness: 0.35 })

  const geoms: THREE.BufferGeometry[] = []
  const G = <T extends THREE.BufferGeometry>(g: T) => { geoms.push(g); return g }

  // ---- graduation cap ----
  const cap = new THREE.Group()
  const boardMat = new THREE.MeshPhysicalMaterial({ color: 0x2f3f36, metalness: 0.3, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.9 })
  const board = new THREE.Mesh(G(new THREE.BoxGeometry(2.5, 0.1, 2.5)), boardMat)
  board.position.y = 0.42; board.rotation.y = Math.PI / 4
  const edge = new THREE.Mesh(G(new THREE.BoxGeometry(2.62, 0.035, 2.62)), gold) // thin gold edge under the board
  edge.position.y = 0.375; edge.rotation.y = Math.PI / 4
  const crown = new THREE.Mesh(G(new THREE.CylinderGeometry(0.72, 0.86, 0.66, 64)), glassDark)
  crown.position.y = 0.05
  const brim = new THREE.Mesh(G(new THREE.TorusGeometry(0.86, 0.035, 16, 80)), gold)
  brim.rotation.x = Math.PI / 2; brim.position.y = -0.27
  const button = new THREE.Mesh(G(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 32)), gold)
  button.position.y = 0.49
  cap.add(board, edge, crown, brim, button)

  // tassel: cord + knot + fringe, hung from the board's corner
  const tassel = new THREE.Group()
  const cord = new THREE.Mesh(G(new THREE.CylinderGeometry(0.014, 0.014, 1.15, 12)), gold)
  cord.position.y = -0.57
  const knot = new THREE.Mesh(G(new THREE.SphereGeometry(0.07, 24, 24)), gold)
  knot.position.y = -1.12
  const fringe = new THREE.Mesh(G(new THREE.ConeGeometry(0.1, 0.42, 24, 1, true)), gold)
  fringe.position.y = -1.36; fringe.rotation.x = Math.PI
  tassel.add(cord, knot, fringe)
  tassel.position.set(0, 0.46, 1.32) // one corner of the rotated board
  cap.add(tassel)
  scene.add(cap)

  // soft contact shadow (radial gradient on a flat disc) so the cap feels grounded
  const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = shadowCanvas.height = 256
  const sctx = shadowCanvas.getContext('2d')!
  const grad = sctx.createRadialGradient(128, 128, 10, 128, 128, 128)
  grad.addColorStop(0, 'rgba(20,32,26,0.38)'); grad.addColorStop(1, 'rgba(20,32,26,0)')
  sctx.fillStyle = grad; sctx.fillRect(0, 0, 256, 256)
  const shadowTex = new THREE.CanvasTexture(shadowCanvas)
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
  const shadow = new THREE.Mesh(G(new THREE.PlaneGeometry(3.4, 3.4)), shadowMat)
  shadow.rotation.x = -Math.PI / 2
  scene.add(shadow)

  // ---- orbiting record plates ----
  const plateGeo = G(new THREE.BoxGeometry(0.72, 0.46, 0.03))
  const lineGeo = G(new THREE.BoxGeometry(0.38, 0.04, 0.01))
  const dotGeo = G(new THREE.CircleGeometry(0.07, 24))
  const orbits: { pivot: THREE.Group; speed: number }[] = []
  const plateMats = [gold, sage, ivory]
  for (let i = 0; i < 3; i++) {
    const pivot = new THREE.Group()
    pivot.rotation.x = 0.28 + i * 0.22
    pivot.rotation.z = (i - 1) * 0.22
    const plate = new THREE.Group()
    const face = new THREE.Mesh(plateGeo, plateMats[i])
    const l1 = new THREE.Mesh(lineGeo, ink); l1.position.set(0.04, 0.06, 0.02)
    const l2 = new THREE.Mesh(lineGeo, ink); l2.position.set(-0.04, -0.04, 0.02); l2.scale.x = 0.7
    const dot = new THREE.Mesh(dotGeo, ink); dot.position.set(-0.24, 0.1, 0.02)
    plate.add(face, l1, l2, dot)
    plate.position.x = 1.95 + i * 0.22
    plate.rotation.y = -0.3
    pivot.add(plate)
    scene.add(pivot)
    orbits.push({ pivot, speed: 0.16 + i * 0.06 })
  }

  // ---- particles ----
  const N = 260
  const pos = new Float32Array(N * 3)
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 16; pos[i * 3 + 1] = (Math.random() - 0.5) * 10; pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2 }
  const pGeo = G(new THREE.BufferGeometry()); pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const pMat = new THREE.PointsMaterial({ color: 0xcfe3d8, size: 0.035, transparent: true, opacity: 0.55, sizeAttenuation: true })
  const points = new THREE.Points(pGeo, pMat)
  scene.add(points)

  // ---- theme (light / dark) ----
  const applyTheme = () => {
    const dark = document.documentElement.dataset.theme === 'dark'
    pMat.color.set(dark ? 0xcfe3d8 : 0x4d6244)
    pMat.opacity = dark ? 0.55 : 0.4
    renderer!.toneMappingExposure = dark ? 1.05 : 1.35
    key.intensity = dark ? 2.2 : 3.0
    rim.intensity = dark ? 1.6 : 1.3
    shadowMat.color.set(dark ? 0x000000 : 0xffffff)
    boardMat.color.set(dark ? 0x1d2925 : 0x2f3f36)
  }
  applyTheme()
  const themeObs = new MutationObserver(applyTheme)
  themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

  // ---- interaction ----
  const target = { x: 0, y: 0 }
  const current = { x: 0, y: 0 }
  let scrollT = 0
  const onMove = (e: PointerEvent) => { target.x = (e.clientX / window.innerWidth - 0.5) * 2; target.y = (e.clientY / window.innerHeight - 0.5) * 2 }
  const onScroll = () => { scrollT = Math.min(1, window.scrollY / window.innerHeight) }
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('scroll', onScroll, { passive: true })

  const ro = new ResizeObserver(() => {
    if (!renderer) return
    const w = el.clientWidth, h = el.clientHeight
    renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix()
  })
  ro.observe(el)

  const clock = new THREE.Clock()
  const narrow = () => el.clientWidth < 760
  const tick = () => {
    const t = clock.getElapsedTime()
    current.x += (target.x - current.x) * 0.05
    current.y += (target.y - current.y) * 0.05

    const idle = reduce ? 0 : t
    cap.rotation.y = idle * 0.35 + current.x * 0.5 + scrollT * 1.6
    cap.rotation.x = Math.sin(idle * 0.6) * 0.06 + current.y * 0.25 - scrollT * 0.4
    cap.position.y = 0.45 + Math.sin(idle * 0.9) * 0.12 - scrollT * 1.4
    cap.position.x = narrow() ? 0 : 2.0 - scrollT * 0.6
    tassel.rotation.z = Math.sin(idle * 1.4) * 0.18
    tassel.rotation.x = Math.cos(idle * 1.1) * 0.12

    shadow.position.set(cap.position.x, cap.position.y - 1.75, 0)
    const lift = (cap.position.y - 0.45 + scrollT * 1.4) // bob height
    shadow.scale.setScalar((1 - lift * 0.5) * (narrow() ? 0.8 : 1))
    shadowMat.opacity = 0.6 - lift * 1.2
    for (const o of orbits) {
      o.pivot.rotation.y = idle * o.speed + current.x * 0.2
      o.pivot.position.copy(cap.position)
      o.pivot.children[0]!.rotation.y = -o.pivot.rotation.y + Math.sin(idle * 0.7) * 0.2
    }
    points.rotation.y = idle * 0.02
    points.position.y = -scrollT * 0.8

    const n = narrow()
    const sc = n ? 0.8 : 1
    cap.scale.setScalar(sc)
    for (const o of orbits) o.pivot.scale.setScalar(sc)
    camera.position.x += ((current.x * 0.4) - camera.position.x) * 0.04
    camera.position.y += ((1.9 - current.y * 0.35) - camera.position.y) * 0.04
    camera.position.z += ((n ? 16 : 9) - camera.position.z) * 0.08
    camera.lookAt(n ? 0 : 0.6, n ? -1.1 : 0.25, 0)

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
    window.removeEventListener('scroll', onScroll)
    geoms.forEach((g) => g.dispose())
    ;[glass, glassDark, boardMat, gold, ivory, sage, ink, pMat, shadowMat].forEach((m) => m.dispose())
    shadowTex.dispose()
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
  <div ref="host" class="scene" :class="{ 'scene--ready': ready }" aria-hidden="true" />
</template>

<style scoped>
.scene { position: absolute; inset: 0; opacity: 0; transition: opacity 1.4s var(--ease-out) 200ms; }
.scene--ready { opacity: 1; }
.scene :deep(canvas) { display: block; width: 100% !important; height: 100% !important; }
</style>
