<script setup lang="ts">
import { DzHeading, DzText } from '@dzup-ui/core'
import { DzSpotlight } from '../../motion/index.ts'

/**
 * Spotlight follow demo (catalog `spotlight-follow`, effect 17) — a radial glow
 * tracks the cursor across the surface via {@link DzSpotlight} (rAF-throttled
 * transform). Move a mouse over the card to see it follow; touch and
 * keyboard-only users get no tracking, and under reduced motion (OS or page
 * toggle) a gentle static glow is shown instead.
 */
</script>

<template>
  <div class="stage">
    <DzSpotlight class="surface">
      <DzHeading :level="3" size="md" weight="semibold">Follow the light</DzHeading>
      <DzText size="xs" tone="muted" as="div">Move your cursor across the card.</DzText>
    </DzSpotlight>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.surface {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: min(280px, 100%);
  min-height: 150px;
  padding: 24px;
  text-align: center;
  border: 1px solid var(--lp-hairline, var(--dz-border, #e2e8f0));
  border-radius: var(--dz-radius-lg, 0.625rem);
  background: var(--dz-surface, #fff);
}
</style>
