# Button gallery

A labelled specimen sheet of every DzButton variant, tone and size, plus icon and loading/disabled states — a living reference for the button scale.

- **Category:** Buttons
- **Components:** DzButton, DzText
- **Preview:** /blocks/button-showcase

```vue
<script setup lang="ts">
import { DzButton, DzText } from '@dzup-ui/core'
import { ArrowRight, Download, Trash2 } from 'lucide-vue-next'

/**
 * Button gallery — a labelled specimen sheet of the whole DzButton surface:
 * every visual `variant`, every semantic `tone`, the five canonical sizes, and
 * the common content/states (prefix & suffix icons, loading, disabled).
 *
 * A living reference you can paste in to see, side by side, exactly how the
 * button scale renders in your theme. Composed only from free @dzup-ui/core
 * components and `--dz-*` tokens, so it re-themes light/dark automatically and
 * carries no raw color literals (docs/blocks.md §3.6).
 */
</script>

<template>
  <section class="bg-wrap" aria-label="Button gallery">
    <!-- Variants -->
    <div class="bg-group">
      <DzText size="xs" tone="muted" as="p" class="bg-label">Variants</DzText>
      <div class="bg-row">
        <DzButton variant="solid" tone="primary">Solid</DzButton>
        <DzButton variant="outline" tone="primary">Outline</DzButton>
        <DzButton variant="ghost" tone="primary">Ghost</DzButton>
        <DzButton variant="text" tone="primary">Text</DzButton>
        <DzButton variant="link" tone="primary">Link</DzButton>
      </div>
    </div>

    <!-- Tones -->
    <div class="bg-group">
      <DzText size="xs" tone="muted" as="p" class="bg-label">Tones</DzText>
      <div class="bg-row">
        <DzButton variant="solid" tone="neutral">Neutral</DzButton>
        <DzButton variant="solid" tone="primary">Primary</DzButton>
        <DzButton variant="solid" tone="success">Success</DzButton>
        <DzButton variant="solid" tone="warning">Warning</DzButton>
        <DzButton variant="solid" tone="danger">Danger</DzButton>
        <DzButton variant="solid" tone="info">Info</DzButton>
      </div>
    </div>

    <!-- Sizes -->
    <div class="bg-group">
      <DzText size="xs" tone="muted" as="p" class="bg-label">Sizes</DzText>
      <div class="bg-row bg-row-baseline">
        <DzButton variant="outline" tone="neutral" size="xs">Extra small</DzButton>
        <DzButton variant="outline" tone="neutral" size="sm">Small</DzButton>
        <DzButton variant="outline" tone="neutral" size="md">Medium</DzButton>
        <DzButton variant="outline" tone="neutral" size="lg">Large</DzButton>
        <DzButton variant="outline" tone="neutral" size="xl">Extra large</DzButton>
      </div>
    </div>

    <!-- Icons & states -->
    <div class="bg-group">
      <DzText size="xs" tone="muted" as="p" class="bg-label">Icons &amp; states</DzText>
      <div class="bg-row">
        <DzButton variant="solid" tone="primary">
          <template #prefix><Download :size="16" aria-hidden="true" /></template>
          Download
        </DzButton>
        <DzButton variant="outline" tone="neutral">
          Continue
          <template #suffix><ArrowRight :size="16" aria-hidden="true" /></template>
        </DzButton>
        <DzButton variant="solid" tone="primary" loading>Saving…</DzButton>
        <DzButton variant="solid" tone="primary" disabled>Disabled</DzButton>
        <DzButton variant="outline" tone="danger">
          <template #prefix><Trash2 :size="16" aria-hidden="true" /></template>
          Delete
        </DzButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.bg-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-6, 1.5rem);
  padding: clamp(1.25rem, 4vw, 2rem);
  background: var(--dz-background, #fff);
}

.bg-group {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-3, 0.75rem);
}

.bg-label {
  margin: 0;
  font-weight: var(--dz-font-semibold, 600);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.bg-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--dz-space-3, 0.75rem);
}

/* Sizes read most clearly aligned on their text baseline. */
.bg-row-baseline {
  align-items: baseline;
}
</style>
```
