<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { useReducedMotion } from '../useReducedMotion.ts'

/**
 * DzBeam — an animated light beam between two referenced elements
 * (docs/animations.md §5.1, effect 37). Renders an absolutely-positioned SVG
 * overlay that fills its (positioned) parent, draws a quadratic-bézier path from
 * the centre of the `from` element to the centre of the `to` element, and rides
 * a short, bright gradient dash along it on a loop.
 *
 * How the motion stays cheap and safe:
 * - Stroke only. The path is normalised (`pathLength="100"`), so a
 *   `dash + gap = 100` dasharray shows exactly one pulse and animating
 *   `stroke-dashoffset` by `-100` loops it seamlessly. The box never transforms,
 *   so the connector never skews.
 * - Geometry is measured from the live bounding boxes (relative to the SVG's own
 *   rect), recomputed on mount, on resize (ResizeObserver over the overlay + both
 *   endpoints) and whenever a referenced element changes — so the beam tracks a
 *   responsive layout without layout-animating anything itself.
 * - Decorative: `aria-hidden`, `pointer-events: none`.
 * - Reduced motion (OS or the page-level toggle, via {@link useReducedMotion}) →
 *   the travelling pulse is dropped and only the static connector line remains.
 * - forced-colors (§7): the connector line falls back to `CanvasText` so it can
 *   never vanish in Windows High Contrast.
 *
 * Extraction-ready: no landing-only imports beyond the sibling motion module.
 */
const props = withDefaults(
  defineProps<{
    /** Start node — a template ref (element) or a CSS selector resolved within the parent. */
    from: HTMLElement | string | null | undefined
    /** End node — a template ref (element) or a CSS selector resolved within the parent. */
    to: HTMLElement | string | null | undefined
    /** Perpendicular bow of the path's control point, in px (>0 bows upward). */
    curvature?: number
    /** One travel-loop duration (any CSS time). */
    duration?: string
    /** Reverse the travel direction (to → from). */
    reverse?: boolean
    /** Gradient head colour (any CSS colour / token). */
    fromColor?: string
    /** Gradient tail colour (any CSS colour / token). */
    toColor?: string
  }>(),
  {
    curvature: 44,
    duration: 'var(--dz-anim-beam-duration, 4s)',
    reverse: false,
    fromColor: 'var(--dz-colors-primary-400, #5195ff)',
    toColor: 'var(--dz-colors-secondary-400, #978bda)',
  },
)

const reduced = useReducedMotion()

// Stable, unique gradient id (SSR-safe; avoids url(#…) collisions between
// multiple beams on one page).
const gradId = `dz-beam-grad-${useId()}`

const svg = ref<SVGSVGElement | null>(null)
const d = ref('')
const ends = ref({ x1: 0, y1: 0, x2: 0, y2: 0 })

function resolve(target: HTMLElement | string | null | undefined): Element | null {
  if (!target)
    return null
  if (typeof target === 'string') {
    return svg.value?.parentElement?.querySelector(target) ?? null
  }
  return target
}

