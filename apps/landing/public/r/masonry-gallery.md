# Masonry gallery

A Pinterest-style cascading board built on DzMasonry — variable-height DzCards, some leading with a DzAspectRatio media tile, packed into balanced responsive columns (3 → 2 → 1) with no row gaps.

- **Category:** Layout
- **Components:** DzMasonry, DzAspectRatio, DzCard, DzAvatar, DzBadge, DzTag, DzHeading, DzText
- **Preview:** /blocks/masonry-gallery

```vue
<script setup lang="ts">
import type { CanonicalTone } from '@dzup-ui/contracts'
/**
 * Masonry gallery — a Pinterest-style cascading board built on DzMasonry.
 *
 * DzMasonry packs variable-height items into balanced, responsive columns
 * (`columns` takes a breakpoint object); each item is a DzCard, some leading
 * with a DzAspectRatio media tile. This is the Layout family's answer to
 * "uneven content that should still tile cleanly" — no row gaps, no manual
 * column math.
 *
 * Self-contained: local static data, no props, no router. Composed only from
 * free @dzup-ui/core components and `--dz-*` tokens (docs/blocks.md §3.6).
 * Heading: card titles use level 4 within BlockPreview's H3 shell.
 *
 * Responsive: 3 columns → 2 → 1 via the `columns` breakpoint object.
 */
import {
  DzAspectRatio,
  DzAvatar,
  DzBadge,
  DzCard,
  DzHeading,
  DzMasonry,
  DzTag,
  DzText,
} from '@dzup-ui/core'

interface Item {
  id: number
  title: string
  body: string
  author: string
  initials: string
  tag: { label: string, tone: CanonicalTone }
  media?: { ratio: number, hue: number }
}

const items: Item[] = [
  {
    id: 1,
    title: 'Designing token-first themes',
    body: 'How a single set of semantic variables keeps light and dark in perfect sync across every surface.',
    author: 'Ava Restić',
    initials: 'AR',
    tag: { label: 'Theming', tone: 'primary' },
    media: { ratio: 16 / 10, hue: 250 },
  },
  {
    id: 2,
    title: 'A11y in layout primitives',
    body: 'Reading order, focus, and landmarks survive even a fully fluid grid.',
    author: 'Marcus Chen',
    initials: 'MC',
    tag: { label: 'Accessibility', tone: 'success' },
  },
  {
    id: 3,
    title: 'The bento renaissance',
    body: 'Why spanning grids feel alive — and the three rules that keep them legible at every width.',
    author: 'Priya Nair',
    initials: 'PN',
    tag: { label: 'Patterns', tone: 'info' },
    media: { ratio: 4 / 3, hue: 190 },
  },
  {
    id: 4,
    title: 'Spacing as a system',
    body: 'One scale, applied everywhere, removes a thousand tiny decisions.',
    author: 'Luca Ferraro',
    initials: 'LF',
    tag: { label: 'Tokens', tone: 'warning' },
  },
  {
    id: 5,
    title: 'Resizable, not rigid',
    body: 'Letting users own the split between panes — and persisting it — is a quiet superpower.',
    author: 'Sofia Marin',
    initials: 'SM',
    tag: { label: 'UX', tone: 'primary' },
    media: { ratio: 1, hue: 320 },
  },
  {
    id: 6,
    title: 'Sticky, done right',
    body: 'An affixed aside that knows its boundaries beats position: sticky guesswork.',
    author: 'Noah Weber',
    initials: 'NW',
    tag: { label: 'Scrolling', tone: 'info' },
  },
]
</script>

<template>
  <section class="mg" aria-labelledby="mg-title">
    <header class="mg-head">
      <DzHeading id="mg-title" :level="4" size="lg" weight="bold">
        Inspiration board
      </DzHeading>
      <DzText size="sm" tone="muted">
        Balanced columns from DzMasonry
      </DzText>
    </header>

    <DzMasonry :columns="{ xs: 1, sm: 2, lg: 3 }" gap="md">
      <DzCard
        v-for="item in items"
        :key="item.id"
        variant="outlined"
        padding="none"
        hoverable
        class="mg-card"
      >
        <DzAspectRatio v-if="item.media" :ratio="item.media.ratio" class="mg-media">
          <div
            class="mg-media-fill"
            :style="{ background: `linear-gradient(140deg, oklch(0.72 0.16 ${item.media.hue}), oklch(0.6 0.18 ${item.media.hue + 40}))` }"
            aria-hidden="true"
          />
        </DzAspectRatio>

        <div class="mg-body">
          <DzTag variant="subtle" :tone="item.tag.tone" size="sm" class="mg-tag">
            {{ item.tag.label }}
          </DzTag>
          <DzHeading :level="5" size="sm" weight="semibold" class="mg-card-title">
            {{ item.title }}
          </DzHeading>
          <DzText size="sm" tone="muted" class="mg-card-body">
            {{ item.body }}
          </DzText>

          <div class="mg-foot">
            <DzAvatar :fallback="item.initials" :alt="item.author" size="xs" />
            <DzText size="xs" tone="muted" as="span">
              {{ item.author }}
            </DzText>
            <DzBadge variant="subtle" tone="neutral" size="sm" class="mg-read">
              4 min
            </DzBadge>
          </div>
        </div>
      </DzCard>
    </DzMasonry>
  </section>
</template>

<style scoped>
.mg {
  background: var(--dz-background, #fff);
  max-width: 60rem;
  margin: 0 auto;
  padding: var(--dz-space-2, 0.5rem);
}

.mg-head {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-1, 0.25rem);
  margin-bottom: var(--dz-space-5, 1.25rem);
}

.mg-card {
  overflow: hidden;
}

.mg-media {
  width: 100%;
}

.mg-media-fill {
  width: 100%;
  height: 100%;
}

.mg-body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--dz-space-2, 0.5rem);
  padding: var(--dz-space-4, 1rem);
}

.mg-tag {
  margin-bottom: var(--dz-space-1, 0.25rem);
}

.mg-card-title,
.mg-card-body {
  margin: 0;
}

.mg-card-body {
  line-height: 1.55;
}

.mg-foot {
  display: flex;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
  width: 100%;
  margin-top: var(--dz-space-2, 0.5rem);
}

.mg-read {
  margin-left: auto;
}
</style>
```
