<script setup lang="ts">
import { DzAnimatedNumber, DzStatCard } from '@dzup-ui/core'
import { DollarSign, TrendingUp, Users, Zap } from 'lucide-vue-next'
import type { Component } from 'vue'

/**
 * Stats band — a horizontal strip of four key product metrics.
 *
 * Self-contained: no props, no external data. Composed only from free
 * @dzup-ui/core components and `--dz-*` tokens (no landing-only `--lp-*` props),
 * so it drops into any app already themed, accessible, and light/dark-ready
 * (docs/blocks.md §3.6).
 *
 * Uses DzStatCard for richer structured display (icon, trend, description) and
 * DzAnimatedNumber inside its `#value` slot to add a count-up entrance — the
 * animation starts when the component scrolls into view (`startOnView: true` is
 * the DzAnimatedNumber default). `prefers-reduced-motion` is handled inside the
 * component: it snaps to the final value with no animation.
 *
 * Responsive: four columns on wide screens, two on medium, one on narrow.
 */

interface Stat {
  title: string
  /** The numeric value passed directly to DzAnimatedNumber. */
  displayValue: number
  format: Intl.NumberFormatOptions
  icon: Component
  trend: 'up' | 'down' | 'neutral'
  trendValue: string
  description: string
}

const stats: Stat[] = [
  {
    title: 'Revenue tracked',
    displayValue: 48250,
    format: { style: 'currency', currency: 'USD', maximumFractionDigits: 0 },
    icon: DollarSign,
    trend: 'up',
    trendValue: '+14.2%',
    description: 'vs. last month',
  },
  {
    title: 'Active users',
    displayValue: 12340,
    format: { useGrouping: true },
    icon: Users,
    trend: 'up',
    trendValue: '+8.1%',
    description: 'vs. last week',
  },
  {
    title: 'Queries / day',
    displayValue: 3450000,
    format: { notation: 'compact', compactDisplay: 'short' },
    icon: Zap,
    trend: 'up',
    trendValue: '+22%',
    description: 'avg this quarter',
  },
  {
    title: 'Growth rate',
    /* Intl percent style expects a fraction (0–1); 23.5% → 0.235 */
    displayValue: 0.235,
    format: { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 },
    icon: TrendingUp,
    trend: 'up',
    trendValue: '+2.1pp',
    description: 'quarter-over-quarter',
  },
]
</script>

<template>
  <section class="stats-band" aria-label="Key product metrics">
    <div class="sb-inner">
      <ul class="sb-grid" role="list">
        <li v-for="stat in stats" :key="stat.title">
          <DzStatCard
            :title="stat.title"
            :value="stat.displayValue"
            :icon="stat.icon"
            :trend="stat.trend"
            :trend-value="stat.trendValue"
            :description="stat.description"
            variant="elevated"
          >
            <!-- Animated count-up overrides the static `value` prop via the
                 #value slot; the prop is still supplied (it's required, and is
                 the non-animated / SSR fallback). Starts on scroll-into-view. -->
            <template #value>
              <DzAnimatedNumber
                :value="stat.displayValue"
                :format="stat.format"
                :duration="1200"
                easing="ease-out"
                size="lg"
              />
            </template>
          </DzStatCard>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.stats-band {
  padding: clamp(2rem, 5vw, 3.5rem) var(--dz-space-6, 1.5rem);
  background: var(--dz-surface, #f8fafc);
}

.sb-inner {
  max-width: 72rem;
  margin: 0 auto;
}

.sb-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--dz-space-5, 1.25rem);
}

/* Responsive: 4 → 2 → 1 columns */
@media (max-width: 900px) {
  .sb-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .sb-grid {
    grid-template-columns: 1fr;
  }
}
</style>
