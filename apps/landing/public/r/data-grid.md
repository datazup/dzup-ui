# Data grid card

A DzDataGrid of deployments with sortable columns, multi-row selection, a paginated footer, and a #cell slot rendering avatars, environment tags and status badges.

- **Category:** Data display
- **Components:** DzDataGrid, DzCard, DzAvatar, DzBadge, DzTag, DzText
- **Preview:** /blocks/data-grid

```vue
<script setup lang="ts">
/**
 * Data grid card — sortable, selectable, paginated DzDataGrid.
 *
 * The Data family's flagship: DzDataGrid renders a full table from `:columns`
 * + `:data` and owns sorting, multi-row selection (checkbox column), and the
 * paginated footer internally. The `#cell` slot takes over cell rendering so
 * the service column shows an avatar, the environment/status columns render as
 * tokenised DzTag / DzBadge, and latency reads as a unit.
 *
 * Self-contained: local static data, interactive via the grid's own state.
 * Composed only from free @dzup-ui/core components and `--dz-*` tokens
 * (docs/blocks.md §3.6) — drops in already themed, accessible, light/dark-ready.
 */
import {
  DzAvatar,
  DzBadge,
  DzCard,
  DzDataGrid,
  DzHeading,
  DzTag,
  DzText,
} from '@dzup-ui/core'
import type { ColumnDef } from '@dzup-ui/core'
import type { CanonicalTone } from '@dzup-ui/contracts'

type StatusKey = 'live' | 'building' | 'failed' | 'queued'

/**
 * Index signature lets a typed row flow through DzDataGrid's generic default
 * (`Record<string, unknown>`) while the `#cell` slot narrows back to Deployment.
 */
interface Deployment {
  [key: string]: unknown
  id: number
  service: string
  environment: 'production' | 'staging' | 'preview'
  version: string
  latency: number
  status: StatusKey
  updated: string
}

const STATUS_META: Record<StatusKey, { tone: CanonicalTone, label: string }> = {
  live: { tone: 'success', label: 'Live' },
  building: { tone: 'info', label: 'Building' },
  queued: { tone: 'warning', label: 'Queued' },
  failed: { tone: 'danger', label: 'Failed' },
}

const ENV_TONE: Record<Deployment['environment'], CanonicalTone> = {
  production: 'primary',
  staging: 'warning',
  preview: 'neutral',
}

const rows: Deployment[] = [
  { id: 1, service: 'api-gateway', environment: 'production', version: 'v2.8.1', latency: 84, status: 'live', updated: '2m ago' },
  { id: 2, service: 'auth-service', environment: 'production', version: 'v1.14.0', latency: 112, status: 'live', updated: '11m ago' },
  { id: 3, service: 'billing-worker', environment: 'staging', version: 'v0.9.7', latency: 203, status: 'building', updated: '1m ago' },
  { id: 4, service: 'search-index', environment: 'production', version: 'v3.2.0', latency: 156, status: 'live', updated: '34m ago' },
  { id: 5, service: 'media-resizer', environment: 'preview', version: 'pr-482', latency: 421, status: 'failed', updated: '5m ago' },
  { id: 6, service: 'notifications', environment: 'staging', version: 'v1.3.2', latency: 98, status: 'queued', updated: 'just now' },
  { id: 7, service: 'analytics-etl', environment: 'production', version: 'v2.0.4', latency: 312, status: 'live', updated: '1h ago' },
  { id: 8, service: 'webhooks', environment: 'preview', version: 'pr-477', latency: 64, status: 'building', updated: '3m ago' },
]

const columns: ColumnDef<Deployment>[] = [
  { field: 'service', header: 'Service', sortable: true },
  { field: 'environment', header: 'Environment', sortable: true },
  { field: 'version', header: 'Version' },
  { field: 'latency', header: 'p95 latency', sortable: true, align: 'right' },
  { field: 'status', header: 'Status', sortable: true },
  { field: 'updated', header: 'Updated', align: 'right' },
]
</script>

<template>
  <section class="dg-wrap" aria-labelledby="dg-title">
    <DzCard variant="outlined" padding="none">
      <header class="dg-head">
        <div>
          <DzHeading id="dg-title" :level="4" size="md" weight="semibold" class="dg-card-title">Deployments</DzHeading>
          <DzText size="sm" tone="muted" as="p" class="dg-sub">
            Sort columns, select rows, page through results.
          </DzText>
        </div>
        <DzBadge variant="subtle" tone="success" size="sm">{{ rows.filter((r) => r.status === 'live').length }} live</DzBadge>
      </header>

      <div class="dg-scroll">
        <DzDataGrid
          :data="rows"
          :columns="columns"
          row-key="id"
          sortable
          selectable="multiple"
          :pagination="{ pageSize: 5 }"
          size="sm"
          aria-label="Deployments data grid"
        >
          <template #cell="{ row, column, value }">
            <template v-if="column.field === 'service'">
              <span class="dg-service">
                <DzAvatar :fallback="(row as Deployment).service.slice(0, 1).toUpperCase()" :alt="(row as Deployment).service" size="xs" />
                <DzText size="sm" weight="medium" as="span">{{ (row as Deployment).service }}</DzText>
              </span>
            </template>

            <template v-else-if="column.field === 'environment'">
              <DzTag variant="subtle" :tone="ENV_TONE[(row as Deployment).environment]" size="sm">
                {{ (row as Deployment).environment }}
              </DzTag>
            </template>

            <template v-else-if="column.field === 'status'">
              <DzBadge
                variant="subtle"
                :tone="STATUS_META[(row as Deployment).status].tone"
                size="sm"
              >
                {{ STATUS_META[(row as Deployment).status].label }}
              </DzBadge>
            </template>

            <template v-else-if="column.field === 'latency'">
              <DzText size="sm" :tone="(value as number) > 250 ? 'warning' : 'muted'" as="span">
                {{ value }} ms
              </DzText>
            </template>

            <template v-else>
              <DzText size="sm" tone="muted" as="span">{{ value }}</DzText>
            </template>
          </template>

          <template #empty>
            <DzText size="sm" tone="muted">No deployments to show.</DzText>
          </template>
        </DzDataGrid>
      </div>
    </DzCard>
  </section>
</template>

<style scoped>
.dg-wrap {
  background: var(--dz-background, #fff);
}

.dg-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--dz-space-3, 0.75rem);
  padding: var(--dz-space-4, 1rem);
  flex-wrap: wrap;
}

.dg-card-title {
  margin: 0;
}

.dg-sub {
  margin: var(--dz-space-1, 0.25rem) 0 0;
}

.dg-scroll {
  overflow-x: auto;
}

.dg-service {
  display: inline-flex;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
}
</style>
```
