# CTA band

Closing call-to-action with headline, subtext, and two buttons on a token gradient background.

- **Category:** Marketing
- **Components:** DzHeading, DzText, DzButton
- **Preview:** /blocks/cta-band

```vue
<script setup lang="ts">
import { DzButton, DzHeading, DzText } from '@dzup-ui/core'

/**
 * CTA band — a closing call-to-action section: headline, subtext, and two
 * buttons on a brand gradient background.
 *
 * Self-contained: no props, no external data. Composed only from free
 * @dzup-ui/core components and `--dz-*` tokens (no landing-only `--lp-*` props),
 * so it drops into any app already themed, accessible, and light/dark-ready
 * (docs/blocks.md §3.6).
 *
 * Background: a gradient built entirely with `color-mix(in oklch, ...)` over
 * `--dz-primary`, matching the technique used in HeroCentered — no raw color
 * literals escape this file.
 *
 * Heading level: rendered with semantic level 4 so it nests cleanly under the
 * BlockPreview's H3 title without breaking the /blocks document outline, while
 * `size="2xl"` keeps the visual scale (DzHeading decouples level from size).
 */
</script>

<template>
  <section class="cta-band" aria-labelledby="cta-band-title">
    <div class="cb-bg" aria-hidden="true" />

    <div class="cb-inner">
      <DzHeading id="cta-band-title" :level="4" size="2xl" weight="bold" align="center" class="cb-title">
        Ready to see your data come alive?
      </DzHeading>

      <DzText size="lg" align="center" class="cb-sub">
        Join thousands of teams who replaced scattered spreadsheets with a single
        source of truth — live, beautiful, and always up to date.
      </DzText>

      <div class="cb-actions">
        <DzButton variant="solid" tone="primary" size="lg">
          Get started free
        </DzButton>
        <DzButton variant="outline" tone="neutral" size="lg">
          Talk to sales
        </DzButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cta-band {
  position: relative;
  overflow: hidden;
  padding: clamp(3rem, 8vw, 5.5rem) var(--dz-space-6, 1.5rem);
}

/* Token gradient background — two overlapping radial washes of --dz-primary,
   mixing to a brand-tinted surface that re-themes with the global toggle. */
.cb-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(ellipse 80% 100% at 50% -10%, color-mix(in oklch, var(--dz-primary, #6366f1) 18%, transparent), transparent 65%),
    radial-gradient(ellipse 60% 70% at 10% 110%, color-mix(in oklch, var(--dz-primary, #6366f1) 10%, transparent), transparent 65%),
    radial-gradient(ellipse 60% 70% at 90% 110%, color-mix(in oklch, var(--dz-primary, #6366f1) 10%, transparent), transparent 65%),
    var(--dz-background, #fff);
}

.cb-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dz-space-4, 1rem);
  max-width: 42rem;
  margin: 0 auto;
  text-align: center;
}

.cb-title {
  margin: 0;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.cb-sub {
  margin: 0;
  line-height: 1.6;
  /* Slightly more restrained opacity to let the gradient breathe behind text */
  opacity: 0.85;
}

.cb-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--dz-space-3, 0.75rem);
  margin-top: var(--dz-space-2, 0.5rem);
}

@media (max-width: 480px) {
  .cb-actions {
    width: 100%;
    flex-direction: column;
  }
}
</style>
```
