<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { categoryAccentStyle } from '../../gallery/catalog.ts'
import { DzGradientText, DzOrbit, DzParallax, useReducedMotion } from '../../motion/index.ts'

/**
 * AnimationsHeroField — the /animations hero's depth decoration
 * (docs/animations-v2.md TASK-AV2-02).
 *
 * The gallery twin of TemplatesHeroField, with the twist the page demands:
 * where /templates floats real screenshots (its product is imagery), THIS
 * page's product is motion itself — so the field floats five tiny live
 * "mini-performances" built from the gallery's own primitives and utilities:
 * an orbit ring, an animated gradient pill, a meteor patch, a ping dot and a
 * shimmer skeleton. Zero image bytes — everything is DOM + tokens, each tile
 * tinted with a real category accent so the field previews the taxonomy's
 * spectrum before the visitor ever reaches the chips.
 *
 * Contract (inherited from DzParallax + the landing-v2 hero discipline):
 * - Decoration only: DzParallax's host renders aria-hidden; `inert` is added so
 *   the subtree can never surface to AT or take interaction.
 * - Post-paint: renders nothing until `onMounted` flips `ready`, so the H1 and
 *   lede paint first and the field never joins the critical path. Tiles are
 *   absolutely positioned — mounting shifts no layout.
 * - Reduced motion (OS or the page toggle): DzParallax disables itself, the
 *   float keyframes are cut, DzOrbit/DzGradientText freeze on their own, and
 *   the CSS utilities get their `--reduced` modifiers via the bound class —
 *   the field degrades to a static composition.
 */

/**
 * Tile placement: `--depth` (parallax travel), position, scale and float delay
 * are design; offsets are logical (inset-inline-*) so RTL mirrors for free.
 * Accents are real category hues from the catalog's own accent map.
 */
const TILE_STYLES = [
  { 'top': '4%', 'insetInlineStart': '2%', '--mp-scale': '1', '--mp-delay': '0s', '--depth': '0.55' },
  { 'top': '52%', 'insetInlineStart': '0%', '--mp-scale': '0.85', '--mp-delay': '-4.2s', '--depth': '0.95' },
  { 'top': '26%', 'insetInlineStart': '13%', '--mp-scale': '0.7', '--mp-delay': '-8.1s', '--depth': '0.35' },
  { 'top': '8%', 'insetInlineEnd': '2%', '--mp-scale': '0.95', '--mp-delay': '-2.3s', '--depth': '0.75' },
  { 'top': '55%', 'insetInlineEnd': '1%', '--mp-scale': '0.8', '--mp-delay': '-6.4s', '--depth': '0.45' },
] as const

/** A tile's accent custom props from its category's real gallery accent. */
function accent(category: string): Record<string, string> {
  return categoryAccentStyle(category)
}

const reduced = useReducedMotion()

/** Post-paint gate: the field mounts only after the hero copy has painted. */
const ready = ref(false)
onMounted(() => {
  ready.value = true
})

/**
 * Meteor streak placement — bounded by this markup (the tokens.css contract:
 * the consumer caps concurrency by rendering N streaks and placing each).
 */
const METEORS = [
  { '--dz-meteor-top': '12%', '--dz-meteor-left': '18%', '--dz-meteor-delay': '0s', '--dz-meteor-duration': '3.6s' },
  { '--dz-meteor-top': '38%', '--dz-meteor-left': '55%', '--dz-meteor-delay': '-1.4s', '--dz-meteor-duration': '4.4s' },
  { '--dz-meteor-top': '64%', '--dz-meteor-left': '30%', '--dz-meteor-delay': '-2.6s', '--dz-meteor-duration': '3.9s' },
] as const
</script>

<template>
  <DzParallax v-if="ready" source="viewport" :disabled="reduced" inert class="av2-hero-field">
    <!-- Connections: an orbit ring of category-coloured dots. -->
    <span
      class="dz-parallax-layer av2-perf av2-perf--orbit"
      :style="{ ...TILE_STYLES[0], ...accent('connections') }"
    >
      <DzOrbit :radius="26" speed="18s">
        <i class="av2-orbit-dot" />
        <i class="av2-orbit-dot av2-orbit-dot--2" />
        <i class="av2-orbit-dot av2-orbit-dot--3" />
      </DzOrbit>
    </span>

    <!-- Text: the animated gradient sweep, on its own tiny marquee card. -->
    <span
      class="dz-parallax-layer av2-perf av2-perf--pill"
      :style="{ ...TILE_STYLES[1], ...accent('text') }"
    >
      <DzGradientText class="av2-pill-text">
        motion
      </DzGradientText>
    </span>

    <!-- Backgrounds: a meteor shower in a jar. -->
    <span
      class="dz-parallax-layer av2-perf av2-perf--meteors"
      :style="{ ...TILE_STYLES[2], ...accent('backgrounds') }"
    >
      <span class="dz-meteors" :class="{ 'dz-meteors--reduced': reduced }">
        <i
          v-for="(m, i) in METEORS"
          :key="i"
          class="dz-meteors__streak"
          :style="m"
        />
      </span>
    </span>

    <!-- Attention: the classic ping dot. -->
    <span
      class="dz-parallax-layer av2-perf av2-perf--ping"
      :style="{ ...TILE_STYLES[3], ...accent('attention') }"
    >
      <span class="av2-ping dz-ping" :class="{ 'dz-ping--reduced': reduced }">
        <i class="dz-ping__ring" />
        <i class="dz-ping__dot av2-ping-dot" />
      </span>
      <span class="av2-ping-label">live</span>
    </span>

    <!-- Lists: a shimmering skeleton card. -->
    <span
      class="dz-parallax-layer av2-perf av2-perf--shimmer"
      :style="{ ...TILE_STYLES[4], ...accent('lists') }"
    >
      <span class="av2-skeleton dz-shimmer" :class="{ 'dz-shimmer--reduced': reduced }">
        <i class="av2-skeleton-bar" style="width: 82%" />
        <i class="av2-skeleton-bar" style="width: 58%" />
        <i class="av2-skeleton-bar" style="width: 70%" />
      </span>
    </span>
  </DzParallax>
