<script setup lang="ts">
import { DzStatCard } from '@dzup-ui/core'
import { DzOdometer } from '../../motion/index.ts'

/**
 * Odometer demo (catalog `odometer`, effect 41) — KPI figures whose digits roll
 * vertically to their target the moment the stage scrolls into view, via
 * {@link DzOdometer} (distinct from the count-up tween in effect 12).
 *
 * Pairs with core's {@link DzStatCard}: the odometer renders into the card's
 * `#value` slot so the rolling figure sits in a real stat surface. Shows the
 * formatting surface — thousands separators (48,200), a "k" suffix, a "$" prefix.
 * Under reduced motion every figure shows its final value instantly (no roll, no
 * width jump); Replay re-mounts the demo to re-arm the roll.
 */
const stats = [
  { title: 'Active projects', value: 48200, prefix: '', suffix: '', trend: 'up' as const, trendValue: '+12%' },
  { title: 'GitHub stars', value: 12, prefix: '', suffix: 'k', trend: 'up' as const, trendValue: '+4%' },
  { title: 'Monthly revenue', value: 86, prefix: '$', suffix: 'k', trend: 'up' as const, trendValue: '+9%' },
]
</script>

<template>
  <div class="stage">
    <DzStatCard
      v-for="s in stats"
      :key="s.title"
      class="stat"
      variant="outlined"
      :title="s.title"
      :value="s.value"
      :trend="s.trend"
      :trend-value="s.trendValue"
    >
      <template #value>
        <span class="figure">
          <DzOdometer
            :value="s.value"
            :prefix="s.prefix"
            :suffix="s.suffix"
            tone="primary"
            :aria-label="s.title"
          />
        </span>
      </template>
    </DzStatCard>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  align-items: stretch;
  justify-content: center;
  flex-wrap: wrap;
  gap: clamp(12px, 3vw, 20px);
  width: 100%;
}

.stat {
  min-width: 150px;
}

.figure {
  font-size: clamp(1.6rem, 4.5vw, 2.2rem);
  font-weight: 750;
  letter-spacing: -0.03em;
  line-height: 1;
}
</style>
