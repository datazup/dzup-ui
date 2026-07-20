<script setup lang="ts">
import { DzHeading, DzText } from '@dzup-ui/core'
import { DzGlass } from '../../motion/index.ts'

/**
 * Glass surface demo (catalog `glass-surface`, effect 45) — {@link DzGlass}
 * frosts a busy, colourful backdrop so a panel of content reads cleanly over it.
 * Under `prefers-reduced-transparency` the frost is swapped for an opaque raised
 * surface; under `forced-colors` it becomes a solid system surface with a visible
 * border. No motion, so nothing to disable under reduced motion.
 */
</script>

<template>
  <div class="stage">
    <!-- A deliberately busy backdrop the glass has to frost. -->
    <div class="backdrop" aria-hidden="true">
      <span class="blob blob--1" />
      <span class="blob blob--2" />
      <span class="blob blob--3" />
    </div>
    <DzGlass class="panel">
      <DzHeading :level="3" size="md" weight="semibold">
        Frosted panel
      </DzHeading>
      <DzText size="xs" tone="muted" as="div">
        Legible over a busy, colourful backdrop.
      </DzText>
    </DzGlass>
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
  background: var(--dz-surface, #ffffff);
}

.backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.blob {
  position: absolute;
  width: 46%;
  height: 70%;
  border-radius: 50%;
  filter: blur(26px);
  opacity: 0.85;
}

.blob--1 {
  top: -18%;
  left: -6%;
  background: var(--dz-colors-primary-500, #0766ee);
}

.blob--2 {
  bottom: -22%;
  right: -4%;
  background: var(--dz-colors-secondary-500, #7260bd);
}

.blob--3 {
  top: 24%;
  left: 42%;
  width: 34%;
  height: 48%;
  background: var(--dz-colors-fuchsia-500, #b02bb0);
}

.panel {
  position: relative;
  z-index: 1;
  width: min(232px, 80%);
  text-align: center;
}
</style>
