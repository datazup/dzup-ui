<script setup lang="ts">
import { computed } from 'vue'
import { useReducedMotion } from '../useReducedMotion.ts'

/**
 * DzBorderBeam — a light beam that travels a card's border on a loop
 * (docs/animations.md §6.5, effect 23). Wraps any content; the shared
 * `.dz-border-beam` utility in `tokens.css` paints a conic-gradient ring masked
 * to a hairline band, with one bright arc that reads as a dot circling the
 * border. Only the gradient angle (a registered `<angle>`) animates, so the box
 * never transforms and the rounded ring stays true to its corners.
 *
 * Purely decorative and GPU-cheap. Under reduced motion (OS or the page-level
 * toggle) the beam freezes to a static, faint brand ring — bound here via
 * {@link useReducedMotion} for the live toggle; the OS setting is handled
 * centrally in `tokens.css`.
 *
 * Give the slotted card a matching `border-radius` and an opaque surface so the
 * ring peeks only at the edges (see the gallery demo).
 */
const reduced = useReducedMotion()

const classes = computed(() => ({
  'dz-border-beam': true,
  'dz-border-beam--reduced': reduced.value,
}))
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
