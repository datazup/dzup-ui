<script setup lang="ts">
import { DzCard, DzText } from '@dzup-ui/core'
import { DzReveal } from '../../motion/index.ts'

/**
 * Directional slide-in demo (catalog `directional-slide`, effect 3) — feature
 * rows that enter from alternating sides via {@link DzReveal}'s `direction`
 * (equivalent to `v-reveal.left` / `v-reveal.right`), with a small per-row delay.
 *
 * Under reduced motion (OS or page toggle) the slide collapses to an
 * opacity-only fade in place.
 */
const rows = [
  { dir: 'left' as const, label: 'Enters from the left' },
  { dir: 'right' as const, label: 'Enters from the right' },
  { dir: 'left' as const, label: 'And again, from the left' },
]
</script>

<template>
  <div class="rows">
    <DzReveal
      v-for="(row, i) in rows"
      :key="row.label"
      :direction="row.dir"
      :delay="i * 90"
    >
      <DzCard variant="outlined" padding="md" class="row">
        <DzText size="sm" as="div">{{ row.label }}</DzText>
      </DzCard>
    </DzReveal>
  </div>
</template>

<style scoped>
.rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.row {
  width: 100%;
}
</style>
