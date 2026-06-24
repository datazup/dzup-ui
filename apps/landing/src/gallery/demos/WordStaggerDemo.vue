<script setup lang="ts">
import { DzWordReveal } from '../../motion/index.ts'

/**
 * Word stagger demo (catalog `word-stagger`, effect 9) — a heading-scale line
 * whose words rise into view one after another via {@link DzWordReveal}.
 *
 * The line is split into word spans (not letters) with real spaces between them,
 * so it stays selectable and screen readers announce it as one sentence. Each
 * word rises via transform/opacity only — no layout shift. Reduced motion shows
 * the whole line at once. Replay (harness remount) re-runs the cascade.
 */
</script>

<template>
  <div class="stage">
    <DzWordReveal
      text="Ship motion that respects everyone"
      as="p"
      class="line"
    />
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
  margin: 0;
  max-width: 22ch;
  text-align: center;
  font-size: var(--dz-text-xl, 1.25rem);
  font-weight: var(--dz-font-weight-semibold, 600);
  line-height: 1.3;
}
</style>
