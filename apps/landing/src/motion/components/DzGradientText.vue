<script setup lang="ts">
import { computed } from 'vue'
import { useReducedMotion } from '../useReducedMotion.ts'

/**
 * DzGradientText — animated brand-gradient sweep over text (docs/animations.md
 * §6.2, effect 7). The animated counterpart to the static `.lp-gradient-text`
 * in `tailwind.css`: a primary→secondary gradient is clipped to the slotted
 * text and its `background-position` pans continuously.
 *
 * Wraps slotted text (typically a `DzHeading`/`DzText`); the gradient clips to
 * the descendants' glyphs via `background-clip: text`, so their own color is
 * forced transparent. Under reduced motion (OS or the page-level toggle) the
 * pan stops and a static gradient is shown — its accessible fallback. The text
 * itself is untouched in the DOM, so it stays selectable and screen-reader-read.
 *
 * Token-only colors/timings; animates `background-position` only (no layout
 * thrash, no transform on the text box).
 */
const props = withDefaults(
  defineProps<{
    /** Element to render as the gradient wrapper. */
    as?: string
  }>(),
  { as: 'span' },
)

const reduced = useReducedMotion()

const classes = computed(() => ({
  'dz-gradient-text': true,
  'dz-gradient-text--reduced': reduced.value,
}))
</script>

<template>
  <component :is="props.as" :class="classes">
    <slot />
  </component>
</template>

<style scoped>
.dz-gradient-text {
  display: inline-block;
  background-image: linear-gradient(
    100deg,
    var(--dz-colors-primary-600, #4f46e5),
    var(--dz-colors-secondary-500, #a855f7) 55%,
    var(--dz-colors-primary-500, #6366f1)
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: dz-anim-gradient-pan var(--dz-anim-gradient-duration, 6s) linear infinite;
}

/* Force descendant text (e.g. DzHeading) transparent so the gradient shows. */
.dz-gradient-text :deep(*) {
  color: inherit;
  background-color: transparent;
}

/* Reduced motion (page-level toggle) → static gradient, no pan. */
.dz-gradient-text--reduced {
  animation: none;
  background-position: 0 0;
}
</style>
