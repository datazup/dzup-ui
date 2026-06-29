<script setup lang="ts">
import { DzHeading } from '@dzup-ui/core'
import { DzTextFlip } from '../../motion/index.ts'

/**
 * Text flip demo (catalog `text-flip`, effect 40) — a headline whose final word
 * flips vertically through a rotating list via {@link DzTextFlip}, distinct from
 * the typewriter's character-by-character typing.
 *
 * The flipping word is decorative (aria-hidden); the active phrase is mirrored
 * into a single polite aria-live region, and the box is sized to the longest
 * phrase so the line never shifts. Under reduced motion the first phrase shows
 * statically; the cycle also pauses on hover/focus and while off-screen.
 */
const phrases = [
  'tokens',
  'motion',
  'demos',
  'systems',
]
</script>

<template>
  <div class="stage">
    <DzHeading :level="4" class="line">
      Built on design
      <DzTextFlip :phrases="phrases" class="accent" />
    </DzHeading>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 96px;
}

.line {
  text-align: center;
}

.accent {
  color: var(--dz-colors-primary-600, #4f46e5);
}
</style>
