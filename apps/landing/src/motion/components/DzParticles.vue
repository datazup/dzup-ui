<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { useInView } from '../useInView.ts'
import { useReducedMotion } from '../useReducedMotion.ts'

/**
 * DzParticles — a drifting constellation of dots (docs/animations.md §5.4, effect
 * 43). A capped set of token-coloured particles drift slowly across a positioned
 * backdrop; near neighbours are joined by faint link lines, and a fine pointer
 * gently pushes nearby dots aside.
 *
 * Rendered on a single `<canvas>` (one compositor layer) rather than N DOM nodes,
 * so the link lines + pointer reaction stay cheap and the whole field is one
 * paint. Purely decorative — `aria-hidden`, `pointer-events: none`, absolutely
 * positioned to fill its (positioned) container.
 *
 * Performance & a11y guarantees (§7):
 * - The rAF loop runs ONLY while the field is on screen AND motion is allowed.
 *   The `.dz-stage-idle` universal selector pauses CSS animations but not a
 *   canvas rAF, so the field self-pauses via its own IntersectionObserver
 *   (`useInView`) — capping concurrent loops just like the CSS effects.
 * - `count` is clamped to {@link MAX_PARTICLES} and scaled down on small
 *   surfaces, so a misconfigured prop can never tank a frame.
 * - Pointer reaction is pointer-only (a `touch` pointer is ignored) and reads the
 *   latest coordinates once per frame (rAF-throttled). The field never sits under
 *   a click/focus target (`pointer-events: none`).
 * - Under reduced motion (OS or the page-level toggle) — and on touch/keyboard,
 *   which never produce a fine-pointer move — the loop never starts: a single
 *   static frame of dots + links is drawn instead.
 */
const props = withDefaults(
  defineProps<{
    /** Target particle count (clamped to the area + {@link MAX_PARTICLES}). */
    count?: number
    /** Draw link lines between near neighbours. */
    link?: boolean
    /** Max distance (CSS px) at which two dots are linked. */
    linkDistance?: number
    /** Enable the gentle pointer push (pointer-only; ignored on touch). */
    pointer?: boolean
    /** Drift speed multiplier. */
    speed?: number
  }>(),
  {
    count: 56,
    link: true,
    linkDistance: 116,
    pointer: true,
    speed: 1,
  },
)

/** Hard ceiling so a misconfigured `count` can never tank a frame. */
const MAX_PARTICLES = 90
/** Radius (CSS px) within which the pointer pushes dots aside. */
const POINTER_RADIUS = 120

const reduced = useReducedMotion()
const root = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

// Pause the loop while scrolled out of view — the buffer resumes it just before
// the field re-enters, so there is no visible "frozen then starts" frame.
const inView = useInView(root, { once: false, rootMargin: '160px 0px 160px 0px', threshold: 0 })

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
}

let particles: Particle[] = []
let frame = 0
let width = 0
let height = 0
let dpr = 1
/** Token-derived "r, g, b" triple the canvas paints with (alpha applied per draw). */
let rgb = '99, 102, 241'
// Latest pointer position (CSS px relative to the canvas); null when not engaged.
let pointerX: number | null = null
let pointerY: number | null = null

/**
 * Resolve the brand dot/line colour from tokens at runtime by reading the
 * computed `color` of a throwaway probe — `getComputedStyle` resolves the token
 * (and any `color-mix`) to an `rgb()` triple we can re-alpha per draw.
 */
function resolveColor(): void {
  const host = root.value
  if (!host) return
  const probe = document.createElement('span')
  probe.style.color = 'var(--dz-colors-primary-500, #6366f1)'
  probe.style.display = 'none'
  host.appendChild(probe)
  const resolved = getComputedStyle(probe).color
  host.removeChild(probe)
  const match = resolved.match(/(\d+),\s*(\d+),\s*(\d+)/)
  if (match) rgb = `${match[1]}, ${match[2]}, ${match[3]}`
}

