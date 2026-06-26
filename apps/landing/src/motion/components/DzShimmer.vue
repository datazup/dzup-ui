<script setup lang="ts">
import { computed } from 'vue'
import { useReducedMotion } from '../useReducedMotion.ts'

/**
 * DzShimmer — a sweeping highlight over loading placeholders
 * (docs/animations.md §6.7, effect 28). Wrap a cluster of DzSkeleton elements;
 * the shared `.dz-shimmer` utility in `tokens.css` rides a soft highlight band
 * across the masked area via a translated ::after (transform only, GPU-cheap).
 * Pair with `:animate="false"` skeletons so the sweep is the only motion.
 *
 * Under reduced motion (OS or the page-level toggle) the sweep is removed and the
 * placeholders sit static — bound here via {@link useReducedMotion} for the live
 * toggle; the OS setting is also handled centrally in `tokens.css`.
 */
const reduced = useReducedMotion()

const classes = computed(() => ({
  'dz-shimmer': true,
  'dz-shimmer--reduced': reduced.value,
}))
</script>

<template>
  <div :class="classes" aria-hidden="true">
    <slot />
  </div>
</template>
