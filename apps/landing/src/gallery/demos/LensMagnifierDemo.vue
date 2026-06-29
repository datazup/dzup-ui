<script setup lang="ts">
import { DzLens, useReducedMotion } from '../../motion/index.ts'

/**
 * Lens / magnifier demo (catalog `lens`, effect 51) — a magnifier circle that
 * follows the pointer over an image via {@link DzLens}, showing a zoomed view of
 * whatever sits under the cursor (transform + background-position, rAF). Touch +
 * keyboard get the plain image; under reduced motion (OS or page toggle, via
 * `disabled`) there is no lens.
 *
 * The image is a self-contained inline SVG with fine detail (a numbered grid) so
 * the magnification is legible. No network dependency.
 */
const reduced = useReducedMotion()

const cells = Array.from({ length: 6 * 4 }, (_, i) => {
  const col = i % 6
  const row = Math.floor(i / 6)
  const x = 20 + col * 76
  const y = 24 + row * 64
  return `<text x="${x}" y="${y}" font-family="monospace" font-size="13" fill="#1e293b">${String(i + 1).padStart(2, '0')}</text>`
}).join('')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360">
  <rect width="480" height="360" fill="#f1f5f9"/>
  <g opacity="0.4" stroke="#94a3b8" stroke-width="1">
    ${Array.from({ length: 7 }, (_, i) => `<line x1="${i * 76}" y1="0" x2="${i * 76}" y2="360"/>`).join('')}
    ${Array.from({ length: 6 }, (_, i) => `<line x1="0" y1="${i * 64}" x2="480" y2="${i * 64}"/>`).join('')}
  </g>
  ${cells}
  <circle cx="360" cy="270" r="54" fill="#6366f1" opacity="0.18"/>
  <circle cx="120" cy="110" r="40" fill="#ec4899" opacity="0.16"/>
</svg>`
const imageSrc = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
</script>

<template>
  <div class="stage">
    <DzLens
      class="lens"
      :src="imageSrc"
      alt="A numbered reference grid"
      :zoom="2.4"
      :size="132"
      aspect-ratio="4/3"
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

.lens {
  width: min(340px, 100%);
}
</style>
