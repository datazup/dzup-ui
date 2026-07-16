# Category picker

A hierarchical classification panel — a filterable DzTreeSelect for a nested category, a DzCascader region path (country → state → city), and a DzDateRangePicker availability window.

- **Category:** Forms & Inputs
- **Components:** DzCard, DzTreeSelect, DzCascader, DzDateRangePicker, DzFormField, DzFormLabel, DzFormDescription, DzButton, DzHeading, DzText
- **Preview:** /blocks/category-picker

```vue
<script setup lang="ts">
import {
  DzButton,
  DzCard,
  DzCascader,
  DzDateRangePicker,
  DzFormDescription,
  DzFormField,
  DzFormLabel,
  DzHeading,
  DzText,
  DzTreeSelect,
} from '@dzup-ui/core'
import type { DateRangeValue, DzCascaderOption } from '@dzup-ui/core'
import { ref } from 'vue'

/**
 * Category picker — a hierarchical classification panel.
 *
 * Three "deep selection" controls in one form: a filterable DzTreeSelect for a
 * nested department/category, a DzCascader for a region path (country → state →
 * city), and a DzDateRangePicker for an effective window. The tree `nodes` and
 * cascader `options` are plain nested data. Local ref() state only.
 *
 * Forms family: DzTreeSelect, DzCascader, DzDateRangePicker, DzFormField,
 * DzFormLabel, DzFormDescription.
 */

const category = ref<string | undefined>(undefined)
const expandedKeys = ref<string[]>(['product'])
const region = ref<string[]>([])
const window = ref<DateRangeValue>({ start: '', end: '' })

/** Nested category tree (TreeNode shape: `key` + `label` + optional `children`). */
const CATEGORY_NODES = [
  {
    key: 'product',
    label: 'Product',
    children: [
      { key: 'apparel', label: 'Apparel' },
      { key: 'footwear', label: 'Footwear' },
      { key: 'accessories', label: 'Accessories' },
    ],
  },
  {
    key: 'home',
    label: 'Home & Living',
    children: [
      { key: 'furniture', label: 'Furniture' },
      { key: 'kitchen', label: 'Kitchen' },
    ],
  },
  {
    key: 'digital',
    label: 'Digital',
    children: [
      { key: 'ebooks', label: 'E-books' },
      { key: 'software', label: 'Software' },
    ],
  },
]

const REGION_OPTIONS: DzCascaderOption[] = [
  {
    label: 'United States',
    value: 'us',
    children: [
      {
        label: 'California',
        value: 'ca',
        children: [
          { label: 'San Francisco', value: 'sf' },
          { label: 'Los Angeles', value: 'la' },
        ],
      },
      {
        label: 'New York',
        value: 'ny',
        children: [{ label: 'New York City', value: 'nyc' }],
      },
    ],
  },
  {
    label: 'Germany',
    value: 'de',
    children: [
      {
        label: 'Bavaria',
        value: 'by',
        children: [{ label: 'Munich', value: 'muc' }],
      },
    ],
  },
]
</script>

<template>
  <section class="cp-wrap" aria-labelledby="cp-title">
    <DzCard variant="elevated" padding="lg" class="cp-card">
      <header class="cp-head">
        <DzHeading id="cp-title" :level="4" size="xl" weight="semibold">
          Classify listing
        </DzHeading>
        <DzText tone="muted" size="sm" as="p">
          Place this item in the catalog and set where and when it goes live.
        </DzText>
      </header>

      <form class="cp-form" @submit.prevent>
        <DzFormField required>
          <DzFormLabel>Category</DzFormLabel>
          <DzTreeSelect
            v-model:value="category"
            v-model:expanded-keys="expandedKeys"
            :nodes="CATEGORY_NODES"
            selection-mode="single"
            filter
            placeholder="Choose a category"
            aria-label="Category"
          />
          <DzFormDescription>Pick the most specific branch that applies.</DzFormDescription>
        </DzFormField>

        <DzFormField required>
          <DzFormLabel>Region</DzFormLabel>
          <DzCascader
            v-model:value="region"
            :options="REGION_OPTIONS"
            filter
            placeholder="Country / State / City"
            aria-label="Region"
          />
        </DzFormField>

        <DzFormField>
          <DzFormLabel>Availability window</DzFormLabel>
          <DzDateRangePicker
            v-model="window"
            placeholder="Start — End"
            aria-label="Availability window"
          />
          <DzFormDescription>Leave empty to publish immediately and indefinitely.</DzFormDescription>
        </DzFormField>

        <DzButton type="submit" variant="solid" tone="primary" class="cp-submit">
          Save classification
        </DzButton>
      </form>
    </DzCard>
  </section>
</template>

<style scoped>
.cp-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1.5rem, 5vw, 3rem) var(--dz-space-4, 1rem);
  min-height: 100%;
  background: var(--dz-background, #fff);
}

.cp-card {
  width: 100%;
  max-width: 32rem;
}

.cp-head {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-1, 0.25rem);
  margin-bottom: var(--dz-space-5, 1.25rem);
}

.cp-form {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-4, 1rem);
}

.cp-submit {
  width: 100%;
  margin-top: var(--dz-space-1, 0.25rem);
}
</style>
```
