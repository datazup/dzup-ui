<script setup lang="ts">
import { DzImage } from '@dzup-ui/core'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * DzCompare — before/after image wipe with a draggable AND keyboard-operable
 * handle (docs/animations.md §5.5, effect 50).
 *
 * The "after" image is clipped to the handle position so dragging wipes between
 * the two. The handle is a real `role="slider"` (`aria-valuemin/now/max`,
 * `aria-orientation="horizontal"`) driven by pointer drag and by the Arrow / Home
 * / End keys, so it is fully operable without a pointer. Clip-path only — no
 * layout thrash.
 *
 * Accessibility / motion guarantees (§5.5, §7):
 * - **Keyboard-first.** Arrow keys nudge by `step` (Shift ⇒ ×5), Home/End jump to
 *   the ends; the live value is announced via `aria-valuetext`.
 * - **Reduced-motion.** The one-shot intro sweep (a brief auto wipe on first view
 *   that hints the control is draggable) is skipped when the OS sets
 *   `prefers-reduced-motion` OR `disabled: true`. Manual drag/keys always work.
 * - **Static baseline.** With no interaction the control rests at the start
 *   position showing the full "before" image (the documented static fallback);
 *   both images carry real `alt` text.
 *
 * No core changes — composes core's `DzImage` for both layers.
 */

const props = withDefaults(
  defineProps<{
    /** "Before" (baseline) image. */
    beforeSrc: string
    beforeAlt: string
    /** "After" (revealed) image. */
    afterSrc: string
    afterAlt: string
    /** Aspect ratio for the stage (e.g. '16/9'). */
    aspectRatio?: string
    /** Initial / resting handle position, 0–100 (default `50`). */
    start?: number
    /** Keyboard nudge step in % (default `2`). */
    step?: number
    /** Visible label for the slider (announced; default 'Reveal after image'). */
    label?: string
    /** Skip the one-shot intro sweep (page-level reduced motion). */
    disabled?: boolean
  }>(),
  { aspectRatio: '16/9', start: 50, step: 2, label: 'Reveal after image' },
)

/** Current wipe position, 0 (full before) – 100 (full after). */
const position = ref(props.start)
const dragging = ref(false)

const stage = ref<HTMLElement | null>(null)
let activePointer: number | null = null
let introTimer: ReturnType<typeof setTimeout> | null = null
let introFrame = 0

/** The "after" layer is clipped from the right edge inward to the handle. */
const afterClip = computed(() => ({
  clipPath: `inset(0 ${(100 - position.value).toFixed(2)}% 0 0)`,
}))
const handleStyle = computed(() => ({ left: `${position.value}%` }))
const valueText = computed(() => `${Math.round(position.value)}% revealed`)

function clamp(v: number): number {
  return Math.max(0, Math.min(100, v))
}

function setFromClientX(clientX: number): void {
  const rect = stage.value?.getBoundingClientRect()
  if (!rect || !rect.width)
    return
  position.value = clamp(((clientX - rect.left) / rect.width) * 100)
}

function onPointerDown(event: PointerEvent): void {
  // Cancel any running intro sweep the moment the user takes over.
  cancelIntro()
  dragging.value = true
  activePointer = event.pointerId
  ;(event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId)
  setFromClientX(event.clientX)
}

function onPointerMove(event: PointerEvent): void {
  if (!dragging.value || event.pointerId !== activePointer)
    return
  setFromClientX(event.clientX)
}

function onPointerUp(event: PointerEvent): void {
  if (event.pointerId !== activePointer)
    return
  dragging.value = false
  activePointer = null
}

function onKeydown(event: KeyboardEvent): void {
  const step = event.shiftKey ? props.step * 5 : props.step
  let next: number | null = null
  switch (event.key) {
    case 'ArrowLeft':
    case 'ArrowDown':
      next = position.value - step
      break
    case 'ArrowRight':
    case 'ArrowUp':
      next = position.value + step
      break
    case 'Home':
      next = 0
      break
    case 'End':
      next = 100
      break
    default:
      return
  }
  cancelIntro()
  event.preventDefault()
  position.value = clamp(next)
}

