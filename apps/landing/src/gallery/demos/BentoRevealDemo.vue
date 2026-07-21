<script setup lang="ts">
import { DzCard, DzText } from '@dzup-ui/core'
import { Activity, Boxes, Gauge, Layers, Sparkles } from 'lucide-vue-next'
import { DzBentoReveal } from '../../motion/index.ts'

/**
 * Bento reveal demo (catalog `bento-reveal`, effect 52) — a bento grid of
 * `DzCard`s revealed by {@link DzBentoReveal}: a shared, pointer-tracked spotlight
 * plus a per-cell stagger as the grid scrolls into view. Where CSS scroll-driven
 * animations exist the cascade runs on the compositor (`animation-timeline:
 * view()`); in Firefox it falls back to `useInView` + the `.dz-animate-in`
 * entrance. Cells are fully visible by default in both paths.
 *
 * Scroll the page to replay the cascade; move the pointer over the grid for the
 * spotlight. Under reduced motion every cell is shown at once with a faint static
 * glow.
 */
const cells = [
  { icon: Sparkles, title: 'Magic Bento', body: 'Spotlight + per-cell stagger.', span: 'col-2' },
  { icon: Gauge, title: 'On the compositor', body: 'view() — main-thread free.', span: '' },
  { icon: Layers, title: 'Layered', body: 'transform & opacity only.', span: '' },
  { icon: Boxes, title: 'Token-driven', body: 'Every value a --dz-* token.', span: '' },
  { icon: Activity, title: 'JS floor', body: 'useInView fallback, always visible.', span: '' },
]
</script>

<template>
  <div class="wrap">
    <DzBentoReveal class="bento" :step="70">
      <DzCard
        v-for="cell in cells"
        :key="cell.title"
        variant="outlined"
        padding="md"
        class="cell"
        :class="cell.span"
      >
        <component :is="cell.icon" :size="18" class="cell-icon" aria-hidden="true" />
        <DzText weight="semibold" size="sm" as="div">
          {{ cell.title }}
        </DzText>
        <DzText size="xs" tone="muted" as="div">
          {{ cell.body }}
        </DzText>
      </DzCard>
    </DzBentoReveal>

    <DzText size="xs" tone="muted" as="div" class="hint">
      Scroll the page — cells cascade in. Hover for the spotlight.
    </DzText>
  </div>
</template>

<style scoped>
.wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.bento {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 84px;
  /* Pointer-only border highlight as the spotlight passes (Magic Bento). */
  transition: border-color var(--dz-duration-normal, 200ms) var(--dz-ease-out, ease-out);
}

@media (hover: hover) {
  .cell:hover {
    border-color: color-mix(in oklch, var(--dz-colors-primary-500, #6366f1) 48%, var(--dz-border, #e2e8f0));
  }
}

/* Bento spans — the wide hero cell. */
.col-2 {
  grid-column: span 2;
}

.cell-icon {
  color: var(--dz-colors-primary-500, #6366f1);
}

.hint {
  text-align: center;
}
</style>
