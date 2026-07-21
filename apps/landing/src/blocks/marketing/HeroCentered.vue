<script setup lang="ts">
import { DzBadge, DzButton, DzHeading, DzText } from '@dzup-ui/core'

/**
 * Centered hero — eyebrow chip, headline, subhead and two CTAs, centered.
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
 */
</script>

<template>
  <section class="hero-centered" aria-labelledby="hero-centered-title">
    <div class="hc-bg" aria-hidden="true" />

    <div class="hc-inner">
      <DzBadge variant="subtle" tone="primary" size="sm">
        New · v2.0
      </DzBadge>

      <DzHeading id="hero-centered-title" :level="4" size="3xl" weight="bold" align="center" class="hc-title">
        Build your product UI in minutes, not weeks
      </DzHeading>

      <DzText size="lg" tone="muted" align="center" class="hc-lede">
        A themed, accessible component library with copy-paste blocks. Ship a polished,
        light/dark-ready interface from day one — no design system to build first.
      </DzText>

      <div class="hc-actions">
        <DzButton variant="solid" tone="primary" size="lg">
          Get started
        </DzButton>
        <DzButton variant="outline" tone="neutral" size="lg">
          View components
        </DzButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-centered {
  position: relative;
  overflow: hidden;
  padding: clamp(2.5rem, 8vw, 5rem) var(--dz-space-6, 1.5rem);
  background: var(--dz-background, #fff);
}

/* Token-only background wash — a soft brand glow from the design tokens, so it
   re-themes with the global toggle and carries no raw color literals. */
.hc-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(ellipse 60% 60% at 50% 0%, color-mix(in oklch, var(--dz-primary, #6366f1) 12%, transparent), transparent 70%),
    radial-gradient(ellipse 55% 55% at 85% 110%, color-mix(in oklch, var(--dz-primary, #6366f1) 7%, transparent), transparent 70%);
}

.hc-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dz-space-4, 1rem);
  max-width: 44rem;
  margin: 0 auto;
  text-align: center;
}

.hc-title {
  margin: 0;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.hc-lede {
  margin: 0;
  line-height: 1.6;
}

.hc-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--dz-space-3, 0.75rem);
  margin-top: var(--dz-space-2, 0.5rem);
}

@media (max-width: 560px) {
  .hc-actions {
    width: 100%;
    flex-direction: column;
  }
}
</style>
