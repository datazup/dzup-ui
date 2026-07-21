<script setup lang="ts">
import { DzCard, DzHeading, DzText } from '@dzup-ui/core'
import { useReducedMotion, vGlare } from '../../motion/index.ts'

/**
 * Glare card demo (catalog `glare`, effect 48) — a DzCard dressed with a
 * pointer-tracked specular highlight via the {@link vGlare} directive. The gloss
 * follows the cursor across the surface (rAF, opacity/background-position only)
 * and never moves the card's click target. Touch + keyboard get a flat surface;
 * under reduced motion (OS or page toggle, via `disabled`) the glare is off.
 */
const reduced = useReducedMotion()
</script>

<template>
  <div class="stage">
    <DzCard
      v-glare="{ disabled: reduced }"
      variant="elevated"
      padding="lg"
      class="card"
    >
      <span class="card__badge">PRO</span>
      <DzHeading :level="4" size="lg" weight="bold">
        Membership card
      </DzHeading>
      <DzText size="sm" tone="muted">
        Tilt-free gloss tracks the pointer.
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
  padding: 8px;
}

.card {
  width: min(300px, 100%);
  display: flex;
  flex-direction: column;
  gap: var(--dz-spacing-1, 0.25rem);
  min-height: 148px;
  /* A subtle gradient surface so the specular sweep has something to catch. */
  background: linear-gradient(
    135deg,
    color-mix(in oklch, var(--dz-primary, #6366f1) 12%, var(--dz-surface, #fff)),
    var(--dz-surface, #fff)
  );
}

.card__badge {
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--dz-primary, #6366f1);
}
</style>
