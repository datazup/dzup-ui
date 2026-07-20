<script setup lang="ts">
import type { DataViewLayout, DataViewSortOption } from '@dzup-ui/core'
import {
  DzBadge,
  DzButton,
  DzCard,
  DzDataView,
  DzHeading,
  DzTag,
  DzText,
} from '@dzup-ui/core'
/**
 * Collection gallery — DzDataView with a list/grid toggle, sort, and paging.
 *
 * DzDataView sits between DzList and DzDataGrid: it renders a collection as
 * either a card grid or a stacked list, with a built-in layout toggle, client
 * sorting (`sortOptions`) and a paginator — all driven by `v-model:layout`.
 * The `#item` slot receives the active `layout`, so the same record renders as
 * a rich DzCard tile in grid mode and a compact row in list mode.
 *
 * Self-contained: local static catalog. Composed only from free @dzup-ui/core
 * components and `--dz-*` tokens (docs/blocks.md §3.6).
 */
import { ref } from 'vue'

/** Index signature lets the typed record flow through DzDataView's generic default. */
interface Template {
  [key: string]: unknown
  id: number
  name: string
  category: string
  price: number
  rating: number
  hue: number
}

const templates: Template[] = [
  { id: 1, name: 'Aurora Dashboard', category: 'Admin', price: 49, rating: 4.9, hue: 250 },
  { id: 2, name: 'Ledger Commerce', category: 'E-commerce', price: 69, rating: 4.7, hue: 160 },
  { id: 3, name: 'Pulse Analytics', category: 'SaaS', price: 59, rating: 4.8, hue: 200 },
  { id: 4, name: 'Canvas Portfolio', category: 'Marketing', price: 29, rating: 4.6, hue: 320 },
  { id: 5, name: 'Relay Helpdesk', category: 'Support', price: 39, rating: 4.5, hue: 30 },
  { id: 6, name: 'Atlas Docs', category: 'Content', price: 0, rating: 4.4, hue: 280 },
  { id: 7, name: 'Beacon CRM', category: 'SaaS', price: 79, rating: 4.9, hue: 130 },
  { id: 8, name: 'Vector Studio', category: 'Marketing', price: 45, rating: 4.3, hue: 350 },
]

const sortOptions: DataViewSortOption[] = [
  { label: 'Top rated', field: 'rating', order: -1 },
  { label: 'Price: low to high', field: 'price', order: 1 },
  { label: 'Name (A–Z)', field: 'name', order: 1 },
]

const layout = ref<DataViewLayout>('grid')

function price(value: number): string {
  return value === 0 ? 'Free' : `$${value}`
}
</script>

<template>
  <section class="dv-wrap" aria-labelledby="dv-title">
    <DzDataView
      v-model:layout="layout"
      :items="templates"
      data-key="id"
      layout-toggle
      :cols="{ sm: 2, lg: 3 }"
      gap="md"
      paginator
      :rows="6"
      :sort-options="sortOptions"
      size="md"
      aria-labelledby="dv-title"
    >
      <template #header>
        <DzHeading id="dv-title" :level="4" size="md" weight="semibold" class="dv-title">
          Template marketplace
        </DzHeading>
      </template>

      <template #item="{ item, layout: mode }">
        <DzCard
          v-if="mode === 'grid'"
          variant="outlined"
          padding="none"
          class="dv-card"
        >
          <div
            class="dv-thumb"
            :style="{ '--dv-hue': (item as Template).hue }"
            aria-hidden="true"
          />
          <div class="dv-card-body">
            <div class="dv-card-top">
              <DzTag variant="subtle" tone="neutral" size="sm">
                {{ (item as Template).category }}
              </DzTag>
              <DzBadge variant="subtle" tone="warning" size="sm">
                ★ {{ (item as Template).rating }}
              </DzBadge>
            </div>
            <DzHeading :level="5" size="md" weight="semibold" class="dv-name">
              {{ (item as Template).name }}
            </DzHeading>
            <div class="dv-card-foot">
              <DzText weight="semibold" as="span">
                {{ price((item as Template).price) }}
              </DzText>
              <DzButton variant="solid" tone="primary" size="sm">
                Get
              </DzButton>
            </div>
          </div>
        </DzCard>

        <div v-else class="dv-row">
          <div
            class="dv-row-thumb"
            :style="{ '--dv-hue': (item as Template).hue }"
            aria-hidden="true"
          />
          <div class="dv-row-meta">
            <DzHeading :level="5" size="sm" weight="semibold" class="dv-name">
              {{ (item as Template).name }}
            </DzHeading>
            <DzText size="sm" tone="muted" as="span">
              {{ (item as Template).category }} · ★ {{ (item as Template).rating }}
            </DzText>
          </div>
          <DzText weight="semibold" as="span" class="dv-row-price">
            {{ price((item as Template).price) }}
          </DzText>
          <DzButton variant="outline" tone="neutral" size="sm">
            Get
          </DzButton>
        </div>
      </template>
    </DzDataView>
  </section>
</template>

<style scoped>
.dv-wrap {
  background: var(--dz-background, #fff);
  padding: var(--dz-space-2, 0.5rem);
}

.dv-title {
  margin: 0;
}

/* Grid card */
.dv-card {
  overflow: hidden;
  height: 100%;
}

.dv-thumb {
  height: 7rem;
  /* Decorative wash derived entirely from the brand token; hue-rotate just
     varies it per card, so no raw color literal is introduced. */
  background:
    linear-gradient(
      135deg,
      var(--dz-primary, #6366f1),
      color-mix(in oklch, var(--dz-primary, #6366f1) 45%, var(--dz-surface, #f8fafc))
    );
  filter: hue-rotate(calc(var(--dv-hue) * 1deg));
}

.dv-card-body {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-2, 0.5rem);
  padding: var(--dz-space-4, 1rem);
}

.dv-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dz-space-2, 0.5rem);
}

.dv-name {
  margin: 0;
}

.dv-card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dz-space-2, 0.5rem);
  margin-top: var(--dz-space-1, 0.25rem);
}

/* List row */
.dv-row {
  display: flex;
  align-items: center;
  gap: var(--dz-space-3, 0.75rem);
  padding: var(--dz-space-3, 0.75rem);
  border: 1px solid var(--dz-border, #e5e7eb);
  border-radius: var(--dz-radius-md, 0.5rem);
}

.dv-row-thumb {
  flex: none;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--dz-radius-sm, 0.375rem);
  background:
    linear-gradient(
      135deg,
      var(--dz-primary, #6366f1),
      color-mix(in oklch, var(--dz-primary, #6366f1) 45%, var(--dz-surface, #f8fafc))
    );
  filter: hue-rotate(calc(var(--dv-hue) * 1deg));
}

.dv-row-meta {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
  flex: 1;
}

.dv-row-price {
  white-space: nowrap;
}
</style>
