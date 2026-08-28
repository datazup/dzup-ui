<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useTheme } from '../../composables/useTheme.ts'
import { DzParallax, useReducedMotion } from '../../motion/index.ts'
import { resolveTemplateAccent } from '../../templates/accent.ts'
import { TEMPLATES } from '../../templates/registry.ts'
import { templateThumb, templateThumbDark } from '../../templates/thumbs.ts'

/**
 * TemplatesHeroField — the /templates hero's depth decoration (TASK-TV2-02).
 *
 * The templates twin of BlocksHeroField, with one decisive upgrade: where the
 * blocks field floats abstract token-built skeletons (its brand claim is "never
 * a screenshot"), THIS page's whole point is real committed screenshots — so
 * its postcards are the product: featured templates' thumbnails in small
 * accent-tinted frames, drifting at different parallax depths beside the
 * Section header. Zero new asset bytes — every image is one of the WebPs
 * `check:previews` already guarantees, and they load lazily.
 *
 * Contract (inherited from DzParallax + the landing-v2 hero discipline):
 * - Decoration only: DzParallax's host renders aria-hidden; we add `inert` so
 *   the imagery subtree can never surface to AT or take interaction.
 * - Post-paint: renders nothing until `onMounted` flips `ready`, so the H1 and
 *   lede paint first and the field never joins the critical path. Postcards
 *   are absolutely positioned — mounting shifts no layout.
 * - Reduced motion: DzParallax disables itself and the float keyframes are cut
 *   below — the field degrades to a static composition.
 * - Theme: each postcard swaps to its `-dark` screenshot with the resolved
 *   theme, so the field always previews the theme the visitor is in.
 */

/**
 * Postcard composition: the first five FEATURED registry rows — the field can
 * only ever show templates the catalogue actually stars. `--depth` (parallax
 * travel), position, scale and float delay are design; offsets are logical
 * (inset-inline-*) so RTL mirrors the field for free.
 */
const POSTCARDS = TEMPLATES.filter(t => t.featured)
  .slice(0, 5)
  .map((template, i) => ({
    template,
    accent: resolveTemplateAccent(template),
    depth: [0.3, 0.65, 1, 0.45, 0.8][i]!,
    style: [
      { 'top': '6%', 'insetInlineStart': '1%', '--pc-scale': '1', '--pc-delay': '0s' },
      { 'top': '46%', 'insetInlineStart': '-2%', '--pc-scale': '0.72', '--pc-delay': '-3.4s' },
      { 'top': '24%', 'insetInlineStart': '12%', '--pc-scale': '0.5', '--pc-delay': '-7.2s' },
      { 'top': '9%', 'insetInlineEnd': '1%', '--pc-scale': '0.94', '--pc-delay': '-1.8s' },
      { 'top': '50%', 'insetInlineEnd': '-1%', '--pc-scale': '0.62', '--pc-delay': '-5.6s' },
    ][i]!,
  }))

const { resolved } = useTheme()

/** The screenshot for the CURRENT theme — the field previews what you'd get. */
const srcFor = computed(() => (t: (typeof POSTCARDS)[number]['template']) =>
  resolved.value === 'dark' ? templateThumbDark(t) : templateThumb(t),
)

const reduced = useReducedMotion()

/** Post-paint gate: the field mounts only after the hero copy has painted. */
const ready = ref(false)
onMounted(() => {
  ready.value = true
})
</script>

<template>
  <DzParallax v-if="ready" source="viewport" :disabled="reduced" inert class="tv2-hero-field">
    <span
      v-for="card in POSTCARDS"
      :key="card.template.slug"
      class="dz-parallax-layer tv2-postcard"
      :style="{
        ...card.style,
        '--depth': String(card.depth),
        '--pc-accent': `var(--dz-colors-${card.accent}-500)`,
      }"
    >
      <img
        class="tv2-postcard-shot"
        :src="srcFor(card.template)"
        alt=""
        loading="lazy"
        decoding="async"
        width="1600"
        height="1000"
      >
    </span>
  </DzParallax>
</template>

<style scoped>
.tv2-hero-field {
  position: absolute;
  inset-block-start: 0;
  inset-inline: 0;
  /* The header band only — the field must never reach the toolbar or grid. */
  height: 420px;
  z-index: 0;
  pointer-events: none;
  /* Edge cards sit at slightly negative logical offsets for depth; clip them
     rather than ever spawning a horizontal scrollbar. */
  overflow: clip;
}

/* One postcard: a framed screenshot. Size via width, not transform-scale — the
   central reduced-motion block forces `transform: none !important` on parallax
   layers, which would strip a scale; width survives it. */
.tv2-postcard {
  position: absolute;
  display: block;
  width: calc(232px * var(--pc-scale, 1));
  aspect-ratio: 16 / 10;
  padding: 6px;
  border: 1px solid color-mix(in oklch, var(--pc-accent, var(--dz-primary, #0766ee)) 34%, var(--lp-hairline, #d5d7d9));
  border-radius: var(--dz-radius-lg, 0.625rem);
  background: color-mix(in oklch, var(--pc-accent, var(--dz-primary, #0766ee)) 8%, var(--dz-surface, #ffffff));
  box-shadow: var(--dz-shadow-md, 0 6px 16px rgb(0 0 0 / 0.08));
  opacity: 0.55;
  animation: tv2-postcard-float 14s ease-in-out infinite;
  animation-delay: var(--pc-delay, 0s);
}

.tv2-postcard-shot {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: calc(var(--dz-radius-lg, 0.625rem) - 5px);
}

/* The parallax translate and the float both want `transform`, so the float's
   keyframes re-state the `.dz-parallax-layer` calc and add a gentle vertical
   drift on top — the two never fight over the property, and the pointer keeps
   steering mid-float because the custom properties re-resolve every frame. */
@keyframes tv2-postcard-float {
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

/* The field is margin decoration: step down to the two widest-margin cards as
   the margins narrow, then leave entirely before the copy could collide. */
@media (max-width: 1360px) {
  .tv2-postcard:nth-child(2),
  .tv2-postcard:nth-child(3),
  .tv2-postcard:nth-child(5) {
    display: none;
  }
}

@media (max-width: 1100px) {
  .tv2-hero-field {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tv2-postcard {
    /* Static composition: no drift; the central tokens.css block already zeroes
       the parallax range and forces the layer transform off. */
    animation: none;
  }
}
</style>
