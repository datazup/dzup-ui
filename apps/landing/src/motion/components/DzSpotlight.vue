<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useReducedMotion } from '../useReducedMotion.ts'

/**
 * DzSpotlight — a radial light that follows the pointer over a surface
 * (docs/animations.md §6.4, effect 17). Wrap any content; a soft brand-tinted
 * glow tracks the cursor across the surface, fading in on enter and out on
 * leave.
 *
 * Performance & a11y guarantees:
 * - Pointer position is applied via `transform: translate3d` on a single layer,
 *   rAF-throttled (one paint per frame regardless of pointer event rate). No
 *   layout properties animate.
 * - `will-change: transform` is set only while the pointer is engaged and
 *   cleared on leave/unmount, so an off-screen surface holds no compositor layer.
 * - Pointer-driven only: touch (`pointerType === 'touch'`) is ignored, and the
 *   glow never sits under a keyboard focus path — it is decorative
 *   (`aria-hidden`) and `pointer-events: none`, so it can't steal clicks.
 * - Under reduced motion (OS or the page-level toggle) tracking is disabled and
 *   a gentle static glow is shown instead.
 */
const props = withDefaults(
  defineProps<{
    /** Spotlight diameter; falls back to `--dz-anim-spotlight-size` (320px). */
    size?: string
  }>(),
  { size: 'var(--dz-anim-spotlight-size, 320px)' },
)

const reduced = useReducedMotion()

const root = ref<HTMLElement | null>(null)
const glow = ref<HTMLElement | null>(null)

/** Whether a fine pointer is currently engaged (drives the glow opacity). */
const active = ref(false)

// Latest pointer coords (relative to the surface) + a single queued rAF so a
// burst of pointermove events collapses to one transform write per frame.
let nextX = 0
let nextY = 0
let frame = 0

function applyFrame(): void {
  frame = 0
  const el = glow.value
  if (!el)
    return
  // Center the glow on the pointer (translate by half its own size).
  el.style.transform = `translate3d(calc(${nextX}px - 50%), calc(${nextY}px - 50%), 0)`
}

function onPointerMove(event: PointerEvent): void {
  // Pointer-driven only — touch gets the static fallback (no tracking).
  if (event.pointerType === 'touch')
    return
  const el = root.value
  if (!el)
    return
  const rect = el.getBoundingClientRect()
  nextX = event.clientX - rect.left
  nextY = event.clientY - rect.top
  if (!active.value) {
    active.value = true
    glow.value?.style.setProperty('will-change', 'transform')
  }
  if (!frame)
    frame = requestAnimationFrame(applyFrame)
}

function onPointerLeave(): void {
  active.value = false
  if (frame) {
    cancelAnimationFrame(frame)
    frame = 0
  }
  // Drop the compositor hint once the surface is idle.
  glow.value?.style.removeProperty('will-change')
}

function attach(el: HTMLElement): void {
  el.addEventListener('pointermove', onPointerMove)
  el.addEventListener('pointerleave', onPointerLeave)
}

function detach(el: HTMLElement): void {
  el.removeEventListener('pointermove', onPointerMove)
  el.removeEventListener('pointerleave', onPointerLeave)
  onPointerLeave()
  // Drop any JS-applied position so the reduced-motion static glow can center.
  glow.value?.style.removeProperty('transform')
}

// Bind listeners only when motion is allowed; rebind reactively if the
// reduced-motion preference flips (e.g. the page-level toggle).
watch(
  [root, reduced],
  ([el, isReduced], _prev, onCleanup) => {
    if (!el || isReduced)
      return
    attach(el)
    onCleanup(() => detach(el))
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (frame)
    cancelAnimationFrame(frame)
})

const glowStyle = computed(() => ({
  width: props.size,
  height: props.size,
}))
</script>

<template>
  <div ref="root" class="dz-spotlight">
    <div
      ref="glow"
      class="dz-spotlight__glow"
      :class="{ 'dz-spotlight__glow--active': active, 'dz-spotlight__glow--reduced': reduced }"
      :style="glowStyle"
      aria-hidden="true"
    />
    <div class="dz-spotlight__content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.dz-spotlight {
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

.dz-spotlight__glow {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  border-radius: 50%;
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--dz-duration-slow, 300ms) var(--dz-ease-out, ease-out);
  background: radial-gradient(
    circle closest-side,
    color-mix(in oklch, var(--dz-colors-primary-500, #0766ee) 32%, transparent),
    transparent 100%
  );
}

/* Fade in while a fine pointer is engaged. */
.dz-spotlight__glow--active {
  opacity: 1;
}

/* Reduced motion (OS or page toggle) → a gentle, centered static glow. */
.dz-spotlight__glow--reduced {
  opacity: 0.55;
  inset: 0;
  margin: auto;
}

.dz-spotlight__content {
  position: relative;
  z-index: 1;
}
</style>
