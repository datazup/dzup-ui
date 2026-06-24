<script setup lang="ts">
import { computed } from 'vue'
import { useReducedMotion } from '../useReducedMotion.ts'
import { useTypewriter } from '../useTypewriter.ts'

/**
 * DzTypewriter — thin wrapper around {@link useTypewriter} (docs/animations.md
 * §6.2, effect 8). Types/erases a rotating list of phrases with a blinking
 * caret, pairs with a hero subhead.
 *
 * Accessibility & layout:
 * - The animated glyphs are `aria-hidden` (a typing caret would otherwise spam
 *   a screen reader); the full phrase list is exposed once via a visually-hidden
 *   `.dz-sr-only` string so assistive tech announces clean, stable text.
 * - A hidden sizer reserves the box of the longest phrase, so typing/erasing
 *   never shifts surrounding layout (§7).
 * - Under reduced motion the first phrase is shown instantly and the caret does
 *   not blink.
 */
const props = withDefaults(
  defineProps<{
    /** Phrases to rotate through. */
    phrases: string[]
    /** Element to render as the root. */
    as?: string
    /** Milliseconds per character while typing. */
    typeSpeed?: number
    /** Milliseconds per character while erasing. */
    eraseSpeed?: number
    /** Milliseconds to hold a fully-typed phrase before erasing. */
    holdDelay?: number
  }>(),
  { as: 'span', typeSpeed: 55, eraseSpeed: 30, holdDelay: 1600 },
)

const reduced = useReducedMotion()

const { text, longest } = useTypewriter(
  () => props.phrases,
  {
    typeSpeed: props.typeSpeed,
    eraseSpeed: props.eraseSpeed,
    holdDelay: props.holdDelay,
  },
)

/** Screen-reader copy: announce the phrases as one stable string. */
const srText = computed(() => props.phrases.join(', '))
</script>

<template>
  <component :is="props.as" class="dz-typewriter">
    <span class="dz-sr-only">{{ srText }}</span>
    <!-- Reserves the longest phrase's box so typing never shifts layout. -->
    <span aria-hidden="true" class="dz-typewriter__sizer">{{ longest }}</span>
    <span aria-hidden="true" class="dz-typewriter__live">
      <span class="dz-typewriter__text">{{ text }}</span>
      <span class="dz-typewriter__caret" :class="{ 'is-reduced': reduced }" />
    </span>
  </component>
</template>

<style scoped>
.dz-typewriter {
  position: relative;
  display: inline-block;
}

.dz-typewriter__sizer {
  visibility: hidden;
  white-space: pre;
}

.dz-typewriter__live {
  position: absolute;
  inset: 0;
  display: inline-flex;
  align-items: baseline;
  white-space: pre;
}

.dz-typewriter__caret {
  display: inline-block;
  width: 0.08em;
  align-self: stretch;
  margin-inline-start: 0.04em;
  background: currentColor;
  animation: dz-anim-caret-blink var(--dz-anim-caret-duration, 1s) step-end infinite;
}

/* Reduced motion: steady, non-blinking caret. */
.dz-typewriter__caret.is-reduced {
  animation: none;
}
</style>
