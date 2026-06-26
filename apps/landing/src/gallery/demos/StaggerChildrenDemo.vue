<script setup lang="ts">
import { DzCard, DzText } from '@dzup-ui/core'
import { DzStagger } from '../../motion/index.ts'

/**
 * Stagger children demo (catalog `stagger-children`, effect 2) — a DzCard grid
 * whose cells cascade into view one after another via {@link DzStagger}, which
 * gives each direct child an incremental `--reveal-delay`.
 *
 * Re-cascades on Replay (harness remount). Under reduced motion (OS or page
 * toggle) every cell appears at once with no delay or transform.
 */
const cells = [
  { title: 'Tokens', body: 'One source of truth.' },
  { title: 'Components', body: 'Composable & typed.' },
  { title: 'Motion', body: 'Accessible by default.' },
]
</script>

<template>
  <DzStagger class="grid">
    <DzCard
      v-for="cell in cells"
      :key="cell.title"
      variant="outlined"
      padding="md"
      class="cell"
    >
      <DzText weight="semibold" size="sm" as="div">{{ cell.title }}</DzText>
      <DzText size="xs" tone="muted" as="div">{{ cell.body }}</DzText>
    </DzCard>
  </DzStagger>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  width: 100%;
}

.cell {
  text-align: center;
}

@media (max-width: 480px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
