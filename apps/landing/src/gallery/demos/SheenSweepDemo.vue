<script setup lang="ts">
import { DzButton, DzCard, DzText } from '@dzup-ui/core'
import { computed } from 'vue'
import { useReducedMotion } from '../../motion/index.ts'

/**
 * Sheen sweep demo (catalog `sheen-sweep`, effect 21) — the `.dz-sheen` CSS
 * utility rides a diagonal light streak (a translated ::after, transform-only)
 * across a DzButton and a DzCard on hover; the host clips it so it reads as a
 * sweep. Pointer-only via `@media (hover: hover)`.
 *
 * The `--reduced` modifier (bound from {@link useReducedMotion}) suppresses the
 * sweep for the page-level toggle; the OS setting is handled in `tokens.css`.
 */
const reduced = useReducedMotion()

const sheen = computed(() => ({
  'dz-sheen': true,
  'dz-sheen--reduced': reduced.value,
}))
</script>

<template>
  <div class="stage">
    <DzButton variant="solid" tone="primary" :class="sheen">
      Get started
    </DzButton>

    <DzCard variant="elevated" padding="lg" :class="sheen" class="card">
      <DzText weight="semibold" as="div">Hover for sheen</DzText>
      <DzText size="sm" tone="muted" as="div">A light streak sweeps across.</DzText>
    </DzCard>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  width: 100%;
}

.card {
  width: min(260px, 100%);
  text-align: center;
}
</style>
