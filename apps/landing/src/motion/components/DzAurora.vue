<script setup lang="ts">
import { computed } from 'vue'
import { useReducedMotion } from '../useReducedMotion.ts'

/**
 * DzAurora — a drifting brand-blob background (docs/animations.md §6.4, effect
 * 15). The animated counterpart to the static `.lp-aurora` wash in
 * `tailwind.css`: two soft, blurred primary/secondary blobs translate and scale
 * on slow, offset loops so a hero/CTA backdrop feels alive without reading as a
 * rigid animation.
 *
 * Purely decorative — rendered `aria-hidden`, `pointer-events: none`, and
 * absolutely positioned to fill its (positioned) container. Animates transform
 * only (GPU-cheap, no layout thrash). Under reduced motion (OS or the
 * page-level toggle) the loops stop and the blobs sit at their rest position —
 * the current static look. The two blobs run at different durations
 * (`--dz-anim-aurora-1/2-duration`) so the wash never visibly repeats in sync.
 */
const reduced = useReducedMotion()

const classes = computed(() => ({
  'dz-aurora': true,
  'dz-aurora--reduced': reduced.value,
}))
</script>

<template>
  <div :class="classes" aria-hidden="true">
    <span class="dz-aurora__blob dz-aurora__blob--1" />
    <span class="dz-aurora__blob dz-aurora__blob--2" />
  </div>
</template>

<style scoped>
.dz-aurora {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.dz-aurora__blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(72px);
  opacity: 0.7;
  /* Hint the compositor only while looping; cleared with the animation below. */
  will-change: transform;
}

/* Mirrors the .lp-aurora::before geometry — top-left primary wash. */
.dz-aurora__blob--1 {
  width: 52%;
  height: 60%;
  top: -22%;
  left: 8%;
  background: radial-gradient(
    circle,
    color-mix(in oklch, var(--dz-colors-primary-500, #6366f1) 42%, transparent),
    transparent 68%
  );
  animation: dz-anim-aurora-1 var(--dz-anim-aurora-1-duration, 16s) var(--dz-ease-in-out, ease-in-out) infinite;
}

/* Mirrors the .lp-aurora::after geometry — top-right secondary wash. */
.dz-aurora__blob--2 {
  width: 46%;
  height: 56%;
  top: -16%;
  right: 4%;
  background: radial-gradient(
    circle,
    color-mix(in oklch, var(--dz-colors-secondary-500, #a855f7) 38%, transparent),
    transparent 68%
  );
  animation: dz-anim-aurora-2 var(--dz-anim-aurora-2-duration, 20s) var(--dz-ease-in-out, ease-in-out) infinite;
}

[data-theme="dark"] .dz-aurora__blob {
  opacity: 0.45;
}

/* Reduced motion (OS or page toggle) → static blobs at rest, no will-change. */
.dz-aurora--reduced .dz-aurora__blob {
  animation: none;
  will-change: auto;
}
</style>
