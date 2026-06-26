<script setup lang="ts">
import { DzCard, DzText } from '@dzup-ui/core'
import { DzReveal } from '../../motion/index.ts'

/**
 * Fade & rise demo (catalog `fade-rise`, effect 1) — opacity 0→1 + a gentle
 * translateY as the card scrolls into view, the formalised default `v-reveal`.
 *
 * Rendered via {@link DzReveal} so it re-animates on Replay (the harness remounts
 * the demo) and degrades reactively under the page-level "Reduce motion" toggle
 * as well as the OS setting — to a quick opacity-only fade with no transform.
 */
</script>

<template>
  <div class="stage">
    <DzReveal>
      <DzCard variant="elevated" padding="lg" class="card">
        <DzText weight="semibold" as="div">Fade &amp; rise</DzText>
        <DzText size="sm" tone="muted" as="div">Opacity 0 → 1, lifts into place.</DzText>
      </DzCard>
    </DzReveal>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.card {
  text-align: center;
}
</style>
