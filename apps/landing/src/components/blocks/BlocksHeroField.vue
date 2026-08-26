<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { CATEGORIES } from '../../blocks/registry.ts'
import { DzParallax, useReducedMotion } from '../../motion/index.ts'

/**
 * BlocksHeroField — the /blocks hero's depth decoration (TASK-BV2-02).
 *
 * A DzParallax stage of floating "block postcards": small, abstract, token-built
 * skeleton cards (header dot · text lines · a button pill — the anatomy of what
 * a block IS) drifting at different depths behind and beside the hero copy. No
 * screenshots, no imagery bytes — the shapes are pure CSS and every tint is a
 * REAL category accent pulled from the registry, so the field is honest about
 * the catalog it fronts.
 *
 * Contract (inherited from DzParallax + the landing-v2 hero discipline):
 * - Decoration only: the stage is aria-hidden (DzParallax's host) and
 *   `pointer-events: none`; nothing here is focusable or readable.
 * - Post-paint: renders nothing until `onMounted` flips `ready`, so the hero's
 *   H1/lede paint first and the field can never join the critical path. The
 *   postcards are absolutely positioned — mounting them shifts no layout.
 * - Reduced motion: DzParallax is disabled and the float keyframes are cut by
 *   the media block below — the field degrades to a static composition.
 * - Fine pointers only for parallax (useParallax's own gate); touch readers get
 *   the drifting (or static) resting state.
 */

/**
 * Postcard composition: `--depth` (parallax travel), position, scale and float
 * delay are design; the accent HUE is derived from the registry's category
 * accents in browse order, so the field can only ever show colors the catalog
 * actually uses. Six cards — enough for depth, few enough to stay quiet.
 */
const POSTCARDS = CATEGORIES.slice(0, 6).map((category, i) => ({
  accent: category.accent,
  depth: [0.25, 0.55, 0.85, 0.4, 0.7, 1][i]!,
  style: [
    { 'top': '6%', 'left': '4%', '--pc-scale': '0.92', '--pc-delay': '0s' },
    { 'top': '48%', 'left': '-2%', '--pc-scale': '0.7', '--pc-delay': '-3.2s' },
    { 'top': '16%', 'left': '13%', '--pc-scale': '0.56', '--pc-delay': '-7.1s' },
    { 'top': '8%', 'right': '5%', '--pc-scale': '0.88', '--pc-delay': '-1.6s' },
    { 'top': '52%', 'right': '-1%', '--pc-scale': '0.66', '--pc-delay': '-5.4s' },
    { 'top': '24%', 'right': '14%', '--pc-scale': '0.5', '--pc-delay': '-8.8s' },
  ][i]!,
}))

const reduced = useReducedMotion()

/** Post-paint gate: the field mounts only after the hero copy has painted. */
const ready = ref(false)
onMounted(() => {
  ready.value = true
})
</script>

<template>
  <DzParallax v-if="ready" source="viewport" :disabled="reduced" class="bv2-hero-field">
    <span
      v-for="(card, i) in POSTCARDS"
      :key="i"
      class="dz-parallax-layer bv2-postcard"
      :style="{
        ...card.style,
        '--depth': String(card.depth),
        '--pc-accent': `var(--dz-colors-${card.accent}-500)`,
      }"
    />
  </DzParallax>
</template>

<style scoped>
.bv2-hero-field {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

/* One postcard: an abstract block. The element is the card; ::before paints the
   header (accent dot + title bar); ::after paints a button pill; the body's
   "text lines" are a repeating gradient. All hues are the category accent mixed
   against surface/foreground — token-only, legible in both themes. */
.bv2-postcard {
  position: absolute;
  /* Size, not transform-scale: the central reduced-motion block forces
     `transform: none !important` on parallax layers, which would strip a scale
     and flatten the size rhythm — width survives it. */
  width: calc(168px * var(--pc-scale, 1));
  aspect-ratio: 4 / 3;
  border: 1px solid color-mix(in oklch, var(--pc-accent, var(--dz-primary, #0766ee)) 32%, var(--lp-hairline, #d5d7d9));
  border-radius: var(--dz-radius-xl, 0.875rem);
  background:
    /* three body "text lines" */
    repeating-linear-gradient(
      to bottom,
      transparent 0 44px,
      color-mix(in oklch, var(--dz-foreground, #1b1d1f) 9%, transparent) 44px 50px,
      transparent 50px 58px
    )
    padding-box,
    color-mix(in oklch, var(--pc-accent, var(--dz-primary, #0766ee)) 7%, var(--dz-surface, #ffffff));
  box-shadow: var(--dz-shadow-md, 0 6px 16px rgb(0 0 0 / 0.08));
  opacity: 0.5;
  animation: bv2-postcard-float 14s ease-in-out infinite;
  animation-delay: var(--pc-delay, 0s);
}

/* Header: accent dot + a short accent-tinted title bar. */
.bv2-postcard::before {
  content: '';
  position: absolute;
  top: 12px;
  inset-inline-start: 12px;
  width: 10px;
  height: 10px;
  border-radius: var(--dz-radius-full, 9999px);
  background: color-mix(in oklch, var(--pc-accent, var(--dz-primary, #0766ee)) 75%, var(--dz-surface, #ffffff));
  box-shadow: 18px 1px 0 -1px color-mix(in oklch, var(--pc-accent, var(--dz-primary, #0766ee)) 38%, transparent),
    60px 1px 0 -1px color-mix(in oklch, var(--pc-accent, var(--dz-primary, #0766ee)) 20%, transparent);
}

/* Footer: one small "button" pill in the accent. */
.bv2-postcard::after {
  content: '';
  position: absolute;
  bottom: 12px;
  inset-inline-start: 12px;
  width: 44px;
  height: 12px;
  border-radius: var(--dz-radius-full, 9999px);
  background: color-mix(in oklch, var(--pc-accent, var(--dz-primary, #0766ee)) 55%, var(--dz-surface, #ffffff));
}

/* The parallax translate and the float both want `transform`, so the float's
   keyframes re-state the `.dz-parallax-layer` calc and add a gentle vertical
   drift on top — the two never fight over the property, and the pointer keeps
   steering mid-float because the custom properties re-resolve every frame. */
@keyframes bv2-postcard-float {
  0%,
  100% {
    transform: translate3d(
      calc(var(--dz-parallax-x, 0) * var(--depth, 0) * var(--dz-anim-parallax-range, 12px)),
      calc(var(--dz-parallax-y, 0) * var(--depth, 0) * var(--dz-anim-parallax-range, 12px)),
      0
    );
  }
  50% {
    transform: translate3d(
      calc(var(--dz-parallax-x, 0) * var(--depth, 0) * var(--dz-anim-parallax-range, 12px)),
      calc(var(--dz-parallax-y, 0) * var(--depth, 0) * var(--dz-anim-parallax-range, 12px) - 9px),
      0
    );
  }
}

/* The field is margin decoration: on viewports where the margins vanish it
   would sit under the hero copy, so it steps down to the two widest-margin
   cards and then leaves entirely. */
@media (max-width: 1100px) {
  .bv2-postcard:nth-child(2),
  .bv2-postcard:nth-child(3),
  .bv2-postcard:nth-child(5),
  .bv2-postcard:nth-child(6) {
    display: none;
  }
}

@media (max-width: 820px) {
  .bv2-hero-field {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .bv2-postcard {
    /* Static composition: no drift; the central tokens.css block already zeroes
       the parallax range and forces the layer transform off. */
    animation: none;
  }
}
</style>
