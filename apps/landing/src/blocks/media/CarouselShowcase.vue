<script setup lang="ts">
import {
  DzAspectRatio,
  DzBadge,
  DzCarousel,
  DzCarouselDots,
  DzCarouselNext,
  DzCarouselPrevious,
  DzCarouselSlide,
  DzHeading,
  DzImage,
  DzText,
} from '@dzup-ui/core'
import { ref } from 'vue'

/**
 * Media carousel — a featured image slider with captions, autoplay and controls.
 *
 * The compound DzCarousel owns the active-slide state (v-model) and provides
 * context (ADR-08) to its children: each DzCarouselSlide frames a DzImage with
 * DzAspectRatio, while DzCarouselPrevious / DzCarouselNext and DzCarouselDots
 * drive navigation. Autoplay pauses on hover and on focus-within (the component
 * stops the timer on pointer-enter); loop wraps both ends.
 *
 * Only free @dzup-ui/core components and `--dz-*` tokens (docs/blocks.md §3.6).
 */

interface Slide {
  src: string
  alt: string
  kicker: string
  title: string
  copy: string
}

const slides: Slide[] = [
  {
    src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&q=80',
    alt: 'Analytics dashboard on a laptop screen',
    kicker: 'Insights',
    title: 'Every metric, one workspace',
    copy: 'Connect a source once and watch the numbers land — no SQL required.',
  },
  {
    src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1400&q=80',
    alt: 'Colourful business charts and graphs',
    kicker: 'Reporting',
    title: 'Boards that tell the story',
    copy: 'Drag tiles into place and share a live link your whole team can read.',
  },
  {
    src: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1400&q=80',
    alt: 'Code on a monitor in a dark room',
    kicker: 'Developers',
    title: 'A typed API you will enjoy',
    copy: 'Composable primitives, design tokens, and zero runtime surprises.',
  },
]

/** Active slide index — bound to the carousel via v-model (ADR-16). */
const active = ref(0)
</script>

<template>
  <section class="cshow" aria-labelledby="media-carousel-title">
    <header class="cs-head">
      <DzBadge variant="subtle" tone="primary" size="sm">
        Showcase
      </DzBadge>
      <DzHeading id="media-carousel-title" :level="4" size="xl" weight="semibold" class="cs-title">
        Product highlights
      </DzHeading>
      <DzText size="sm" tone="muted" class="cs-lede">
        Autoplaying, looping carousel — hover to pause, or use the arrows and dots.
      </DzText>
    </header>

    <DzCarousel
      v-model="active"
      autoplay
      loop
      :interval="4500"
      size="lg"
      aria-label="Product highlights carousel"
      class="cs-carousel"
    >
      <DzCarouselSlide v-for="slide in slides" :key="slide.src">
        <figure class="cs-figure">
          <DzAspectRatio :ratio="16 / 9">
            <DzImage :src="slide.src" :alt="slide.alt" fit="cover" lazy class="cs-img" />
          </DzAspectRatio>

          <figcaption class="cs-caption">
            <span class="cs-kicker">{{ slide.kicker }}</span>
            <DzHeading :level="5" size="lg" weight="semibold" class="cs-caption-title">
              {{ slide.title }}
            </DzHeading>
            <DzText size="sm" class="cs-caption-copy">
              {{ slide.copy }}
            </DzText>
          </figcaption>
        </figure>
      </DzCarouselSlide>

      <DzCarouselPrevious />
      <DzCarouselNext />
      <DzCarouselDots />
    </DzCarousel>
  </section>
</template>

<style scoped>
.cshow {
  padding: clamp(1.25rem, 4vw, 2rem);
  background: var(--dz-background, #fff);
}

.cs-head {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--dz-space-2, 0.5rem);
  margin-bottom: var(--dz-space-5, 1.25rem);
}

.cs-title {
  margin: 0;
  letter-spacing: -0.01em;
}

.cs-lede {
  margin: 0;
  line-height: 1.55;
}

.cs-carousel {
  border-radius: var(--dz-radius-xl, 0.875rem);
}

/* The slide frame — image plus a gradient caption overlay. */
.cs-figure {
  position: relative;
  margin: 0;
  border-radius: var(--dz-radius-xl, 0.875rem);
  overflow: hidden;
  border: 1px solid color-mix(in oklch, var(--dz-border, #e2e8f0) 60%, transparent);
}

.cs-img {
  width: 100%;
  height: 100%;
  display: block;
}

.cs-caption {
  position: absolute;
  inset: auto 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: clamp(1rem, 4vw, 1.75rem);
  color: #fff;
  background: linear-gradient(
    to top,
    color-mix(in oklch, var(--dz-shadow, #000) 78%, transparent),
    color-mix(in oklch, var(--dz-shadow, #000) 30%, transparent) 55%,
    transparent
  );
}

.cs-kicker {
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: color-mix(in oklch, var(--dz-primary, #818cf8) 35%, #fff);
}

/* DzHeading/DzText render tokenized colors; force legibility over the photo. */
.cs-caption-title,
.cs-caption-copy {
  margin: 0;
  color: #fff;
}

.cs-caption-copy {
  max-width: 46ch;
  line-height: 1.5;
  color: color-mix(in oklch, #fff 86%, transparent);
}
</style>
