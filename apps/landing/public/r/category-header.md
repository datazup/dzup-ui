# Category header

The title bar above a product listing — a breadcrumb trail, category heading with a live product count, and a toolbar pairing a sort DzSelect with a grid/list DzSegmented view toggle.

- **Category:** Commerce
- **Components:** DzHeading, DzSelect, DzSegmented, DzBreadcrumb, DzBreadcrumbItem, DzText
- **Preview:** /blocks#category-header

```vue
<script setup lang="ts">
/**
 * Category header — the title + controls bar above a product listing.
 *
 * A DzBreadcrumb locates the category, a DzHeading names it with a live result
 * count, and a toolbar pairs a DzSelect sort menu with a DzSegmented grid/list
 * view toggle. Both controls are v-modelled so the read-out reflects the choice
 * — drop a product grid beneath it and wire the same refs.
 *
 * Self-contained: local reactive state, no props, no router. Composed only from
 * free @dzup-ui/core components and `--dz-*` tokens (docs/blocks.md §3.6).
 */
import { ref } from 'vue'
import { DzBreadcrumb, DzBreadcrumbItem, DzHeading, DzSegmented, DzSelect, DzText } from '@dzup-ui/core'
import type { DzSelectItem, SegmentedItem } from '@dzup-ui/core'

const sortOptions: DzSelectItem[] = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: low to high', value: 'price-asc' },
  { label: 'Price: high to low', value: 'price-desc' },
  { label: 'Top rated', value: 'rating' },
]

const viewOptions: SegmentedItem[] = [
  { label: 'Grid', value: 'grid' },
  { label: 'List', value: 'list' },
]

const sort = ref('featured')
const view = ref('grid')
const resultCount = 248
</script>

<template>
  <section class="ch-wrap" aria-labelledby="ch-title">
    <DzBreadcrumb aria-label="Category" class="ch-crumbs">
      <DzBreadcrumbItem href="#">Home</DzBreadcrumbItem>
      <DzBreadcrumbItem href="#">Clothing</DzBreadcrumbItem>
      <DzBreadcrumbItem :current="true">T-Shirts</DzBreadcrumbItem>
    </DzBreadcrumb>

    <div class="ch-title-row">
      <div class="ch-title-group">
        <DzHeading id="ch-title" :level="4" size="2xl" weight="bold" class="ch-heading">Men’s T-Shirts</DzHeading>
        <DzText size="sm" tone="muted" as="span">{{ resultCount }} products</DzText>
      </div>

      <div class="ch-controls">
        <label class="ch-sort">
          <DzText size="sm" tone="muted" as="span" class="ch-sort-label">Sort by</DzText>
          <DzSelect
            v-model="sort"
            :items="sortOptions"
            size="sm"
            aria-label="Sort products"
            class="ch-select"
          />
        </label>

        <DzSegmented
          v-model="view"
          :items="viewOptions"
          size="sm"
          aria-label="View layout"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.ch-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-4, 1rem);
  padding: clamp(1.25rem, 4vw, 2rem);
  background: var(--dz-background, #fff);
}

.ch-crumbs {
  margin: 0;
}

.ch-title-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--dz-space-4, 1rem);
  flex-wrap: wrap;
}

.ch-title-group {
  display: flex;
  align-items: baseline;
  gap: var(--dz-space-3, 0.75rem);
  flex-wrap: wrap;
  min-width: 0;
}

.ch-heading {
  margin: 0;
  letter-spacing: -0.01em;
}

.ch-controls {
  display: flex;
  align-items: center;
  gap: var(--dz-space-3, 0.75rem);
  flex-wrap: wrap;
}

.ch-sort {
  display: inline-flex;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
}

.ch-sort-label {
  white-space: nowrap;
}

.ch-select {
  min-width: 11rem;
}

@media (max-width: 560px) {
  .ch-title-row {
    align-items: flex-start;
  }

  .ch-controls {
    width: 100%;
    justify-content: space-between;
  }

  .ch-select {
    min-width: 0;
  }
}
</style>
```
