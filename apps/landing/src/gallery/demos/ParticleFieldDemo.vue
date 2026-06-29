<script setup lang="ts">
import { DzHeading, DzText } from '@dzup-ui/core'
import { DzParticles } from '../../motion/index.ts'

/**
 * Particle field demo (catalog `particle-field`, effect 43) — {@link DzParticles}
 * drifts a capped constellation of dots behind a headline, linking near
 * neighbours and easing nearby dots aside under a fine pointer. The canvas loop
 * self-pauses when the card scrolls out of view; on touch/keyboard and under
 * reduced motion (OS or page toggle) it draws a single static frame of dots +
 * links. Move a mouse across the stage to see the pointer push.
 */
</script>

<template>
  <div class="stage">
    <DzParticles :count="48" :link-distance="108" />
    <div class="content">
      <DzHeading :level="3" size="lg" weight="bold" class="lp-balance">Constellation</DzHeading>
      <DzText size="xs" tone="muted" as="div">Dots drift, link up and react to your cursor.</DzText>
    </div>
  </div>
</template>

<style scoped>
.stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 168px;
  overflow: hidden;
  border-radius: var(--dz-radius-lg, 0.625rem);
  background: var(--dz-surface, #fff);
}

.content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 16px;
}
</style>
