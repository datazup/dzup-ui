<script setup lang="ts" generic="T">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { startViewTransition, supportsViewTransitions } from '../useViewTransition.ts'

/**
 * DzCardStack — a stack of cards where the front card cycles to the back
 * (docs/animations.md §5.5, effect 47).
 *
 * Cards are positioned by depth with pure `transform` (translate + scale) and
 * z-index, so the DOM order never changes — only each card's resting transform.
 * Advancing rotates which card is at the front; the move is animated with the
 * **View Transitions API** where supported (each card carries a stable
 * `view-transition-name`, so the browser morphs it from front to back), and with
 * a **FLIP** fallback (Web Animations API, composited over the resting transform
 * so it never fights the reactive style) otherwise. Under reduced motion the
 * reorder is instant.
 *
 * Accessibility / motion guarantees (§5.5, §7):
 * - **Keyboard-operable.** A real "Next" button advances the stack; the live
 *   front card is announced via a polite live region. Clicking the stack also
 *   advances (pointer affordance) but is not required.
 * - **Reduced-motion.** When the OS sets `prefers-reduced-motion` OR
 *   `disabled: true`, the swap is instant (no VT, no FLIP) and any auto-cycle is
 *   paused (WCAG 2.2.2 — no un-pausable ambient motion).
 * - **Auto-cycle is pausable.** With `:interval` set the stack auto-advances, but
 *   pauses on hover/focus-within and never runs under reduced motion.
 *
 * No core changes — the card body is whatever the `#card` scoped slot renders
 * (e.g. a `DzCard`).
 */

const props = withDefaults(
  defineProps<{
    /** The card data; one entry per card, front-to-back at rest. */
    items: T[]
    /** Vertical peek offset per depth level, px (default `18`). */
    offset?: number
    /** Scale reduction per depth level (default `0.05`). */
    scaleStep?: number
    /** Auto-advance interval in ms; `0` disables (default `0`). */
    interval?: number
    /** Force instant swaps + no auto-cycle (page-level reduced motion). */
    disabled?: boolean
  }>(),
  { offset: 18, scaleStep: 0.05, interval: 0, disabled: false },
)

const emit = defineEmits<{ advance: [frontIndex: number] }>()

/** Stack order: `order[0]` is the front card; values are indices into `items`. */
const order = ref<number[]>(props.items.map((_, i) => i))
const wrappers = new Map<number, HTMLElement>()
let autoTimer: ReturnType<typeof setInterval> | null = null
let paused = false

watch(
  () => props.items.length,
  (n) => {
    order.value = Array.from({ length: n }, (_, i) => i)
  },
)

/** Depth (0 = front) of the card with item index `i`. */
function depthOf(i: number): number {
  return order.value.indexOf(i)
}

function wrapperStyle(i: number): Record<string, string> {
  const d = depthOf(i)
  return {
    transform: `translateY(${d * props.offset}px) scale(${(1 - d * props.scaleStep).toFixed(3)})`,
    zIndex: String(props.items.length - d),
    opacity: String(Math.max(0, 1 - d * 0.18)),
    // A stable per-card name so View Transitions morphs the SAME card across the swap.
    viewTransitionName: `dz-stack-card-${i}`,
    // Back cards must not steal clicks from the front card.
    pointerEvents: d === 0 ? 'auto' : 'none',
  }
}

const frontIndex = computed(() => order.value[0] ?? 0)

function setWrapper(i: number, el: unknown): void {
  if (el instanceof HTMLElement) wrappers.set(i, el)
  else wrappers.delete(i)
}

