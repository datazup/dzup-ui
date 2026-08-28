<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { DzParallax, useReducedMotion } from '../../motion/index.ts'

/**
 * ThemesHeroField — the /themes hero's depth decoration
 * (docs/themes-v2.md TASK-THV2-02).
 *
 * The atelier twin of AnimationsHeroField, with the twist this page demands:
 * where /animations floats live motion (its product is motion), THIS page's
 * product is the theme itself — so the field floats five "paint chips" whose
 * every color, radius, shadow and typeface reads the LIVE `--dz-*` tokens.
 * ThemeRecipeController applies the visitor's recipe to `documentElement`, so
 * the chips repaint in real time as the visitor mixes: the decoration IS the
 * product. Zero image bytes — everything is DOM + tokens.
 *
 * Contract (inherited from DzParallax + the landing-v2 hero discipline):
 * - Decoration only: DzParallax's host renders aria-hidden; `inert` is added so
 *   the subtree can never surface to AT or take interaction. RECORDED DECISION:
 *   `inert` blocks pointer events for the whole subtree, so per-chip `v-tilt`
 *   (which needs pointer events on the element) is incompatible with a truly
 *   inert field — depth answers the pointer via viewport-sourced parallax
 *   (window listeners, unaffected by inert) plus a slow CSS 3D sway instead,
 *   exactly the AV2-02 resolution.
 * - Post-paint: renders nothing until `onMounted` flips `ready`, so the H1 and
 *   lede paint first and the field never joins the critical path. Chips are
 *   absolutely positioned — mounting shifts no layout.
 * - Reduced motion (OS or the page's Motion preview — ThemesPage installs
 *   `provideMotionPreference` driven by the recipe): DzParallax disables
 *   itself and the float/sway keyframes are cut; the field degrades to a
 *   static composition.
 */

/**
 * Chip placement: `--depth` (parallax travel), position, scale and float delay
 * are design; offsets are logical (inset-inline-end) so RTL mirrors for free —
 * the hero copy is start-aligned, so the free margin is the inline-end flank.
 */
const CHIP_STYLES = [
  { 'top': '2%', 'insetInlineEnd': '2%', '--pc-scale': '1', '--pc-delay': '0s', '--depth': '0.55' },
  { 'top': '48%', 'insetInlineEnd': '15%', '--pc-scale': '0.8', '--pc-delay': '-4.2s', '--depth': '0.95' },
  { 'top': '12%', 'insetInlineEnd': '21%', '--pc-scale': '0.7', '--pc-delay': '-8.1s', '--depth': '0.35' },
  { 'top': '60%', 'insetInlineEnd': '1%', '--pc-scale': '0.9', '--pc-delay': '-2.3s', '--depth': '0.75' },
  { 'top': '30%', 'insetInlineEnd': '0.5%', '--pc-scale': '0.75', '--pc-delay': '-6.4s', '--depth': '0.45' },
] as const

const reduced = useReducedMotion()

/** Post-paint gate: the field mounts only after the hero copy has painted. */
const ready = ref(false)
onMounted(() => {
  ready.value = true
})

/** The live primary mini-ramp: five real `--dz-colors-primary-*` shades. */
const RAMP_SHADES = [300, 400, 500, 600, 700] as const
</script>

<template>
  <DzParallax v-if="ready" source="viewport" :disabled="reduced" inert class="thv2-hero-field">
    <!-- The primary ramp, as a physical paint chip. -->
    <span class="dz-parallax-layer thv2-chip thv2-chip--ramp" :style="CHIP_STYLES[0]">
      <i
        v-for="shade in RAMP_SHADES"
        :key="shade"
        class="thv2-ramp-step"
        :style="{ background: `var(--dz-colors-primary-${shade})` }"
      />
    </span>

    <!-- The typeface specimen on the primary solid — follows font AND hue. -->
    <span class="dz-parallax-layer thv2-chip thv2-chip--type" :style="CHIP_STYLES[1]">
      <span class="thv2-type-aa">Aa</span>
    </span>

    <!-- The radius demo — follows the radius slider live. -->
    <span class="dz-parallax-layer thv2-chip thv2-chip--radius" :style="CHIP_STYLES[2]">
      <i class="thv2-radius-square" />
    </span>

    <!-- The elevation demo — follows the shadow slider live. -->
    <span class="dz-parallax-layer thv2-chip thv2-chip--shadow" :style="CHIP_STYLES[3]">
      <i class="thv2-shadow-card" />
    </span>

    <!-- The secondary ramp as a slim vertical bar. -->
    <span class="dz-parallax-layer thv2-chip thv2-chip--bar" :style="CHIP_STYLES[4]" />
  </DzParallax>
</template>

