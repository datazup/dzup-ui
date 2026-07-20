<script setup lang="ts">
import { DzHeading } from '@dzup-ui/core'
import { DzGradientText } from '../../motion/index.ts'

/**
 * Gradient sweep demo (catalog `gradient-sweep`, effect 7) — an animated brand
 * gradient pans continuously across a heading via {@link DzGradientText}.
 *
 * Re-mounting on Replay restarts the loop. Under reduced motion (OS or the
 * page-level toggle) the pan stops and the gradient is shown static — its
 * fallback. The heading text is untouched in the DOM, so it stays selectable
 * and screen-reader-readable.
 */
</script>

<template>
  <div class="stage">
    <DzGradientText>
      <DzHeading :level="3" size="2xl" weight="bold">
        Motion, on brand
      </DzHeading>
    </DzGradientText>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 64px;
}
</style>