function resize(): void {
  const el = canvas.value
  const host = root.value
  if (!el || !host) return
  const rect = host.getBoundingClientRect()
  width = rect.width
  height = rect.height
  // Cap DPR at 2 — beyond that the extra pixels cost more than they show.
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  el.width = Math.round(width * dpr)
  el.height = Math.round(height * dpr)
  el.style.width = `${width}px`
  el.style.height = `${height}px`
  const ctx = el.getContext('2d')
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

/** Particle count scaled to the surface area, clamped to the prop + the ceiling. */
function desiredCount(): number {
  const areaBased = Math.round((width * height) / 14000)
  return Math.max(8, Math.min(props.count, areaBased, MAX_PARTICLES))
}

function seed(): void {
  const n = desiredCount()
  particles = Array.from({ length: n }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.4 * props.speed,
    vy: (Math.random() - 0.5) * 0.4 * props.speed,
    r: 1 + Math.random() * 1.6,
  }))
}

/** Integrate one frame of drift + pointer push (no drawing). */
function update(): void {
  const pushing = props.pointer && pointerX != null && pointerY != null
  for (const p of particles) {
    p.x += p.vx
    p.y += p.vy
    // Wrap around the edges so the field never thins out.
    if (p.x < -4) p.x = width + 4
    else if (p.x > width + 4) p.x = -4
    if (p.y < -4) p.y = height + 4
    else if (p.y > height + 4) p.y = -4

    if (pushing) {
      const dx = p.x - (pointerX as number)
      const dy = p.y - (pointerY as number)
      const d2 = dx * dx + dy * dy
      if (d2 > 0.01 && d2 < POINTER_RADIUS * POINTER_RADIUS) {
        const d = Math.sqrt(d2)
        const force = ((POINTER_RADIUS - d) / POINTER_RADIUS) * 0.6
        p.x += (dx / d) * force
        p.y += (dy / d) * force
      }
    }
  }
}

/** Paint the current positions: link lines first, dots on top. */
function render(): void {
  const ctx = canvas.value?.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, width, height)

  if (props.link) {
    const maxD = props.linkDistance
    ctx.lineWidth = 1
    ctx.strokeStyle = `rgb(${rgb})`
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i]
      if (!a) continue
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j]
        if (!b) continue
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        if (d < maxD) {
          ctx.globalAlpha = (1 - d / maxD) * 0.5
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }
    }
    ctx.globalAlpha = 1
  }

  ctx.fillStyle = `rgba(${rgb}, 0.72)`
  for (const p of particles) {
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fill()
  }
}

function loop(): void {
  update()
  render()
  frame = requestAnimationFrame(loop)
}

function start(): void {
  if (frame) return
  frame = requestAnimationFrame(loop)
}

function stop(): void {
  if (frame) {
    cancelAnimationFrame(frame)
    frame = 0
  }
}

function onPointerMove(event: PointerEvent): void {
  // Pointer-driven only — touch/keyboard never engage the push.
  if (!props.pointer || event.pointerType === 'touch' || reduced.value) {
    pointerX = null
    pointerY = null
    return
  }
  const rect = root.value?.getBoundingClientRect()
  if (!rect) return
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  // Drop the push once the pointer leaves the field's box.
  if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
    pointerX = null
    pointerY = null
    return
  }
  pointerX = x
  pointerY = y
}

// Drive the loop: run only while on screen AND motion is allowed; otherwise draw
// a single static frame. Re-evaluated when the field scrolls in/out or the
// reduced-motion preference flips (e.g. the page-level toggle).
watch(
  [root, canvas, inView, reduced],
  ([host, el, visible, isReduced]) => {
    if (!host || !el) return
    resolveColor()
    resize()
    if (!particles.length) seed()
    stop()
    if (isReduced || !visible) {
      render()
      return
    }
    start()
  },
  { immediate: true },
)

// Re-measure + reseed on container resize; redraw a static frame when paused.
watch(
  root,
  (host, _prev, onCleanup) => {
    if (!host || typeof window === 'undefined') return
    window.addEventListener('pointermove', onPointerMove)
    let observer: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        resize()
        seed()
        if (reduced.value || !inView.value) render()
      })
      observer.observe(host)
    }
    onCleanup(() => {
      window.removeEventListener('pointermove', onPointerMove)
      observer?.disconnect()
    })
  },
  { immediate: true },
)

onBeforeUnmount(stop)
</script>

<template>
  <div ref="root" class="dz-particles" aria-hidden="true">
    <canvas ref="canvas" class="dz-particles__canvas" />
  </div>
</template>

<style scoped>
.dz-particles {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  /* Decorative + non-interactive: never steals clicks. The pointer push reads a
     window-level pointermove, so it works through this layer. */
  pointer-events: none;
}

.dz-particles__canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