/** A short one-shot auto wipe on mount that hints the control is draggable. */
function runIntro(): void {
  if (props.disabled || prefersReduced())
    return
  const from = props.start
  const sweepTo = 78
  const startTs = performance.now()
  const duration = 900
  const tick = (now: number): void => {
    const t = Math.min((now - startTs) / duration, 1)
    // Ease out-and-back so the handle nudges over then settles at `start`.
    const e = Math.sin(t * Math.PI)
    position.value = clamp(from + (sweepTo - from) * e)
    if (t < 1)
      introFrame = requestAnimationFrame(tick)
    else position.value = props.start
  }
  introTimer = setTimeout(() => {
    introFrame = requestAnimationFrame(tick)
  }, 450)
}

function cancelIntro(): void {
  if (introTimer) {
    clearTimeout(introTimer)
    introTimer = null
  }
  if (introFrame) {
    cancelAnimationFrame(introFrame)
    introFrame = 0
  }
}

function prefersReduced(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

onMounted(runIntro)
onBeforeUnmount(cancelIntro)
</script>

<template>
  <div
    ref="stage"
    class="dz-compare"
    :class="{ 'dz-compare--dragging': dragging }"
    :style="{ aspectRatio }"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <!-- Baseline: the "before" image fills the stage. -->
    <DzImage class="dz-compare__img" :src="beforeSrc" :alt="beforeAlt" fit="cover" />
    <!-- Revealed: the "after" image, clipped to the handle position. -->
    <div class="dz-compare__after" :style="afterClip" aria-hidden="true">
      <DzImage class="dz-compare__img" :src="afterSrc" :alt="afterAlt" fit="cover" />
    </div>

    <!-- The handle is the slider: focusable, arrow-key operable, announced. -->
    <div
      class="dz-compare__handle"
      :style="handleStyle"
      role="slider"
      tabindex="0"
      aria-orientation="horizontal"
      :aria-label="label"
      :aria-valuemin="0"
      :aria-valuemax="100"
      :aria-valuenow="Math.round(position)"
      :aria-valuetext="valueText"
      @keydown="onKeydown"
    >
      <span class="dz-compare__line" aria-hidden="true" />
      <span class="dz-compare__grip" aria-hidden="true" />
    </div>
  </div>
</template>

<style scoped>
.dz-compare {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: var(--dz-radius-lg, 0.75rem);
  user-select: none;
  touch-action: pan-y;
  background: var(--dz-surface, #fff);
}

.dz-compare__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.dz-compare__after {
  position: absolute;
  inset: 0;
  /* clip-path animates cheaply; no transition while dragging for a crisp track. */
}

.dz-compare:not(.dz-compare--dragging) .dz-compare__after {
  transition: clip-path var(--dz-duration-fast, 120ms) var(--dz-ease-out, ease-out);
}

.dz-compare__handle {
  position: absolute;
  top: 0;
  bottom: 0;
  /* Centre the 0-width handle on the wipe seam. */
  transform: translateX(-50%);
  width: 2px;
  display: grid;
  place-items: center;
  cursor: ew-resize;
  z-index: 3;
  outline: none;
}

.dz-compare__line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: var(--dz-compare-line-width, 2px);
  background: color-mix(in oklch, var(--dz-colors-base-white, #fff) 90%, transparent);
  box-shadow: 0 0 0 1px color-mix(in oklch, var(--dz-colors-base-black, #000) 20%, transparent);
}

.dz-compare__grip {
  position: relative;
  width: var(--dz-compare-grip-size, 32px);
  height: var(--dz-compare-grip-size, 32px);
  border-radius: var(--dz-radius-full, 9999px);
  background: var(--dz-colors-base-white, #fff);
  box-shadow: var(--dz-shadow-md, 0 4px 12px rgb(15 23 42 / 0.18));
  display: grid;
  place-items: center;
}

/* Two chevrons cue the drag affordance (pure CSS, decorative). */
.dz-compare__grip::before,
.dz-compare__grip::after {
  content: '';
  width: 6px;
  height: 6px;
  border-top: 2px solid var(--dz-colors-neutral-600, #475569);
  border-left: 2px solid var(--dz-colors-neutral-600, #475569);
  position: absolute;
}
.dz-compare__grip::before {
  transform: translateX(-5px) rotate(-45deg);
}
.dz-compare__grip::after {
  transform: translateX(5px) rotate(135deg);
}

/* Visible focus ring on the grip for keyboard users. */
.dz-compare__handle:focus-visible .dz-compare__grip {
  outline: var(--dz-focus-ring-width, 2px) solid var(--dz-primary, #6366f1);
  outline-offset: 2px;
}

@media (forced-colors: active) {
  .dz-compare__line {
    background: CanvasText;
  }
  .dz-compare__grip {
    border: 1px solid CanvasText;
  }
}
</style>
