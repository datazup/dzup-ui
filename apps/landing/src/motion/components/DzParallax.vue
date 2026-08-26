<script setup lang="ts">
import { ref, watch } from 'vue'
import { useParallax } from '../useParallax.ts'

/**
 * DzParallax — a pointer-parallax stage for **decorative layers only**
 * (docs/landing-v2.md TASK-LV2-02).
 *
 * Wraps `useParallax` and exposes its normalised pointer position to CSS as two
 * unitless custom properties on the host, `--dz-parallax-x` / `--dz-parallax-y`
 * (-1..1). Each slotted layer opts into movement with the `.dz-parallax-layer`
 * class plus a per-layer `--depth` (0 = static, 1 = full travel); travel
 * distance is `--dz-anim-parallax-range` (tokens.css), so the whole field is
 * token-tunable and the reduced-motion block can zero it centrally.
 *
 * Contract:
 * - **Decoration only.** The host renders `aria-hidden` and inert; interactive
 *   or informative children are forbidden — parallax must never move a click,
 *   focus or reading target (same rule as `v-tilt`).
 * - Inherits `useParallax`'s gates: fine-pointer only, reduced-motion off (both
 *   the OS setting via the composable and `--dz-anim-parallax-range: 0px` in
 *   the central reduce block), one rAF write per frame, leak-free, SSR-safe.
 *
 * Usage:
 *   <DzParallax source="viewport" class="hero-depth">
 *     <span class="dz-parallax-layer layer-glow" style="--depth: 0.3" />
 *     <span class="dz-parallax-layer layer-grid" style="--depth: 0.6" />
 *   </DzParallax>
 */

const props = defineProps<{
  /** Pointer source — see `useParallax`. Default: the host element itself. */
  source?: 'self' | 'viewport'
  /** Reactive off-switch; wire to `useReducedMotion` for page-level toggles. */
  disabled?: boolean
}>()

const host = ref<HTMLElement | null>(null)
const { x, y } = useParallax(host, {
  source: props.source ?? 'self',
  disabled: () => props.disabled ?? false,
})

// Two style-property writes per (rAF-throttled) update; layers derive their own
// transforms in CSS so N layers never mean N style writes.
watch([x, y], ([px, py]) => {
  const el = host.value
  if (!el)
    return
  el.style.setProperty('--dz-parallax-x', String(px))
  el.style.setProperty('--dz-parallax-y', String(py))
})
</script>

<template>
  <div ref="host" class="dz-parallax" aria-hidden="true">
    <slot />
  </div>
</template>
