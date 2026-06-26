<script setup lang="ts">
import { DzBadge, DzHeading, DzImage, DzImageComparison, DzText } from '@dzup-ui/core'
import { ref } from 'vue'

/**
 * Before / after — a draggable reveal slider for comparing two states.
 *
 * DzImageComparison is a single `role="slider"` widget: pointer-draggable,
 * click-to-set on the track, and fully keyboard-operable (Arrows nudge,
 * Shift+Arrow jumps 10, Home/End snap to the edges). `v-model:position` is the
 * percentage of the "after" layer revealed (ADR-16); the live read-out below
 * tracks that same bound value.
 *
 * The before/after layers here are the same DzImage with different CSS grades —
 * a believable "raw vs. edited" demo using only @dzup-ui/core + `--dz-*` tokens.
 */

const SRC = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1400&q=80'

/** Reveal position, 0–100. Starts mid-track. */
const position = ref(50)
</script>

<template>
  <section class="cmp" aria-labelledby="media-comparison-title">
    <header class="cmp-head">
      <DzBadge variant="subtle" tone="primary" size="sm">Compare</DzBadge>
      <DzHeading id="media-comparison-title" :level="4" size="xl" weight="semibold" class="cmp-title">
        Before &amp; after
      </DzHeading>
      <DzText size="sm" tone="muted" class="cmp-lede">
        Drag the handle, or focus it and use the arrow keys, to reveal the edit.
      </DzText>
    </header>

    <DzImageComparison
      v-model:position="position"
      before-label="Raw"
      after-label="Graded"
      aria-label="Compare the raw and graded photo"
      class="cmp-frame"
    >
      <template #before>
        <DzImage :src="SRC" alt="Unedited landscape photo" fit="cover" class="cmp-img cmp-img--raw" />
      </template>
      <template #after>
        <DzImage :src="SRC" alt="Colour-graded landscape photo" fit="cover" class="cmp-img cmp-img--graded" />
      </template>
    </DzImageComparison>

    <div class="cmp-meter" aria-hidden="true">
      <span class="cmp-meter-label">Reveal</span>
      <span class="cmp-meter-track">
        <span class="cmp-meter-fill" :style="{ width: `${position}%` }" />
      </span>
      <span class="cmp-meter-value">{{ Math.round(position) }}%</span>
    </div>
  </section>
</template>

<style scoped>
.cmp {
  padding: clamp(1.25rem, 4vw, 2rem);
  background: var(--dz-background, #fff);
}

.cmp-head {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--dz-space-2, 0.5rem);
  margin-bottom: var(--dz-space-5, 1.25rem);
}

.cmp-title {
  margin: 0;
  letter-spacing: -0.01em;
}

.cmp-lede {
  margin: 0;
  line-height: 1.55;
}

/* Fix the framing ratio so both layers register exactly. */
.cmp-frame {
  aspect-ratio: 16 / 10;
  width: 100%;
  border-radius: var(--dz-radius-xl, 0.875rem);
  border: 1px solid color-mix(in oklch, var(--dz-border, #e2e8f0) 60%, transparent);
  box-shadow: 0 4px 12px -6px color-mix(in oklch, var(--dz-shadow, #000) 20%, transparent);
}

.cmp-img {
  width: 100%;
  height: 100%;
  display: block;
}

/* "Raw" = flat, cool, low-contrast capture. */
.cmp-img--raw :deep(img) {
  filter: saturate(0.55) brightness(0.96) contrast(0.92);
}

/* "Graded" = warm, punchy edit. */
.cmp-img--graded :deep(img) {
  filter: saturate(1.25) contrast(1.08) brightness(1.03);
}

.cmp-meter {
  display: flex;
  align-items: center;
  gap: var(--dz-space-3, 0.75rem);
  margin-top: var(--dz-space-4, 1rem);
  font-size: var(--dz-text-xs, 0.75rem);
}

.cmp-meter-label {
  font-weight: 600;
  color: var(--dz-muted-foreground, #64748b);
}

.cmp-meter-track {
  position: relative;
  flex: 1;
  height: 6px;
  border-radius: var(--dz-radius-full, 9999px);
  background: var(--dz-muted, #e2e8f0);
  overflow: hidden;
}

.cmp-meter-fill {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: inherit;
  background: var(--dz-primary, #6366f1);
}

.cmp-meter-value {
  min-width: 3ch;
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: var(--dz-foreground, #0f172a);
}
</style>
