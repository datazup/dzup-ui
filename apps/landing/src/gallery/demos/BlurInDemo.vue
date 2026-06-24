<script setup lang="ts">
import { DzImage } from '@dzup-ui/core'
import { DzReveal } from '../../motion/index.ts'

/**
 * Blur-in demo (catalog `blur-in`, effect 4) — a DzImage that resolves from
 * `filter: blur(8px)` to sharp while it fades in, via {@link DzReveal}'s `blur`
 * option (equivalent to `v-reveal.blur`).
 *
 * The image is a self-contained inline SVG gradient (no network dependency).
 * Under reduced motion (OS or page toggle) the blur is dropped — a plain fade.
 */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#6366f1"/>
      <stop offset="0.55" stop-color="#a855f7"/>
      <stop offset="1" stop-color="#ec4899"/>
    </linearGradient>
  </defs>
  <rect width="320" height="180" fill="url(#g)"/>
  <circle cx="232" cy="56" r="40" fill="#ffffff" opacity="0.18"/>
  <circle cx="80" cy="140" r="64" fill="#ffffff" opacity="0.12"/>
</svg>`
const imageSrc = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
</script>

<template>
  <div class="stage">
    <DzReveal blur class="frame">
      <DzImage :src="imageSrc" alt="Decorative brand gradient" fit="cover" aspect-ratio="16/9" />
    </DzReveal>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.frame {
  width: min(320px, 100%);
  overflow: hidden;
  border-radius: var(--dz-radius-lg, 0.625rem);
}
</style>
