# Stat card row

Four KPI cards with up/down/neutral trend deltas in a responsive 4→2→1 column grid.

- **Category:** Application
- **Components:** DzStatCard
- **Preview:** /blocks/stat-row

```vue
<script setup lang="ts">
/**
 * Stat card row — four KPI cards with trend deltas.
 *
 * Four DzStatCard components laid out in a responsive grid that collapses
 * from 4 → 2 → 1 column(s) at the standard breakpoints. Each card carries
 * a trend direction (up/down/neutral), a trendValue string and an icon —
 * the exact API exposed by DzStatCardProps.
 *
 * Self-contained: static sample data, no props, no router.
 */
import { DzStatCard } from '@dzup-ui/core'
import { Activity, DollarSign, ShoppingCart, Users } from 'lucide-vue-next'

const stats = [
  {
    title: 'Total revenue',
    value: '$84,230',
    trend: 'up' as const,
    trendValue: '+12.4%',
    icon: DollarSign,
  },
  {
    title: 'Active users',
    value: '14,820',
    trend: 'up' as const,
    trendValue: '+8.1%',
    icon: Users,
  },
  {
    title: 'New orders',
    value: '1,204',
    trend: 'down' as const,
    trendValue: '-3.2%',
    icon: ShoppingCart,
  },
  {
    title: 'Uptime',
    value: '99.97%',
    trend: 'neutral' as const,
    trendValue: '0%',
    icon: Activity,
  },
]
</script>

<template>
  <section class="sr-wrap" aria-label="Key performance indicators">
    <div class="sr-grid">
      <DzStatCard
        v-for="stat in stats"
        :key="stat.title"
        :title="stat.title"
        :value="stat.value"
        :trend="stat.trend"
        :trend-value="stat.trendValue"
        :icon="stat.icon"
        variant="outlined"
      />
    </div>
  </section>
</template>

<style scoped>
.sr-wrap {
  padding: var(--dz-space-6, 1.5rem);
  background: var(--dz-background, #fff);
}

.sr-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--dz-space-4, 1rem);
}

/* 4 → 2 columns */
@media (max-width: 900px) {
  .sr-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 2 → 1 column */
@media (max-width: 480px) {
  .sr-grid {
    grid-template-columns: 1fr;
  }
}
</style>
```
