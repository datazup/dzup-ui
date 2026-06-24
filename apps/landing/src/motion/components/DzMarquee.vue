<script setup lang="ts">
import { computed } from 'vue'
import { useReducedMotion } from '../useReducedMotion.ts'

/**
 * DzMarquee — an infinite horizontal scroll of a logo/badge strip
 * (docs/animations.md §6.6, effect 25). The default slot is rendered twice into
 * a single track; the shared `.dz-marquee` utility in `tokens.css` translates the
 * track by exactly -50% so one full run scrolls past before snapping back
 * invisibly — a seamless, jump-free loop. Transform translate only (GPU-cheap).
 *
 * Pauses on hover (and focus-within) so visitors can read an item. Under reduced
 * motion (OS or the page-level toggle) it degrades to a single, static
 * `flex-wrap` row — no duplicated copy and no animation — bound here via
 * {@link useReducedMotion} for the live toggle; the OS setting is also handled
 * centrally in `tokens.css`.
 *
 * The second run is `aria-hidden` so assistive tech announces the content once.
 */
const reduced = useReducedMotion()

const classes = computed(() => ({
  'dz-marquee': true,
  'dz-marquee--reduced': reduced.value,
}))
</script>

<template>
  <!-- Reduced motion: a calm, static wrapped row (no loop, no duplicate copy). -->
  <div v-if="reduced" class="marquee-static">
    <slot />
  </div>

  <!-- Default: a duplicated run scrolls on a seamless transform loop. -->
  <div v-else :class="classes">
    <div class="dz-marquee__track">
      <div class="dz-marquee__run">
        <slot />
      </div>
      <div class="dz-marquee__run" aria-hidden="true">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.marquee-static {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--dz-anim-marquee-gap, 2rem);
}
</style>
