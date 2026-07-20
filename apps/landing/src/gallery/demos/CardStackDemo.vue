<script setup lang="ts">
import { DzCard, DzHeading, DzText } from '@dzup-ui/core'
import { DzCardStack, useReducedMotion } from '../../motion/index.ts'

/**
 * Card stack / swap demo (catalog `card-stack`, effect 47) — a stack of DzCards
 * whose front card cycles to the back on click or via the keyboard-operable
 * "Next" button ({@link DzCardStack}). The swap morphs through the View
 * Transitions API where supported and FLIPs (Web Animations API) otherwise;
 * under reduced motion (OS or page toggle, via `disabled`) it reorders instantly.
 *
 * Each card's accent is a decorative brand-spectrum tint (token-only).
 */
const reduced = useReducedMotion()

const cards = [
  { title: 'Design tokens', body: 'One source of truth, light + dark.', tint: 'indigo' },
  { title: 'Accessible motion', body: 'Every effect respects reduced motion.', tint: 'violet' },
  { title: 'Copy-paste demos', body: 'Drop a snippet in and ship.', tint: 'fuchsia' },
  { title: 'Contract-first', body: 'Frozen variant taxonomies (ADR-02).', tint: 'cyan' },
]
</script>

<template>
  <div class="stage">
    <DzCardStack :items="cards" :disabled="reduced" class="stack">
      <template #card="{ item }">
        <DzCard
          variant="elevated"
          padding="lg"
          class="card"
          :style="{
            '--tint': `var(--dz-colors-${item.tint}-500)`,
            '--tint-soft': `var(--dz-colors-${item.tint}-100)`,
          }"
        >
          <span class="card__chip" aria-hidden="true" />
          <DzHeading :level="4" size="lg" weight="bold">
            {{ item.title }}
          </DzHeading>
          <DzText size="sm" tone="muted">
            {{ item.body }}
          </DzText>
        </DzCard>
      </template>
    </DzCardStack>
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

.stack {
  width: min(300px, 100%);
}

.card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--dz-spacing-1, 0.25rem);
  min-height: 132px;
  /* A soft tint wash on the leading edge keys each card to its accent. */
  border-top: 3px solid var(--tint, var(--dz-primary));
}

.card__chip {
  position: absolute;
  top: var(--dz-spacing-4, 1rem);
  right: var(--dz-spacing-4, 1rem);
  width: 28px;
  height: 28px;
  border-radius: var(--dz-radius-full, 9999px);
  background: var(--tint-soft, var(--dz-primary-soft));
  border: 2px solid var(--tint, var(--dz-primary));
}
</style>
