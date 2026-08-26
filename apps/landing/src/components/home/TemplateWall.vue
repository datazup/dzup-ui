<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
import { useTheme } from '../../composables/useTheme.ts'
import { DzMarquee } from '../../motion/index.ts'
import { TEMPLATES } from '../../templates/registry.ts'
import Section from '../Section.vue'
import { wallRows } from './templateWall.ts'

/**
 * TemplateWall — a tilted plane of real screens
 * (docs/landing-v2.md TASK-LV2-07). The home page's first imagery, and the
 * honesty bar decides what it can be: the committed, theme-aware template
 * thumbnails ARE the product, so a "wall of apps" here is the gesture
 * stock-photo sites fake, made truthfully.
 *
 * Two counter-scrolling `DzMarquee` rows on a `.dz-depth-stage` perspective
 * plane (rotateX). Every card is a real link to its `/templates/:slug` page;
 * hovering pauses the row (DzMarquee's contract) and counter-rotates the card
 * flat. Thumbnails follow the registry convention TemplatesPage documents —
 * light + dark variants are build-guaranteed by `check-template-previews.ts`,
 * and the theme choice runs through the same `useTheme().resolved` the
 * gallery uses (NOT a `:global(html[data-theme])` scoped-CSS reach — see the
 * dark-mode compositing post-mortem).
 *
 * Perf: lazy section below the fold; every `<img>` is `loading="lazy"
 * decoding="async"` with explicit dimensions, so the wall can never shift
 * layout. Reduced motion: DzMarquee renders calm static rows, the plane sits
 * flat (transform zeroed in the central reduce block via `.dz-anim-` class
 * conventions — here with an explicit media query).
 */

const [rowA, rowB] = wallRows()
const total = TEMPLATES.length

const { resolved } = useTheme()

/** Card box in px — matches the thumbnails' 3:2-ish aspect; object-fit covers. */
const CARD_W = 260
const CARD_H = 170
</script>

<template>
  <Section
    eyebrow="Templates"
    title="Real screens, ready to ship"
    :lede="`${total} full-page starters — dashboards, admin panels, auth flows — every screen below is a live template you can open, theme and copy.`"
    surface
    bordered
    heading-id="template-wall-title"
  >
    <div class="wall-stage dz-depth-stage">
      <div class="wall-plane">
        <DzMarquee class="wall-row">
          <router-link
            v-for="card in rowA"
            :key="card.slug"
            :to="`/templates/${card.slug}`"
            class="wall-card lp-card"
          >
            <img
              :src="resolved === 'dark' ? card.thumbDark : card.thumb"
              alt=""
              :width="CARD_W"
              :height="CARD_H"
              loading="lazy"
              decoding="async"
            >
            <span class="wall-card-name">{{ card.name }}</span>
          </router-link>
        </DzMarquee>

        <DzMarquee class="wall-row wall-row--reverse">
          <router-link
            v-for="card in rowB"
            :key="card.slug"
            :to="`/templates/${card.slug}`"
            class="wall-card lp-card"
          >
            <img
              :src="resolved === 'dark' ? card.thumbDark : card.thumb"
              alt=""
              :width="CARD_W"
              :height="CARD_H"
              loading="lazy"
              decoding="async"
            >
            <span class="wall-card-name">{{ card.name }}</span>
          </router-link>
        </DzMarquee>
      </div>
    </div>

    <div class="wall-actions">
      <router-link class="wall-all" to="/templates">
        Browse all {{ total }} templates
        <ArrowUpRight :size="16" aria-hidden="true" />
      </router-link>
    </div>
  </Section>
</template>

<style scoped>
.wall-stage {
  /* Clip the marquee overflow, not the 3D pop of hovered cards. */
  overflow: hidden;
  padding: 12px 0 20px;
}

.wall-plane {
  display: flex;
  flex-direction: column;
  gap: 20px;
  transform: rotateX(12deg);
  transform-style: preserve-3d;
}

/* Long image rows scroll slower than a badge strip. */
.wall-row {
  --dz-anim-marquee-duration: 64s;
  transform-style: preserve-3d;
}

.wall-row--reverse :deep(.dz-marquee__track) {
  animation-direction: reverse;
}

.wall-card {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
  transition: transform var(--dz-duration-normal, 250ms) var(--dz-ease-out, cubic-bezier(0.16, 1, 0.3, 1));
}

.wall-card img {
  display: block;
  width: 260px;
  height: 170px;
  object-fit: cover;
  object-position: top;
}

/* Counter-rotate flat + lift on hover/focus — the card rises off the plane. */
.wall-card:hover,
.wall-card:focus-visible {
  transform: rotateX(-12deg) translateY(-6px) scale(1.04);
  z-index: 1;
}

.wall-card-name {
  padding: 8px 12px;
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  color: var(--dz-foreground, #1b1d1f);
  border-top: 1px solid var(--lp-hairline);
  background: var(--dz-surface, #ffffff);
}

.wall-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.wall-all {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  color: var(--dz-primary-muted-foreground, #0039a3);
  text-decoration: none;
}

.wall-all:hover {
  text-decoration: underline;
}

@media (prefers-reduced-motion: reduce) {
  .wall-plane {
    transform: none;
  }

  .wall-card,
  .wall-card:hover,
  .wall-card:focus-visible {
    transition: none;
    transform: none;
  }
}
</style>