function measure(): void {
  const svgEl = svg.value
  const a = resolve(props.from)
  const b = resolve(props.to)
  if (!svgEl || !a || !b) {
    d.value = ''
    return
  }
  const s = svgEl.getBoundingClientRect()
  if (!s.width || !s.height)
    return
  const ra = a.getBoundingClientRect()
  const rb = b.getBoundingClientRect()
  const x1 = ra.left + ra.width / 2 - s.left
  const y1 = ra.top + ra.height / 2 - s.top
  const x2 = rb.left + rb.width / 2 - s.left
  const y2 = rb.top + rb.height / 2 - s.top
  // Control point at the midpoint, bowed perpendicular by `curvature`.
  const cx = (x1 + x2) / 2
  const cy = (y1 + y2) / 2 - props.curvature
  d.value = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`
  ends.value = { x1, y1, x2, y2 }
}

let observer: ResizeObserver | null = null
const observed = new Set<Element>()

function syncObserved(): void {
  if (!observer)
    return
  const next = [svg.value, resolve(props.from), resolve(props.to)].filter(Boolean) as Element[]
  for (const el of observed) {
    if (!next.includes(el)) {
      observer.unobserve(el)
      observed.delete(el)
    }
  }
  for (const el of next) {
    if (!observed.has(el)) {
      observer.observe(el)
      observed.add(el)
    }
  }
}

function onResize(): void {
  measure()
}

onMounted(() => {
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(() => measure())
  }
  syncObserved()
  // Measure after layout settles so the endpoints have their final boxes.
  requestAnimationFrame(measure)
  window.addEventListener('resize', onResize)
})

// Re-resolve + re-measure whenever a referenced element swaps in/out.
watch(
  () => [props.from, props.to],
  () => {
    syncObserved()
    requestAnimationFrame(measure)
  },
)

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  observer?.disconnect()
  observer = null
  observed.clear()
})

const overlayClass = computed(() => ({
  'dz-beam': true,
  'dz-beam--reduced': reduced.value,
  'dz-beam--reverse': props.reverse,
}))

const pulseStyle = computed(() => ({ '--dz-beam-duration': props.duration }))
</script>

<template>
  <svg
    ref="svg"
    :class="overlayClass"
    fill="none"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient
        :id="gradId"
        gradientUnits="userSpaceOnUse"
        :x1="ends.x1"
        :y1="ends.y1"
        :x2="ends.x2"
        :y2="ends.y2"
      >
        <stop offset="0%" :stop-color="fromColor" />
        <stop offset="100%" :stop-color="toColor" />
      </linearGradient>
    </defs>

    <template v-if="d">
      <!-- Static connector line — the always-on element + reduced-motion fallback. -->
      <path class="dz-beam__line" :d="d" />
      <!-- Soft glow + bright core, travelling together as one comet-like pulse. -->
      <path class="dz-beam__pulse dz-beam__pulse--glow" :d="d" pathLength="100" :stroke="`url(#${gradId})`" :style="pulseStyle" />
      <path class="dz-beam__pulse dz-beam__pulse--core" :d="d" pathLength="100" :stroke="`url(#${gradId})`" :style="pulseStyle" />
    </template>
  </svg>
</template>

<style scoped>
.dz-beam {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: visible;
  pointer-events: none;
}

/* Faint, always-visible connector — the path the pulse rides, and the static
 * fallback under reduced motion. */
.dz-beam__line {
  fill: none;
  stroke: color-mix(in oklch, var(--dz-colors-primary-500, #0766ee) 24%, transparent);
  stroke-width: 1.5;
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
}

/* Travelling pulse — a single normalised dash (dash + gap = 100) offset one full
 * length per loop, so it returns exactly to its start: a jump-free loop. */
.dz-beam__pulse {
  fill: none;
  stroke-linecap: round;
  stroke-dasharray: var(--dz-anim-beam-dash, 18) var(--dz-anim-beam-gap, 82);
  vector-effect: non-scaling-stroke;
  will-change: stroke-dashoffset;
  animation: dz-anim-beam-travel var(--dz-beam-duration, var(--dz-anim-beam-duration, 4s)) linear infinite;
}

.dz-beam__pulse--glow {
  stroke-width: 6;
  opacity: 0.35;
}

.dz-beam__pulse--core {
  stroke-width: 2.25;
  opacity: 0.95;
}

/* Reverse travel: run the same keyframe backwards. */
.dz-beam--reverse .dz-beam__pulse {
  animation-direction: reverse;
}

/* Reduced motion (OS or page toggle) → only the static connector line. */
.dz-beam--reduced .dz-beam__pulse {
  animation: none;
  opacity: 0;
  will-change: auto;
}

/* forced-colors (§7): the gradient pulse may flatten, so guarantee the connector
 * line stays visible by mapping it to a system colour. */
@media (forced-colors: active) {
  .dz-beam__line {
    stroke: CanvasText;
  }
}
</style>
