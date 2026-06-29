<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useInView } from '../useInView.ts'
import { useReducedMotion } from '../useReducedMotion.ts'

/**
 * DzTextFlip — cycles a list of phrases, each flipping vertically (rotateX) in
 * and out on an interval (docs/animations.md §5.2, effect 40). Distinct from the
 * typewriter: a whole word rotates through, rather than typing character by
 * character. Pairs with a headline's emphasised word.
 *
 * Transform/opacity only — the leaving phrase tips up and away while the next
 * tips in, on a shared perspective. The box is sized to the longest phrase and a
 * fixed line height, so the rotation never shifts surrounding layout (§7).
 *
 * Accessibility (§7):
 * - The flipping glyphs are decorative (a screen reader narrating a tumbling word
 *   mid-rotation reads as noise), so they are `aria-hidden`. The active phrase is
 *   mirrored into a single polite `aria-live` region so assistive tech announces
 *   each phrase as it settles — politely, never interrupting, and only the one
 *   word changes per tick (no spam).
 * - Under reduced motion (OS or the page-level toggle, via {@link
 *   useReducedMotion}) the cycle is suspended and the first phrase is shown
 *   statically — its accessible fallback.
 *
 * The cycle is a JS interval, paused while the component is scrolled out of view
 * (shared off-screen cap intent, §7) and on hover/focus so a reader can settle on
 * a phrase. Extraction-ready: no landing-only imports.
 */
const props = withDefaults(
  defineProps<{
    /** Phrases to flip through, in order. */
    phrases: string[]
    /** Element to render as the root. */
    as?: string
    /** Milliseconds each phrase is held before flipping to the next. */
    interval?: number
  }>(),
  { as: 'span', interval: 2200 },
)

const root = ref<HTMLElement | null>(null)
const reduced = useReducedMotion()
const isInView = useInView(root, { once: false })

/** Pointer/focus dwell — pauses the cycle so a reader can settle on a phrase. */
const hovering = ref(false)
const focused = ref(false)

const index = ref(0)
/** The phrase currently shown (and mirrored into the live region). */
const active = computed(() => props.phrases[index.value] ?? '')

/** Reserve the widest phrase's box so flipping never reflows the line. */
const longest = computed(() =>
  props.phrases.reduce((a, b) => (b.length > a.length ? b : a), ''),
)

/** The cycle runs only when in view, not dwelt-on, and motion is allowed. */
const paused = computed(
  () => reduced.value || hovering.value || focused.value || !isInView.value,
)

let timer: ReturnType<typeof setInterval> | null = null

function stop(): void {
  if (timer !== null) {
    clearInterval(timer)
    timer = null
  }
}

function start(): void {
  stop()
  timer = setInterval(() => {
    index.value = (index.value + 1) % Math.max(1, props.phrases.length)
  }, props.interval)
}

// Drive the interval off the paused state; reset to the first phrase whenever
// reduced motion takes over so the static fallback is deterministic.
watch(
  [paused, () => props.interval, () => props.phrases],
  () => {
    stop()
    if (reduced.value) index.value = 0
    else if (!paused.value) start()
  },
  { immediate: true },
)

onBeforeUnmount(stop)
</script>

<template>
  <component
    :is="props.as"
    ref="root"
    class="dz-text-flip"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
    @focusin="focused = true"
    @focusout="focused = false"
  >
    <!-- Politely announces the settled phrase; only this text changes per tick. -->
    <span class="dz-sr-only" aria-live="polite">{{ active }}</span>

    <!-- Sizer reserves the widest phrase's box (height + width) — no layout shift. -->
    <span aria-hidden="true" class="dz-text-flip__sizer">{{ longest }}</span>

    <!-- Decorative flipping copy. mode="out-in" tips the old word away, the new in. -->
    <span aria-hidden="true" class="dz-text-flip__viewport">
      <Transition name="dz-text-flip" mode="out-in">
        <span :key="index" class="dz-text-flip__word">{{ active }}</span>
      </Transition>
    </span>
  </component>
</template>

<style scoped>
.dz-text-flip {
  position: relative;
  display: inline-block;
  vertical-align: baseline;
}

.dz-text-flip__sizer {
  visibility: hidden;
  white-space: pre;
}

/* The flip pivots around the line's middle on a shared perspective. */
.dz-text-flip__viewport {
  position: absolute;
  inset: 0;
  display: inline-flex;
  align-items: center;
  white-space: pre;
  perspective: 320px;
}

.dz-text-flip__word {
  display: inline-block;
  transform-origin: center center;
  backface-visibility: hidden;
}

/* Enter: the incoming word tips down from above into place. */
.dz-text-flip-enter-active,
.dz-text-flip-leave-active {
  transition:
    transform var(--dz-anim-text-flip-duration, 380ms) var(--dz-anim-ease-emphasis, cubic-bezier(0.4, 0, 0.2, 1)),
    opacity var(--dz-anim-text-flip-duration, 380ms) linear;
}

.dz-text-flip-enter-from {
  opacity: 0;
  transform: rotateX(90deg);
}

/* Leave: the outgoing word tips up and away. */
.dz-text-flip-leave-to {
  opacity: 0;
  transform: rotateX(-90deg);
}
</style>
