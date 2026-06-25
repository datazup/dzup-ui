<script setup lang="ts">
/**
 * Bento grid — a modern "bento box" dashboard layout built on DzGrid.
 *
 * DzGrid owns the 4-column track and gap; each cell is a layout-only wrapper
 * (`.bento-cell`) that spans columns/rows via scoped CSS, holding a DzPanel or
 * a DzAspectRatio media tile. DzDivider separates sub-sections inside a tile.
 * This is the Layout family's headline pattern: structure from primitives, with
 * Cards/Panels/Badges as the content surfaces.
 *
 * Self-contained: local static data, no props, no router. Composed only from
 * free @dzup-ui/core components and `--dz-*` tokens (docs/blocks.md §3.6).
 * Heading: the tile titles use level 4 within BlockPreview's H3 shell; raise the
 * levels when embedding in your own page (DzHeading decouples level from size).
 *
 * Responsive: 4 columns collapse to 2, then 1; every span resets at the
 * narrowest breakpoint so each tile takes the full width.
 */
import {
  DzAspectRatio,
  DzBadge,
  DzDivider,
  DzGrid,
  DzHeading,
  DzIcon,
  DzPanel,
  DzText,
} from '@dzup-ui/core'
import { ArrowDownRight, ArrowUpRight, Sparkles } from 'lucide-vue-next'

interface Metric {
  label: string
  value: string
  delta: string
  up: boolean
}

const metrics: Metric[] = [
  { label: 'Active users', value: '12,840', delta: '8.2%', up: true },
  { label: 'Conversion', value: '3.1%', delta: '0.4%', up: false },
]

interface Channel {
  name: string
  share: string
}

const channels: Channel[] = [
  { name: 'Organic search', share: '42%' },
  { name: 'Direct', share: '27%' },
  { name: 'Referral', share: '19%' },
  { name: 'Social', share: '12%' },
]
</script>

<template>
  <section class="bento" aria-labelledby="bento-title">
    <header class="bento-head">
      <DzHeading id="bento-title" :level="4" size="lg" weight="bold">Workspace overview</DzHeading>
      <DzText size="sm" tone="muted">Composed with DzGrid · spanning bento tiles</DzText>
    </header>

    <DzGrid :cols="{ sm: 2, lg: 4 }" gap="md" class="bento-grid" :style="{ gridAutoRows: 'minmax(8rem, auto)' }">
      <!-- Hero revenue tile: 2×2 -->
      <div class="bento-cell bento-cell--2 bento-cell--row2">
        <DzPanel header="Monthly revenue" variant="elevated" class="bento-panel">
          <div class="bento-revenue">
            <DzHeading :level="5" size="2xl" weight="bold" class="bento-figure">$48.2k</DzHeading>
            <DzBadge variant="subtle" tone="success" size="sm">
              <DzIcon :icon="ArrowUpRight" size="xs" /> 12.5%
            </DzBadge>
          </div>
          <DzText size="sm" tone="muted" class="bento-revenue-sub">vs. $42.8k last month</DzText>

          <DzDivider class="bento-rule" />

          <ul class="bento-list" role="list">
            <li v-for="channel in channels" :key="channel.name" class="bento-list-row">
              <DzText size="sm" as="span">{{ channel.name }}</DzText>
              <DzText size="sm" weight="semibold" as="span">{{ channel.share }}</DzText>
            </li>
          </ul>
        </DzPanel>
      </div>

      <!-- Media tile: 2 wide, fixed aspect -->
      <div class="bento-cell bento-cell--2">
        <DzAspectRatio :ratio="16 / 9" class="bento-media">
          <div class="bento-media-inner">
            <DzBadge variant="solid" tone="primary" size="sm" class="bento-media-badge">
              <DzIcon :icon="Sparkles" size="xs" /> New
            </DzBadge>
            <DzHeading :level="5" size="md" weight="semibold" class="bento-media-title">
              AI insights, live
            </DzHeading>
            <DzText size="sm" class="bento-media-text">Surface anomalies the moment they happen.</DzText>
          </div>
        </DzAspectRatio>
      </div>

      <!-- Two compact stat tiles -->
      <div v-for="metric in metrics" :key="metric.label" class="bento-cell">
        <DzPanel variant="outlined" class="bento-panel bento-panel--stat">
          <DzText size="xs" tone="muted" class="bento-stat-label">{{ metric.label }}</DzText>
          <DzHeading :level="5" size="xl" weight="bold" class="bento-stat-value">{{ metric.value }}</DzHeading>
          <DzBadge :tone="metric.up ? 'success' : 'danger'" variant="subtle" size="sm">
            <DzIcon :icon="metric.up ? ArrowUpRight : ArrowDownRight" size="xs" /> {{ metric.delta }}
          </DzBadge>
        </DzPanel>
      </div>

      <!-- Full-width footer tile -->
      <div class="bento-cell bento-cell--full">
        <DzPanel variant="outlined" class="bento-panel bento-panel--cta">
          <div class="bento-cta">
            <div>
              <DzHeading :level="5" size="sm" weight="semibold">Storage</DzHeading>
              <DzText size="sm" tone="muted">68.4 GB of 100 GB used</DzText>
            </div>
            <div class="bento-cta-track" aria-hidden="true">
              <span class="bento-cta-fill" />
            </div>
          </div>
        </DzPanel>
      </div>
    </DzGrid>
  </section>
