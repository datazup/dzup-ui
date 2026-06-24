<script setup lang="ts">
import { DzText } from '@dzup-ui/core'
import { DzTextDecode } from '../../motion/index.ts'

/**
 * Letter decode demo (catalog `letter-decode`, effect 10) — an eyebrow label
 * that scrambles then resolves left-to-right when it scrolls into view, via
 * {@link DzTextDecode}.
 *
 * The scrambling glyphs are aria-hidden with a stable screen-reader copy of the
 * real label, and the box is sized to the resolved text so the scramble never
 * shifts layout. Reduced motion shows the plain label. Replay (harness remount)
 * re-triggers the decode.
 */
</script>

<template>
  <div class="stage">
    <DzText size="sm" weight="semibold" as="div" class="eyebrow">
      <DzTextDecode text="ECOSYSTEM · ANIMATIONS" />
    </DzText>
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

.eyebrow {
  letter-spacing: 0.14em;
  color: var(--dz-colors-primary-600, #4f46e5);
  font-family: var(--dz-font-mono, monospace);
}
</style>
