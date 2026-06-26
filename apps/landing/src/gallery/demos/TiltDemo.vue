<script setup lang="ts">
import { DzImageCard } from '@dzup-ui/core'
import { useReducedMotion, vTilt } from '../../motion/index.ts'

/**
 * 3D tilt demo (catalog `tilt`, effect 20) — a DzImageCard that rotates toward
 * the pointer via the {@link vTilt} directive, with a cursor-tracking glare.
 * rAF-throttled, transform-only; the rotation is around the card's own centre so
 * its click target never moves. Touch and keyboard-only users get no tilt, and
 * under reduced motion (OS or page toggle, passed via `disabled`) it stays flat.
 *
 * The image is a self-contained inline SVG gradient (no network dependency).
 */
const reduced = useReducedMotion()

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#6366f1"/>
      <stop offset="0.55" stop-color="#a855f7"/>
      <stop offset="1" stop-color="#ec4899"/>
    </linearGradient>
  </defs>
  <rect width="320" height="200" fill="url(#g)"/>
  <circle cx="232" cy="62" r="44" fill="#ffffff" opacity="0.18"/>
  <circle cx="84" cy="156" r="70" fill="#ffffff" opacity="0.12"/>
</svg>`
const imageSrc = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
</script>

<template>
  <div class="stage">
    <DzImageCard
      v-tilt="{ max: 12, glare: true, scale: 1.02, disabled: reduced }"
      class="card"
      :src="imageSrc"
      alt="Decorative brand gradient"
      variant="elevated"
      aspect-ratio="16/9"
    />
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  /* Headroom so the tilted card doesn't clip against the stage edges. */
  padding: 8px;
}

.card {
  width: min(280px, 100%);
}
</style>
