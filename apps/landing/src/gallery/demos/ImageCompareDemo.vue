<script setup lang="ts">
import { DzCompare, useReducedMotion } from '../../motion/index.ts'

/**
 * Image comparison demo (catalog `image-compare`, effect 50) — a before/after
 * wipe with a draggable AND keyboard-operable handle ({@link DzCompare}). The
 * handle is a real role="slider": drag it, or focus it and use Arrow / Home /
 * End keys. Under reduced motion (OS or page toggle, via `disabled`) the one-shot
 * intro sweep is skipped — manual drag/keys still work, and the static baseline
 * is the full "before" image.
 *
 * Both images are self-contained inline SVG gradients (no network dependency):
 * the "before" is a muted greyscale draft, the "after" the saturated brand take.
 */
const reduced = useReducedMotion()

function svg(colors: [string, string, string], dim: boolean): string {
  const s = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="270">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${colors[0]}"/>
        <stop offset="0.55" stop-color="${colors[1]}"/>
        <stop offset="1" stop-color="${colors[2]}"/>
      </linearGradient>
    </defs>
    <rect width="480" height="270" fill="url(#g)"/>
    <circle cx="350" cy="84" r="60" fill="#ffffff" opacity="${dim ? 0.08 : 0.2}"/>
    <circle cx="120" cy="210" r="96" fill="#ffffff" opacity="${dim ? 0.05 : 0.14}"/>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(s)}`
}

const beforeSrc = svg(['#94a3b8', '#cbd5e1', '#e2e8f0'], true)
const afterSrc = svg(['#6366f1', '#a855f7', '#ec4899'], false)
</script>

<template>
  <div class="stage">
    <DzCompare
      class="compare"
      :before-src="beforeSrc"
      before-alt="Before — muted greyscale draft"
      :after-src="afterSrc"
      after-alt="After — saturated brand grade"
      aspect-ratio="16/9"
      :disabled="reduced"
    />
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 8px;
}

.compare {
  width: min(360px, 100%);
}
</style>
