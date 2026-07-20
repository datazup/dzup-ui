<script setup lang="ts">
import { DzText } from '@dzup-ui/core'
import { DzTypewriter } from '../../motion/index.ts'

/**
 * Typewriter demo (catalog `typewriter`, effect 8) — a hero-style subhead whose
 * trailing phrase types and erases on a loop via {@link DzTypewriter}.
 *
 * The animated glyphs are aria-hidden with a stable screen-reader copy, and the
 * box is sized to the longest phrase so the line never shifts as it types. Under
 * reduced motion the first phrase shows instantly with a steady caret. Replay
 * (harness remount) restarts the cycle.
 */
const phrases = [
  'design tokens.',
  'accessible motion.',
  'copy-paste demos.',
]
</script>

<template>
  <div class="stage">
    <DzText size="lg" weight="medium" as="div" class="line">
      Built on
      <DzTypewriter :phrases="phrases" class="accent" />
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

.line {
  text-align: center;
}

.accent {
  color: var(--dz-colors-primary-600, #004ecb);
  font-weight: var(--dz-font-weight-semibold, 600);
}
</style>
