<script setup lang="ts">
/**
 * Article header — the masthead above a long-form post.
 *
 * A category eyebrow, a DzHeading title and a DzText standfirst, a byline row
 * pairing a DzAvatar with the author name + a live DzRelativeTime "published"
 * stamp (degrades to an absolute date for assistive tech), and a row of DzTag
 * topic chips. Centered measure, stacks cleanly on narrow viewports.
 *
 * Self-contained: local static data, no props, no network. Composed only from
 * free @dzup-ui/core components and `--dz-*` tokens (docs/blocks.md §3.6).
 */
import { DzAvatar, DzHeading, DzRelativeTime, DzTag, DzText } from '@dzup-ui/core'

/** Published ~3 days ago — a fixed offset from load so the relative phrase reads naturally. */
const publishedAt = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()

const tags = ['Design systems', 'Accessibility', 'Vue 3', 'Tokens']
</script>

<template>
  <article class="ah-wrap">
    <header class="ah-head" aria-labelledby="ah-title">
      <DzText size="sm" weight="semibold" tone="muted" as="p" class="ah-eyebrow">
        Engineering · Deep dive
      </DzText>

      <DzHeading id="ah-title" :level="4" size="3xl" weight="bold" align="center" class="ah-title">
        Building a component library that themes itself
      </DzHeading>

      <DzText size="lg" tone="muted" align="center" as="p" class="ah-dek">
        One layer of design tokens, light and dark for free, and an accessible
        baseline you don't have to think about. Here is how the pieces fit.
      </DzText>

      <div class="ah-meta">
        <DzAvatar
          src="https://i.pravatar.cc/96?img=47"
          fallback="ML"
          alt="Mara Lindqvist"
          size="md"
        />
        <div class="ah-byline">
          <DzText size="sm" weight="semibold" as="span">
            Mara Lindqvist
          </DzText>
          <DzText size="sm" tone="muted" as="span" class="ah-byline-row">
            <span>Staff Engineer</span>
            <span aria-hidden="true" class="ah-dot">·</span>
            <DzRelativeTime :value="publishedAt" />
          </DzText>
        </div>
      </div>

      <ul class="ah-tags" aria-label="Article topics">
        <li v-for="tag in tags" :key="tag">
          <DzTag variant="subtle" tone="primary" size="sm">
            {{ tag }}
          </DzTag>
        </li>
      </ul>
    </header>
  </article>
</template>

<style scoped>
.ah-wrap {
  padding: clamp(2rem, 6vw, 3.5rem) var(--dz-space-6, 1.5rem);
  background: var(--dz-background, #fff);
}

.ah-head {
  max-width: 44rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dz-space-4, 1rem);
  text-align: center;
}

.ah-eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.ah-title,
.ah-dek {
  margin: 0;
}

.ah-dek {
  line-height: 1.55;
  max-width: 38rem;
}

.ah-meta {
  display: flex;
  align-items: center;
  gap: var(--dz-space-3, 0.75rem);
  margin-top: var(--dz-space-2, 0.5rem);
}

.ah-byline {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.35;
}

.ah-byline-row {
  display: inline-flex;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
}

.ah-dot {
  opacity: 0.6;
}

.ah-tags {
  list-style: none;
  margin: var(--dz-space-2, 0.5rem) 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--dz-space-2, 0.5rem);
}

@media (max-width: 560px) {
  .ah-meta {
    flex-direction: column;
    text-align: center;
  }

  .ah-byline {
    align-items: center;
  }
}
</style>
