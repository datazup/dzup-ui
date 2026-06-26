<script setup lang="ts">
import { DzText } from '@dzup-ui/core'
import { computed } from 'vue'
import { useReducedMotion } from '../../motion/index.ts'

/**
 * Animated grid/dots demo (catalog `animated-grid`, effect 16) — the
 * `.dz-anim-grid` CSS utility pans a tiled line pattern behind section content
 * via `background-position` (paint-only, GPU-cheap). The `--reduced` modifier
 * (bound from {@link useReducedMotion}) stops the pan for the page-level toggle;
 * the OS setting is handled centrally by the `[class*="dz-anim-"]` reduced-motion
 * block in `tokens.css`.
 */
const reduced = useReducedMotion()

const gridClass = computed(() => ({
  'dz-anim-grid': true,
  'dz-anim-grid--reduced': reduced.value,
}))
</script>

<template>
  <div class="stage">
    <div :class="gridClass" />
    <div class="content">
      <DzText weight="semibold" as="div">Animated grid</DzText>
      <DzText size="xs" tone="muted" as="div">A subtle, panning section backdrop.</DzText>
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
