<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useInView } from '../useInView.ts'
import { useReducedMotion } from '../useReducedMotion.ts'
import { supportsScrollTimeline } from '../useViewTransition.ts'

/**
 * DzBentoReveal — a bento grid whose cells reveal with a shared, pointer-tracked
 * spotlight + a per-cell stagger as they scroll into view (docs/animations.md
 * §5.6, effect 52 — "Magic Bento"). Slot in the cells (e.g. `DzCard`s); the
 * component tags each direct child `.dz-bento__cell`, indexes it for the cascade,
 * and lays the spotlight over the grid.
 *
 * Progressive enhancement (§3.1): where CSS scroll-driven animations exist
 * ({@link supportsScrollTimeline}) the reveal runs entirely on the compositor via
 * `animation-timeline: view()` (the `.dz-bento--native` rules in tokens.css) — no
 * JS scroll work. Everywhere else (Firefox) the JS floor takes over: {@link useInView}
 * plays the N0 `.dz-animate-in` entrance with a staggered `animation-delay`. The
 * cells are fully visible by default in BOTH paths, so nothing is ever stuck at
 * `opacity: 0` where unsupported.
 *
 * Reduced motion (OS or the page-level toggle) → all cells visible immediately,
 * no stagger (`.dz-bento--reduced` disables the native path; the JS path simply
 * never reveals), and the spotlight settles to a faint static glow. The spotlight
 * is pointer-only (touch is ignored), `aria-hidden`, and `pointer-events: none`,
 * so it never steals a click. transform/opacity only.
 */
const props = withDefaults(
  defineProps<{
    /** Element to render as the grid container. */
    as?: string
    /** Per-cell stagger step (ms) for the JS fallback reveal. */
    step?: number
    /** Render the pointer-tracked spotlight overlay (default `true`). */
    spotlight?: boolean
  }>(),
  { as: 'div', step: 70, spotlight: true },
)

const root = ref<HTMLElement | null>(null)
const spot = ref<HTMLElement | null>(null)
const reduced = useReducedMotion()

/** Capability flag — resolved on mount (SSR-safe; the gallery is client-only). */
const native = ref(false)
/** Fallback-path observer; only acted on when the native path is absent. */
const inView = useInView(root, { once: true })

let revealed = false

/** The slotted cells — every direct child except the spotlight overlay. */
function cells(): HTMLElement[] {
  if (!root.value) return []
  return (Array.from(root.value.children) as HTMLElement[]).filter(
    el => !el.classList.contains('dz-bento__spotlight'),
  )
}

function setupCells(): void {
  cells().forEach((cell, i) => {
    cell.classList.add('dz-bento__cell')
    // Drives both the native view() entry-range offset and the JS stagger delay.
    cell.style.setProperty('--dz-bento-i', String(i))
  })
}

/** JS floor: cascade the cells in with the N0 parametric entrance. */
function maybeReveal(): void {
  if (native.value || reduced.value || revealed || !inView.value) return
  revealed = true
  cells().forEach((cell, i) => {
    cell.style.animationDelay = `${i * props.step}ms`
    cell.style.willChange = 'opacity, transform'
    cell.classList.add('dz-animate-in', 'dz-fade-in', 'dz-zoom-in')
    const done = (): void => {
      cell.style.willChange = ''
      cell.removeEventListener('animationend', done)
    }
    cell.addEventListener('animationend', done)
  })
}

onMounted(async () => {
  await nextTick()
  native.value = supportsScrollTimeline()
  setupCells()
  maybeReveal()
})

watch([inView, reduced], maybeReveal)

/* -- Shared spotlight (pointer-tracked, rAF-throttled) --------------------- */
const active = ref(false)
let nx = 0
let ny = 0
let frame = 0

function applySpot(): void {
  frame = 0
  const el = spot.value
  if (!el) return
  el.style.transform = `translate3d(calc(${nx}px - 50%), calc(${ny}px - 50%), 0)`
}

function onMove(event: PointerEvent): void {
  if (event.pointerType === 'touch') return
  const el = root.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  nx = event.clientX - rect.left
  ny = event.clientY - rect.top
  if (!active.value) {
    active.value = true
    spot.value?.style.setProperty('will-change', 'transform')
  }
  if (!frame) frame = requestAnimationFrame(applySpot)
}

function onLeave(): void {
  active.value = false
  if (frame) {
    cancelAnimationFrame(frame)
    frame = 0
  }
  spot.value?.style.removeProperty('will-change')
}

function attach(el: HTMLElement): void {
  el.addEventListener('pointermove', onMove)
  el.addEventListener('pointerleave', onLeave)
}

function detach(el: HTMLElement): void {
  el.removeEventListener('pointermove', onMove)
  el.removeEventListener('pointerleave', onLeave)
  onLeave()
  spot.value?.style.removeProperty('transform')
}

// Bind pointer tracking only when motion is allowed and the spotlight is on;
// rebind reactively if the reduced-motion preference flips.
watch(
  [root, reduced],
  ([el, isReduced], _prev, onCleanup) => {
    if (!el || isReduced || !props.spotlight) return
    attach(el)
    onCleanup(() => detach(el))
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (frame) cancelAnimationFrame(frame)
})

const rootClass = computed(() => ({
  'dz-bento': true,
  'dz-bento--native': native.value,
  'dz-bento--reduced': reduced.value,
}))
</script>

<template>
  <component :is="as" ref="root" :class="rootClass">
    <div
      v-if="spotlight"
      ref="spot"
      class="dz-bento__spotlight"
      :class="{
        'dz-bento__spotlight--active': active,
        'dz-bento__spotlight--static': reduced,
      }"
      aria-hidden="true"
    />
    <slot />
  </component>
</template>

<style scoped>
.dz-bento {
  position: relative;
}

/* Shared spotlight — a soft brand light that tracks the pointer over the grid.
 * Sits above the cells but is non-interactive; a low alpha keeps cell content
 * legible while reading as a moving light. */
.dz-bento__spotlight {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;
  width: var(--dz-anim-spotlight-size, 320px);
  height: var(--dz-anim-spotlight-size, 320px);
  pointer-events: none;
  border-radius: 50%;
  opacity: 0;
  transition: opacity var(--dz-duration-slow, 300ms) var(--dz-ease-out, ease-out);
  background: radial-gradient(
    circle closest-side,
    color-mix(in oklch, var(--dz-colors-primary-500, #6366f1) 24%, transparent),
    transparent 100%
  );
}

/* Fade in while a fine pointer is engaged. */
.dz-bento__spotlight--active {
  opacity: 1;
}

/* Reduced motion (OS or page toggle) → a faint, centered static glow, no tracking. */
.dz-bento__spotlight--static {
  opacity: 0.45;
  inset: 0;
  margin: auto;
}

/* forced-colors: a soft decorative glow carries no meaning — drop it. */
@media (forced-colors: active) {
  .dz-bento__spotlight {
    display: none;
  }
}
</style>