</template>

<style scoped>
.av2-hero-field {
  position: absolute;
  inset-block-start: 0;
  inset-inline: 0;
  /* The hero band only — the field must never reach the toolbar or bento. */
  height: 440px;
  z-index: 0;
  pointer-events: none;
  /* Edge tiles sit at small logical offsets for depth; clip them rather than
     ever spawning a horizontal scrollbar. */
  overflow: clip;
}

/* One mini-performance tile: a small glass card in its category's accent. Size
   via width, not transform-scale — the central reduced-motion block forces
   `transform: none !important` on parallax layers, which would strip a scale;
   width survives it. */
.av2-perf {
  position: absolute;
  display: grid;
  place-items: center;
  gap: 6px;
  width: calc(148px * var(--mp-scale, 1));
  aspect-ratio: 4 / 3;
  border: 1px solid color-mix(in oklch, var(--accent, var(--dz-primary, #0766ee)) 32%, var(--lp-hairline, #d5d7d9));
  border-radius: var(--dz-radius-lg, 0.625rem);
  background:
    radial-gradient(
      120% 100% at 80% 0%,
      color-mix(in oklch, var(--accent-2, var(--dz-primary, #0766ee)) 14%, transparent),
      transparent 60%
    ),
    color-mix(in oklch, var(--dz-surface, #ffffff) 72%, transparent);
  box-shadow: var(--dz-shadow-md, 0 6px 16px rgb(0 0 0 / 0.08));
  opacity: 0.6;
  overflow: hidden;
  animation: av2-perf-float 14s ease-in-out infinite;
  animation-delay: var(--mp-delay, 0s);
}

/* Orbit dots — token-coloured, kept upright by DzOrbit itself. */
.av2-orbit-dot {
  display: block;
  width: 10px;
  height: 10px;
  border-radius: var(--dz-radius-full, 9999px);
  background: var(--accent, var(--dz-primary, #0766ee));
}

.av2-orbit-dot--2 {
  background: var(--accent-2, var(--dz-primary, #0766ee));
  width: 8px;
  height: 8px;
}

.av2-orbit-dot--3 {
  background: var(--accent-soft, var(--dz-primary, #0766ee));
  width: 7px;
  height: 7px;
}

.av2-pill-text {
  font-size: var(--dz-text-xl, 1.25rem);
  font-weight: 700;
  letter-spacing: -0.02em;
}

/* The meteors utility is absolute-inset; give it the whole tile. */
.av2-perf--meteors .dz-meteors {
  position: absolute;
  inset: 0;
}

.av2-ping {
  width: 12px;
  height: 12px;
  border-radius: var(--dz-radius-full, 9999px);
  color: var(--accent, var(--dz-primary, #0766ee));
}

.av2-ping-dot {
  display: block;
  width: 12px;
  height: 12px;
  border-radius: var(--dz-radius-full, 9999px);
  background: currentColor;
}

.av2-ping-label {
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 600;
  color: var(--dz-muted-foreground, #585b60);
}

.av2-skeleton {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 7px;
  width: 72%;
  overflow: hidden;
  border-radius: var(--dz-radius-md, 0.5rem);
}

.av2-skeleton-bar {
  display: block;
  height: 9px;
  border-radius: var(--dz-radius-full, 9999px);
  background: color-mix(in oklch, var(--accent, var(--dz-primary, #0766ee)) 18%, var(--dz-muted, #d3d4d7));
}

/* The parallax translate and the float both want `transform`, so the float's
   keyframes re-state the `.dz-parallax-layer` calc and add a gentle vertical
   drift on top — the two never fight over the property, and the pointer keeps
   steering mid-float because the custom properties re-resolve every frame. */
@keyframes av2-perf-float {
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

/* The field is margin decoration: step down to the two widest-margin tiles as
   the margins narrow, then leave entirely before the copy could collide. */
@media (max-width: 1360px) {
  .av2-perf--pill,
  .av2-perf--meteors,
  .av2-perf--shimmer {
    display: none;
  }
}

@media (max-width: 1100px) {
  .av2-hero-field {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .av2-perf {
    /* Static composition: no drift; the central tokens.css block already zeroes
       the parallax range and forces the layer transform off. */
    animation: none;
  }
}
</style>
