<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { computed, ref } from 'vue'
import { DzSpotlight, useReducedMotion, useScrollProgress } from '../../motion/index.ts'
import ShowcaseDashboard from '../ShowcaseDashboard.vue'
import { riseTransform } from './showcaseRise.ts'

/**
 * ShowcaseSection — the dashboard rises off the page
 * (docs/landing-v2.md TASK-LV2-04).
 *
 * Wraps the untouched, `/classic`-shared `ShowcaseDashboard` in a perspective
 * stage: on scroll the whole section straightens from a ~10° backward tilt to
 * exact identity over the first 60% of its viewport entry (`riseTransform` —
 * the pure, unit-tested mapping), then a cursor-follow `DzSpotlight` plays
 * across the upright surface.
 *
 * Contracts:
 * - Transform-only, on this wrapper — the dashboard's own tree is untouched
 *   and fully interactive; at rest the wrapper reports `transform: none` and
 *   drops `will-change`, so nothing composites and no interaction ever happens
 *   against a rotated plane.
 * - Reduced motion: identity always (the spotlight also degrades to its static
 *   glow per its own contract).
 * - Scroll input is `useScrollProgress` (rAF-throttled, passive, leak-free) —
 *   the JS floor that works everywhere; there is no hidden state, so a browser
 *   without scroll-driven animations loses nothing.
 */

const host = ref<HTMLElement | null>(null)
const reduced = useReducedMotion()
const progress = useScrollProgress(host)

const riseStyle = computed<CSSProperties | undefined>(() => {
  const transform = riseTransform(progress.value, reduced.value)
  if (transform === 'none')
    return undefined
  return { transform, willChange: 'transform' }
})
</script>

<template>
  <div ref="host" class="showcase-stage dz-depth-stage">
    <div class="showcase-rise" :style="riseStyle">
      <DzSpotlight>
        <ShowcaseDashboard />
      </DzSpotlight>
    </div>
  </div>
</template>

<style scoped>
/* The stage supplies perspective (--dz-anim-depth-perspective, 1200px) via
   .dz-depth-stage; the rise wrapper is the single transformed plane. */
.showcase-rise {
  transform-origin: 50% 100%;
}
</style>