</template>

<style scoped>
.bento {
  background: var(--dz-background, #fff);
  padding: var(--dz-space-2, 0.5rem);
  max-width: 60rem;
  margin: 0 auto;
}

.bento-head {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-1, 0.25rem);
  margin-bottom: var(--dz-space-5, 1.25rem);
}

.bento-cell {
  display: flex;
  min-width: 0;
}

.bento-cell > * {
  width: 100%;
}

/* Spans — reliable column/row spanning over the DzGrid tracks. */
.bento-cell--2 {
  grid-column: span 2;
}

.bento-cell--row2 {
  grid-row: span 2;
}

.bento-cell--full {
  grid-column: 1 / -1;
}

.bento-panel {
  height: 100%;
}

.bento-revenue {
  display: flex;
  align-items: center;
  gap: var(--dz-space-3, 0.75rem);
}

.bento-figure {
  margin: 0;
}

.bento-revenue-sub {
  margin-top: var(--dz-space-1, 0.25rem);
}

.bento-rule {
  margin: var(--dz-space-4, 1rem) 0;
}

.bento-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-2, 0.5rem);
}

.bento-list-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Media tile — a token gradient surface, re-themes with the palette. */
.bento-media {
  height: 100%;
  border-radius: var(--dz-radius-lg, 0.75rem);
  overflow: hidden;
}

.bento-media-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: var(--dz-space-1, 0.25rem);
  padding: var(--dz-space-5, 1.25rem);
  background: linear-gradient(135deg, var(--dz-primary, #6366f1), var(--dz-info, #0ea5e9));
  color: var(--dz-primary-foreground, #fff);
}

.bento-media-badge {
  align-self: flex-start;
  margin-bottom: auto;
}

.bento-media-title,
.bento-media-text {
  color: var(--dz-primary-foreground, #fff);
  margin: 0;
}

.bento-panel--stat {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-2, 0.5rem);
  align-items: flex-start;
}

.bento-stat-label,
.bento-stat-value {
  margin: 0;
}

.bento-panel--cta {
  height: 100%;
}

.bento-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dz-space-5, 1.25rem);
  flex-wrap: wrap;
}

.bento-cta-track {
  flex: 1;
  min-width: 12rem;
  height: 0.5rem;
  border-radius: var(--dz-radius-full, 9999px);
  background: var(--dz-muted, #e5e7eb);
  overflow: hidden;
}

.bento-cta-fill {
  display: block;
  width: 68%;
  height: 100%;
  border-radius: inherit;
  background: var(--dz-primary, #6366f1);
}

/* Collapse every span to full width at the narrowest breakpoint. */
@media (max-width: 560px) {
  .bento-cell--2,
  .bento-cell--row2,
  .bento-cell--full {
    grid-column: auto;
    grid-row: auto;
  }
}
</style>