<style scoped>
.thv2-hero-field {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  /* Edge chips sit at small logical offsets for depth; clip them rather than
     ever spawning a horizontal scrollbar. */
  overflow: clip;
}

/* One paint chip: a small card whose paint is the LIVE token set. Size via
   width, not transform-scale — the central reduced-motion block forces
   `transform: none !important` on parallax layers, which would strip a scale;
   width survives it (TV2-02 trap). */
.thv2-chip {
  position: absolute;
  display: grid;
  place-items: center;
  width: calc(120px * var(--pc-scale, 1));
  aspect-ratio: 5 / 4;
  border: 1px solid var(--lp-hairline, #d5d7d9);
  border-radius: var(--dz-radius-lg, 0.625rem);
  background: color-mix(in oklch, var(--dz-surface, #ffffff) 78%, transparent);
  box-shadow: var(--dz-shadow-md, 0 6px 16px rgb(0 0 0 / 0.08));
  opacity: 0.65;
  overflow: hidden;
  animation: thv2-chip-float 15s ease-in-out infinite;
  animation-delay: var(--pc-delay, 0s);
}

.thv2-chip--ramp {
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  place-items: stretch;
  gap: 0;
  padding: 10px;
}

.thv2-ramp-step {
  display: block;
}

.thv2-ramp-step:first-child {
  border-start-start-radius: var(--dz-radius-sm, 4px);
  border-end-start-radius: var(--dz-radius-sm, 4px);
}

.thv2-ramp-step:last-child {
  border-start-end-radius: var(--dz-radius-sm, 4px);
  border-end-end-radius: var(--dz-radius-sm, 4px);
}

.thv2-chip--type {
  background: var(--dz-primary, #0766ee);
  border-color: color-mix(in oklch, var(--dz-primary, #0766ee) 70%, var(--lp-hairline, #d5d7d9));
}

.thv2-type-aa {
  font-family: var(--dz-font-sans, inherit);
  font-size: var(--dz-text-2xl, 1.5rem);
  font-weight: 700;
  color: var(--dz-primary-foreground, #ffffff);
}

.thv2-radius-square {
  display: block;
  width: 56%;
  aspect-ratio: 1;
  border: 2px solid var(--dz-colors-primary-400, #4b93f3);
  border-radius: var(--dz-radius-xl, 0.875rem);
  background: color-mix(in oklch, var(--dz-colors-primary-400, #4b93f3) 14%, transparent);
}

.thv2-shadow-card {
  display: block;
  width: 58%;
  aspect-ratio: 4 / 3;
  border-radius: var(--dz-radius-md, 6px);
  background: var(--dz-surface, #ffffff);
  box-shadow: var(--dz-shadow-lg, 0 12px 28px rgb(0 0 0 / 0.14));
}

.thv2-chip--bar {
  width: calc(44px * var(--pc-scale, 1));
  aspect-ratio: 1 / 3;
  background: linear-gradient(
    to bottom,
    var(--dz-colors-secondary-400, #8a79d6),
    var(--dz-colors-secondary-600, #5b4a9e)
  );
  border-color: color-mix(in oklch, var(--dz-secondary, #7260bd) 45%, var(--lp-hairline, #d5d7d9));
}

/* The parallax translate, the float AND the 3D sway all want `transform`, so
   the keyframes re-state the `.dz-parallax-layer` calc and layer a vertical
   drift + slow rotateY on top — nothing fights over the property, and the
   pointer keeps steering mid-float because the custom properties re-resolve
   every frame. */
@keyframes thv2-chip-float {
  0%,
  100% {
    transform:
      translate3d(
        calc(var(--dz-parallax-x, 0) * var(--depth, 0) * var(--dz-anim-parallax-range, 12px)),
        calc(var(--dz-parallax-y, 0) * var(--depth, 0) * var(--dz-anim-parallax-range, 12px)),
        0
      )
      perspective(600px) rotateY(-6deg);
  }
  50% {
    transform:
      translate3d(
        calc(var(--dz-parallax-x, 0) * var(--depth, 0) * var(--dz-anim-parallax-range, 12px)),
        calc(var(--dz-parallax-y, 0) * var(--depth, 0) * var(--dz-anim-parallax-range, 12px) - 9px),
        0
      )
      perspective(600px) rotateY(6deg);
  }
}

/* The field is margin decoration: step down to the widest-margin chips as the
   margins narrow, then leave entirely before the copy could collide. */
@media (max-width: 1360px) {
  .thv2-chip--type,
  .thv2-chip--radius {
    display: none;
  }
}

@media (max-width: 1100px) {
  .thv2-hero-field {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .thv2-chip {
    /* Static composition: no drift/sway; the central tokens.css block already
       zeroes the parallax range and forces the layer transform off. */
    animation: none;
  }
}
</style>
