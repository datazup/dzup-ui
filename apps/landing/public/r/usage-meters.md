# Usage meters

A quota dashboard pairing a segmented DzMeterGroup storage breakdown (with legend) against tone-coded DzProgress limit bars and a circular DzProgress ring summarising overall usage.

- **Category:** Feedback
- **Components:** DzMeterGroup, DzProgress, DzCard, DzBadge, DzDivider, DzHeading, DzText
- **Preview:** /blocks#usage-meters

```vue
<script setup lang="ts">
/**
 * Usage meters — a quota dashboard from DzMeterGroup + DzProgress.
 *
 * An outlined card pairing a segmented DzMeterGroup (storage broken down by
 * type, with its built-in legend) against a column of labelled DzProgress bars
 * for plan limits — each tone-coded with a live percentage read-out via the
 * progress default slot — and a circular DzProgress ring summarising overall
 * usage.
 *
 * Self-contained: local static data. Composed only from free @dzup-ui/core
 * components and `--dz-*` tokens (docs/blocks.md §3.6).
 */
import { DzBadge, DzCard, DzDivider, DzHeading, DzMeterGroup, DzProgress, DzText } from '@dzup-ui/core'
import type { DzMeterGroupSegment } from '@dzup-ui/core'
import type { CanonicalTone } from '@dzup-ui/contracts'

const storage: DzMeterGroupSegment[] = [
  { label: 'Documents', value: 32, tone: 'primary' },
  { label: 'Images', value: 24, tone: 'info' },
  { label: 'Backups', value: 18, tone: 'warning' },
  { label: 'Free', value: 26, tone: 'neutral' },
]

interface Limit {
  label: string
  used: number
  total: string
  tone: CanonicalTone
}

const limits: Limit[] = [
  { label: 'API requests', used: 86, total: '430k / 500k', tone: 'warning' },
  { label: 'Team seats', used: 60, total: '9 / 15', tone: 'primary' },
  { label: 'Bandwidth', used: 44, total: '88 / 200 GB', tone: 'info' },
]

const overall = 74
</script>

<template>
  <section class="um-wrap" aria-labelledby="um-title">
    <DzCard variant="outlined" padding="lg">
      <header class="um-head">
        <div>
          <DzHeading id="um-title" :level="4" size="md" weight="semibold" class="um-title">Usage</DzHeading>
          <DzText size="sm" tone="muted" as="p" class="um-sub">Billing period resets in 12 days.</DzText>
        </div>
        <DzBadge variant="subtle" tone="primary" size="sm">Pro plan</DzBadge>
      </header>

      <!-- Storage breakdown -->
      <div class="um-section">
        <div class="um-section-head">
          <DzText size="sm" weight="medium" as="span">Storage</DzText>
          <DzText size="sm" tone="muted" as="span">74 of 100 GB</DzText>
        </div>
        <DzMeterGroup :values="storage" :max="100" size="lg" aria-label="Storage usage by type" />
      </div>

      <DzDivider class="um-divider" />

      <!-- Plan limits -->
      <div class="um-limits">
        <div v-for="limit in limits" :key="limit.label" class="um-limit">
          <div class="um-limit-head">
            <DzText size="sm" weight="medium" as="span">{{ limit.label }}</DzText>
            <DzText size="sm" tone="muted" as="span">{{ limit.total }}</DzText>
          </div>
          <DzProgress :value="limit.used" :tone="limit.tone" size="sm" :aria-label="`${limit.label} usage`" />
        </div>
      </div>

      <DzDivider class="um-divider" />

      <!-- Overall ring -->
      <div class="um-overall">
        <div class="um-ring">
          <DzProgress variant="circular" :value="overall" size="xl" tone="primary" aria-label="Overall usage">
            <span class="um-ring-label">{{ overall }}%</span>
          </DzProgress>
        </div>
        <div>
          <DzText weight="medium" as="p" class="um-overall-title">Overall usage</DzText>
          <DzText size="sm" tone="muted" as="p" class="um-overall-sub">
            Across storage, requests and bandwidth. You're on track for the month.
          </DzText>
        </div>
      </div>
    </DzCard>
  </section>
</template>

<style scoped>
.um-wrap {
  background: var(--dz-background, #fff);
  max-width: 32rem;
  margin: 0 auto;
}

.um-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--dz-space-3, 0.75rem);
  margin-bottom: var(--dz-space-5, 1.25rem);
}

.um-title {
  margin: 0;
}

.um-sub {
  margin: var(--dz-space-1, 0.25rem) 0 0;
}

.um-section-head,
.um-limit-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--dz-space-3, 0.75rem);
  margin-bottom: var(--dz-space-2, 0.5rem);
}

.um-divider {
  margin: var(--dz-space-5, 1.25rem) 0;
}

.um-limits {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-4, 1rem);
}

.um-overall {
  display: flex;
  align-items: center;
  gap: var(--dz-space-4, 1rem);
}

.um-ring {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.um-ring-label {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  color: var(--dz-foreground, #0f172a);
  font-variant-numeric: tabular-nums;
}

.um-overall-title {
  margin: 0;
}

.um-overall-sub {
  margin: var(--dz-space-1, 0.25rem) 0 0;
  line-height: 1.55;
}
</style>
```
