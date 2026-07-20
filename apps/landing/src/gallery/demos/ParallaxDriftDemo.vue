<script setup lang="ts">
import { DzText } from '@dzup-ui/core'
import { computed, ref } from 'vue'
import { useReducedMotion, useScrollProgress } from '../../motion/index.ts'

/**
 * Scroll parallax drift demo (catalog `parallax-drift`, effect 6) — a background
 * layer that moves at a fraction of the scroll speed, driven by
 * {@link useScrollProgress} (the demo root's 0→1 progress through the viewport).
 *
 * Travel is capped (transform only, GPU-cheap) and `will-change` is set only
 * while it can move. Under reduced motion (OS or page toggle) the layer is
 * static — no transform. Scroll the page to see the drift; the foreground copy
 * stays put for depth contrast.
 */
const root = ref<HTMLElement | null>(null)
const progress = useScrollProgress(root)
const reduced = useReducedMotion()

/** Maximum parallax travel in px (capped per §6.1 / §7). */
const TRAVEL = 48

const layerStyle = computed(() => {
  if (reduced.value)
    return { transform: 'none' }
  // Center the range so the layer drifts from +TRAVEL to -TRAVEL as it passes.
  const y = (0.5 - progress.value) * 2 * TRAVEL
  return { transform: `translate3d(0, ${y.toFixed(1)}px, 0)`, willChange: 'transform' }
})
</script>

<template>
  <div ref="root" class="stage">
    <div class="layer" :style="layerStyle" aria-hidden="true" />
    <div class="content">
      <DzText weight="semibold" as="div">
        Parallax drift
      </DzText>
      <DzText size="xs" tone="muted" as="div">
        Scroll — the backdrop trails behind.
      </DzText>
    </div>
  </div>
</template>

<style scoped>
.stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 140px;
  overflow: hidden;
  border-radius: var(--dz-radius-lg, 0.625rem);
  background: var(--dz-surface, #ffffff);
}

/* Oversized so it never reveals an edge as it drifts within the capped range. */
.layer {
  position: absolute;
  inset: -30% -10%;
  background:
    radial-gradient(circle at 25% 30%, color-mix(in oklch, var(--dz-colors-primary-500, #0766ee) 45%, transparent), transparent 55%),
    radial-gradient(circle at 75% 70%, color-mix(in oklch, var(--dz-colors-secondary-500, #7260bd) 45%, transparent), transparent 55%);
  filter: blur(4px);
}

.content {
  position: relative;
  text-align: center;
  padding: 16px;
}
</style>
