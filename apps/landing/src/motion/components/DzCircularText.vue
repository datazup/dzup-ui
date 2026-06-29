<script setup lang="ts">
import { computed } from 'vue'
import { useReducedMotion } from '../useReducedMotion.ts'

/**
 * DzCircularText — lays a string of characters around a circular path and slowly
 * rotates the whole ring (docs/animations.md §5.2, effect 39). Pairs with a badge
 * or seal-style label.
 *
 * Each glyph rides a thin radial spoke pivoting at the circle centre, so the text
 * curves along the rim with no per-character width maths. Transform-only — the
 * ring spins via a single GPU-cheap `rotate` loop.
 *
 * Accessibility & layout (§7):
 * - The curved glyphs are decorative duplicates, so the spokes are `aria-hidden`;
 *   the real text is kept in the DOM once via a visually-hidden `.dz-sr-only`
 *   string so assistive tech announces one clean, stable string.
 * - The ring is a fixed-size box (radius-derived), so the spin never reflows
 *   surrounding content.
 * - Under reduced motion (OS or the page-level toggle, via {@link
 *   useReducedMotion}) the ring freezes to static curved text — its accessible
 *   fallback — and the compositor hint is dropped.
 *
 * The looping ring carries `will-change: transform` while animating; the shared
 * off-screen loop cap (`.dz-stage-idle`, tokens.css) pauses it and clears the hint
 * when the card scrolls away. Extraction-ready: no landing-only imports.
 */
const props = withDefaults(
  defineProps<{
    /** The text to lay around the ring (announced as one string). */
    text: string
    /** Ring radius (centre → glyph), in px. */
    radius?: number
    /** One full revolution duration (any CSS time). */
    speed?: string
    /** Flip the spin direction. */
    reverse?: boolean
  }>(),
  {
    radius: 80,
    speed: 'var(--dz-anim-circular-duration, 18s)',
    reverse: false,
  },
)

const reduced = useReducedMotion()

/** The visible glyphs, paired with their angular placement around the ring. */
const glyphs = computed(() => {
  const chars = [...props.text]
  const step = 360 / Math.max(1, chars.length)
  return chars.map((char, i) => ({
    // Non-breaking space keeps gaps from collapsing in the inline-block spoke.
    char: char === ' ' ? ' ' : char,
    angle: i * step,
  }))
})

/** Box is sized to the ring diameter so the spin reserves stable space. */
const ringStyle = computed(() => ({
  width: `${props.radius * 2}px`,
  height: `${props.radius * 2}px`,
  animationDuration: props.speed,
  animationDirection: props.reverse ? 'reverse' : 'normal',
}))

const rootClass = computed(() => ({
  'dz-circular': true,
  'dz-circular--reduced': reduced.value,
}))
</script>

<template>
  <span :class="rootClass">
    <!-- The real, readable string — announced once as one clean string. -->
    <span class="dz-sr-only">{{ props.text }}</span>

    <!-- Decorative curved copy: a spinning ring of radial spokes. -->
    <span class="dz-circular__ring" :style="ringStyle" aria-hidden="true">
      <span
        v-for="(g, i) in glyphs"
        :key="`g-${i}`"
        class="dz-circular__char"
        :style="{ height: `${props.radius}px`, transform: `translateX(-50%) rotate(${g.angle}deg)` }"
      >{{ g.char }}</span>
    </span>
  </span>
</template>

<style scoped>
.dz-circular {
  position: relative;
  display: inline-flex;
  vertical-align: middle;
}

/* The rotating ring: a square box that turns a full revolution per loop. */
.dz-circular__ring {
  position: relative;
  display: block;
  transform-origin: center center;
  animation-name: dz-circular-spin;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform;
}

/* Each glyph rides a thin spoke from the rim to the centre, pivoting at the
 * centre, so rotating the spoke parks the glyph (at the top) around the circle. */
.dz-circular__char {
  position: absolute;
  top: 0;
  left: 50%;
  display: inline-block;
  transform-origin: bottom center;
  font: inherit;
  line-height: 1;
  white-space: pre;
}

@keyframes dz-circular-spin {
  to {
    transform: rotate(360deg);
  }
}

/* Reduced motion (OS or page toggle) → static curved text, no spin, no hint.
 * The per-glyph placement transforms stay so the curve is preserved. */
.dz-circular--reduced .dz-circular__ring {
  animation: none;
  will-change: auto;
}
</style>
