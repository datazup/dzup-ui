# Split hero with media

Copy and two CTAs on the left, a framed product image on the right; stacks to one column on narrow viewports.

- **Category:** Marketing
- **Components:** DzBadge, DzHeading, DzText, DzButton, DzImage, DzAspectRatio
- **Preview:** /blocks/hero-split

```vue
<script setup lang="ts">
import { DzAspectRatio, DzBadge, DzButton, DzHeading, DzImage, DzText } from '@dzup-ui/core'

/**
 * Split hero — copy and CTAs on the left, a framed product image on the right.
 *
 * Self-contained: no props, no external data. Composed only from free
 * @dzup-ui/core components and `--dz-*` tokens (no landing-only `--lp-*` props),
 * so it drops into any app already themed, accessible, and light/dark-ready
 * (docs/blocks.md §3.6).
 *
 * Heading level: rendered with semantic level 4 so it nests cleanly under the
 * BlockPreview's H3 title without breaking the /blocks document outline, while
 * `size="3xl"` keeps the visual hero scale (DzHeading decouples level from size).
 * When you paste this into your own page, raise `:level` to the level that fits
 * your outline (a standalone hero is usually the page's H1).
 *
 * Responsive: single-column on narrow viewports (≤ 768 px); two-column above.
 */
</script>

<template>
  <section class="hero-split" aria-labelledby="hero-split-title">
    <div class="hs-bg" aria-hidden="true" />

    <div class="hs-inner">
      <!-- Left: copy column -->
      <div class="hs-copy">
        <DzBadge variant="subtle" tone="primary" size="sm">Product · v2.0</DzBadge>

        <DzHeading id="hero-split-title" :level="4" size="3xl" weight="bold" class="hs-title">
          Your data, beautifully organised
        </DzHeading>

        <DzText size="lg" tone="muted" class="hs-lede">
          Connect your sources once and explore every metric in a single,
          light/dark-ready workspace — no SQL required.
        </DzText>

        <div class="hs-actions">
          <DzButton variant="solid" tone="primary" size="lg">Start for free</DzButton>
          <DzButton variant="outline" tone="neutral" size="lg">See a demo</DzButton>
        </div>
      </div>

      <!-- Right: framed product image -->
      <div class="hs-media" aria-hidden="true">
        <div class="hs-frame">
          <DzAspectRatio :ratio="16 / 10">
            <DzImage
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80"
              alt=""
              fit="cover"
              lazy
              class="hs-img"
            />
          </DzAspectRatio>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-split {
  position: relative;
  overflow: hidden;
  padding: clamp(2.5rem, 6vw, 4.5rem) var(--dz-space-6, 1.5rem);
  background: var(--dz-background, #fff);
}

/* Soft brand glow — token colours only, re-themes automatically. */
.hs-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(ellipse 70% 80% at -10% 50%, color-mix(in oklch, var(--dz-primary, #6366f1) 10%, transparent), transparent 65%),
    radial-gradient(ellipse 50% 50% at 110% 20%, color-mix(in oklch, var(--dz-primary, #6366f1) 6%, transparent), transparent 65%);
}

.hs-inner {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: var(--dz-space-10, 2.5rem);
  max-width: 72rem;
  margin: 0 auto;
}

/* Copy column */
.hs-copy {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-4, 1rem);
}

.hs-title {
  margin: 0;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.hs-lede {
  margin: 0;
  line-height: 1.6;
}

.hs-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--dz-space-3, 0.75rem);
  margin-top: var(--dz-space-2, 0.5rem);
}

/* Media column */
.hs-media {
  min-width: 0;
}

/* Decorative frame treatment — border + shadow from tokens. */
.hs-frame {
  border-radius: var(--dz-radius-xl, 0.875rem);
  overflow: hidden;
  border: 1px solid color-mix(in oklch, var(--dz-border, #e2e8f0) 60%, transparent);
  box-shadow:
    0 4px 6px -1px color-mix(in oklch, var(--dz-shadow, #000) 8%, transparent),
    0 2px 4px -2px color-mix(in oklch, var(--dz-shadow, #000) 6%, transparent);
}

.hs-img {
  width: 100%;
  height: 100%;
  display: block;
}

/* Stack to single column on narrow viewports */
@media (max-width: 768px) {
  .hs-inner {
    grid-template-columns: 1fr;
  }

  .hs-media {
    order: -1;
  }

  .hs-actions {
    flex-direction: column;
  }
}
</style>
```
