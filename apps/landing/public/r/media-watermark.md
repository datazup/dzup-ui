# Watermarked preview

A confidential asset draped in a tiled, rotated DzWatermark over a framed DzImage — the aria-hidden, pointer-transparent overlay stamps ownership without blocking interaction.

- **Category:** Media
- **Components:** DzWatermark, DzImage, DzAspectRatio, DzBadge, DzHeading, DzText
- **Preview:** /blocks/media-watermark

```vue
<script setup lang="ts">
import { DzAspectRatio, DzBadge, DzHeading, DzImage, DzText, DzWatermark } from '@dzup-ui/core'

/**
 * Protected preview — a confidential asset under a tiled watermark.
 *
 * DzWatermark overlays a repeating, rotated mark across its slotted content. The
 * overlay is `aria-hidden` and `pointer-events: none`, so it never blocks
 * interaction or is read aloud; its subtlety comes from `--dz-watermark-opacity`
 * while the mark draws in `--dz-watermark-color`. A string[] `content` stacks
 * one line per entry. Pair with `observe` on truly sensitive surfaces.
 *
 * Only free @dzup-ui/core components and `--dz-*` tokens (docs/blocks.md §3.6).
 */

const MARK = ['DZUP UI', 'CONFIDENTIAL']
</script>

<template>
  <section class="pp" aria-labelledby="media-watermark-title">
    <header class="pp-head">
      <div class="pp-head-text">
        <DzBadge variant="subtle" tone="warning" size="sm">Confidential</DzBadge>
        <DzHeading id="media-watermark-title" :level="4" size="xl" weight="semibold" class="pp-title">
          Shared preview
        </DzHeading>
        <DzText size="sm" tone="muted" class="pp-lede">
          Marked for the recipient — every export carries an ownership stamp.
        </DzText>
      </div>
      <DzBadge variant="outline" tone="neutral" size="sm">Read-only</DzBadge>
    </header>

    <!-- The asset, draped in a tiled, rotated watermark. -->
    <DzWatermark :content="MARK" :rotate="-22" :gap="[120, 110]" :font-size="15" class="pp-mark">
      <figure class="pp-figure">
        <DzAspectRatio :ratio="16 / 9">
          <DzImage
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&q=80"
            alt="Unreleased analytics dashboard design"
            fit="cover"
            lazy
            class="pp-img"
          />
        </DzAspectRatio>
      </figure>
    </DzWatermark>

    <footer class="pp-foot">
      <svg
        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pp-foot-icon" aria-hidden="true"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <DzText size="xs" tone="muted" as="p" class="pp-foot-note">
        Distribution is logged. Do not screenshot or forward outside the review group.
      </DzText>
    </footer>
  </section>
</template>

<style scoped>
.pp {
  padding: clamp(1.25rem, 4vw, 2rem);
  background: var(--dz-background, #fff);
}

.pp-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--dz-space-4, 1rem);
  flex-wrap: wrap;
  margin-bottom: var(--dz-space-5, 1.25rem);
}

.pp-head-text {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-2, 0.5rem);
  min-width: 0;
}

.pp-title {
  margin: 0;
  letter-spacing: -0.01em;
}

.pp-lede {
  margin: 0;
  line-height: 1.55;
}

.pp-mark {
  border-radius: var(--dz-radius-xl, 0.875rem);
  overflow: hidden;
}

.pp-figure {
  margin: 0;
  border-radius: var(--dz-radius-xl, 0.875rem);
  overflow: hidden;
  border: 1px solid color-mix(in oklch, var(--dz-border, #e2e8f0) 60%, transparent);
  box-shadow: 0 4px 12px -6px color-mix(in oklch, var(--dz-shadow, #000) 18%, transparent);
}

.pp-img {
  width: 100%;
  height: 100%;
  display: block;
}

.pp-foot {
  display: flex;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
  margin-top: var(--dz-space-3, 0.75rem);
  color: var(--dz-muted-foreground, #64748b);
}

.pp-foot-icon {
  width: 0.9rem;
  height: 0.9rem;
  flex-shrink: 0;
}

.pp-foot-note {
  margin: 0;
  line-height: 1.5;
}
</style>
```
