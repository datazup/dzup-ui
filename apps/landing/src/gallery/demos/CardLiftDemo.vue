<script setup lang="ts">
import { DzCard, DzHeading, DzText } from '@dzup-ui/core'
import { computed } from 'vue'
import { useReducedMotion } from '../../motion/index.ts'

/**
 * Card lift + glow demo (catalog `card-lift`, effect 19) — the `.dz-card-lift`
 * CSS utility (the formalised, token-only `.lp-card--hover`): the card rises with
 * a soft shadow and a brand-tinted border on hover. Pointer-only (`:hover` +
 * `@media (hover: hover)`), so touch/keyboard users see the resting state.
 *
 * The `--reduced` modifier (bound from {@link useReducedMotion}) drops the lift
 * for the page-level toggle; the OS setting is handled centrally in `tokens.css`.
 */
const reduced = useReducedMotion()

const liftClass = computed(() => ({
  'dz-card-lift': true,
  'dz-card-lift--reduced': reduced.value,
}))
</script>

<template>
  <div class="stage">
    <DzCard variant="outlined" padding="lg" :class="liftClass" class="card">
      <DzHeading :level="3" size="md" weight="semibold">
        Hover to lift
      </DzHeading>
      <DzText size="sm" tone="muted" as="p" class="copy">
        The card rises with a soft shadow and a brand-tinted border on hover.
      </DzText>
    </DzCard>
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
  width: min(260px, 100%);
}

.copy {
  margin: 6px 0 0;
  line-height: 1.6;
}
</style>
