<script setup lang="ts">
import { DzCard, DzHeading, DzText } from '@dzup-ui/core'
import { DzBorderBeam } from '../../motion/index.ts'

/**
 * Border beam demo (catalog `border-beam`, effect 23) — {@link DzBorderBeam}
 * runs a bright arc around the card's border on a loop (only the conic-gradient
 * angle animates, so the box never transforms). The inner card matches the beam
 * radius and carries an opaque surface so the ring peeks only at the edges.
 *
 * Under reduced motion (OS or the page-level toggle) the beam freezes to a
 * static, faint brand ring.
 */
</script>

<template>
  <div class="stage">
    <DzBorderBeam class="beam">
      <DzCard variant="flat" padding="lg" class="inner">
        <DzHeading :level="3" size="md" weight="semibold">
          Live status
        </DzHeading>
        <DzText size="sm" tone="muted" as="p" class="copy">
          A beam of light circles the border to draw the eye.
        </DzText>
      </DzCard>
    </DzBorderBeam>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.beam {
  width: min(260px, 100%);
}

/* Match the inner card radius to the ring so the band hugs the corners. */
.inner {
  border-radius: var(--dz-radius-xl, 0.875rem);
  background: var(--dz-surface, #ffffff);
}

.copy {
  margin: 6px 0 0;
  line-height: 1.6;
}
</style>