function prefersReduced(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Rotate the front card to the back. */
function rotate(): void {
  const next = order.value.slice()
  const front = next.shift()
  if (front === undefined) return
  next.push(front)
  order.value = next
}

/** FLIP via the Web Animations API — composited (`add`) over the resting CSS
 *  transform so it never overwrites the reactive `:style` binding. */
function flip(before: Map<number, DOMRect>): void {
  for (const [i, el] of wrappers) {
    const b = before.get(i)
    if (!b) continue
    const a = el.getBoundingClientRect()
    const dx = b.left - a.left
    const dy = b.top - a.top
    const sx = a.width ? b.width / a.width : 1
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && Math.abs(sx - 1) < 0.001) continue
    el.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${sx})` },
        { transform: 'translate(0, 0) scale(1)' },
      ],
      {
        duration: 360,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        composite: 'add',
      },
    )
  }
}

function advance(): void {
  const reduced = props.disabled || prefersReduced()
  if (reduced) {
    rotate()
    emit('advance', order.value[0] ?? 0)
    return
  }

  if (supportsViewTransitions()) {
    void startViewTransition(() => {
      rotate()
      // Resolve after the DOM/style update so the VT snapshots the new layout.
      return Promise.resolve()
    })
  } else {
    // FLIP: snapshot, mutate, then invert-and-play next frame.
    const before = new Map<number, DOMRect>()
    for (const [i, el] of wrappers) before.set(i, el.getBoundingClientRect())
    rotate()
    requestAnimationFrame(() => flip(before))
  }
  emit('advance', order.value[0] ?? 0)
}

// --- Auto-cycle (optional, pausable, off under reduced motion) ---------------
function startAuto(): void {
  stopAuto()
  if (!props.interval || props.disabled || prefersReduced()) return
  autoTimer = setInterval(() => {
    if (!paused) advance()
  }, props.interval)
}
function stopAuto(): void {
  if (autoTimer) {
    clearInterval(autoTimer)
    autoTimer = null
  }
}
function onEnter(): void {
  paused = true
}
function onLeave(): void {
  paused = false
}

watch(() => [props.interval, props.disabled], startAuto)
onMounted(startAuto)
onBeforeUnmount(stopAuto)
</script>

<template>
  <div class="dz-card-stack">
    <div
      class="dz-card-stack__stage"
      @click="advance"
      @pointerenter="onEnter"
      @pointerleave="onLeave"
      @focusin="onEnter"
      @focusout="onLeave"
    >
      <div
        v-for="(item, i) in items"
        :key="i"
        :ref="(el) => setWrapper(i, el)"
        class="dz-card-stack__card"
        :style="wrapperStyle(i)"
      >
        <slot name="card" :item="item" :index="i" :is-front="depthOf(i) === 0" />
      </div>
    </div>

    <div class="dz-card-stack__controls">
      <slot name="control" :advance="advance" :front-index="frontIndex">
        <button type="button" class="dz-card-stack__next" @click.stop="advance">
          Next card
        </button>
      </slot>
    </div>

    <!-- Announce the front card change to assistive tech. -->
    <p class="dz-sr-only" aria-live="polite">
      Card {{ frontIndex + 1 }} of {{ items.length }} in front
    </p>
  </div>
</template>

<style scoped>
.dz-card-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dz-spacing-4, 1rem);
}

.dz-card-stack__stage {
  position: relative;
  width: 100%;
  display: grid;
  /* All cards occupy the same cell; depth comes from transform + z-index. */
  place-items: stretch;
  cursor: pointer;
}

.dz-card-stack__card {
  grid-area: 1 / 1;
  transform-origin: top center;
  /* No CSS transition: the swap is owned by View Transitions / WAAPI FLIP, and
     resting changes outside a swap (e.g. data change) should just apply. */
  will-change: transform;
}

.dz-card-stack__next {
  appearance: none;
  border: 1px solid var(--dz-border, #e2e8f0);
  background: var(--dz-surface, #fff);
  color: var(--dz-foreground, #0f172a);
  border-radius: var(--dz-radius-md, 0.5rem);
  padding: var(--dz-spacing-2, 0.5rem) var(--dz-spacing-4, 1rem);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: border-color var(--dz-duration-fast, 120ms) var(--dz-ease-out, ease-out);
}
.dz-card-stack__next:hover {
  border-color: var(--dz-primary, #6366f1);
}
.dz-card-stack__next:focus-visible {
  outline: var(--dz-focus-ring-width, 2px) solid var(--dz-primary, #6366f1);
  outline-offset: 2px;
}

.dz-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
</style>
