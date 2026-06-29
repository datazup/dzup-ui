# Filter sidebar

A product-listing filter rail: search input, category checkbox group, a dual-thumb price range slider with read-out, a minimum-rating radio group, and an in-stock switch, with a live active-filter count.

- **Category:** Forms & Inputs
- **Components:** DzSearchInput, DzCheckboxGroup, DzCheckbox, DzRangeSlider, DzRadioGroup, DzRadio, DzSwitch, DzDivider, DzButton, DzHeading, DzText
- **Preview:** /blocks#filter-panel

```vue
<script setup lang="ts">
import {
  DzButton,
  DzCheckbox,
  DzCheckboxGroup,
  DzDivider,
  DzHeading,
  DzRadio,
  DzRadioGroup,
  DzRangeSlider,
  DzSearchInput,
  DzSwitch,
  DzText,
} from '@dzup-ui/core'
import { computed, ref } from 'vue'

/**
 * Filter panel — a product-listing sidebar of filter controls.
 *
 * A self-contained filter rail: a DzSearchInput, a DzCheckboxGroup of
 * categories, a DzRangeSlider price band with a live read-out, a DzRadioGroup
 * for minimum rating, and a DzSwitch toggle — with a count of active filters
 * and a Reset action. Mirrors a real e-commerce/results sidebar. Local ref()
 * state only.
 *
 * Inputs family: DzSearchInput.
 * Forms family: DzCheckboxGroup, DzCheckbox, DzRangeSlider, DzRadioGroup,
 * DzRadio, DzSwitch.
 */

const query = ref('')
const categories = ref<string[]>(['apparel', 'shoes'])
const price = ref<[number, number]>([25, 180])
const minRating = ref('any')
const inStock = ref(true)

const CATEGORIES = [
  { value: 'apparel', label: 'Apparel' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'bags', label: 'Bags' },
  { value: 'outdoor', label: 'Outdoor' },
]

const priceLabel = computed(() => `$${price.value[0]} – $${price.value[1]}`)

const activeCount = computed(() => {
  let n = categories.value.length
  if (price.value[0] > 0 || price.value[1] < 250) n += 1
  if (minRating.value !== 'any') n += 1
  if (inStock.value) n += 1
  return n
})

function reset() {
  query.value = ''
  categories.value = []
  price.value = [0, 250]
  minRating.value = 'any'
  inStock.value = false
}
</script>

<template>
  <section class="fp-panel" aria-label="Filters">
    <header class="fp-head">
      <DzHeading :level="4" size="md" weight="semibold" class="fp-title">Filters</DzHeading>
      <DzButton
        v-if="activeCount > 0"
        variant="text"
        tone="neutral"
        size="sm"
        @click="reset"
      >
        Reset ({{ activeCount }})
      </DzButton>
    </header>

    <DzSearchInput
      v-model="query"
      placeholder="Search products…"
      clearable
      aria-label="Search products"
    />

    <DzDivider decorative />

    <!-- Category -->
    <div class="fp-group">
      <DzText size="sm" weight="medium" as="div" class="fp-group-title">Category</DzText>
      <DzCheckboxGroup v-model="categories" orientation="vertical" aria-label="Category">
        <DzCheckbox
          v-for="cat in CATEGORIES"
          :key="cat.value"
          :value="cat.value"
          size="sm"
        >
          {{ cat.label }}
        </DzCheckbox>
      </DzCheckboxGroup>
    </div>

    <DzDivider decorative />

    <!-- Price -->
    <div class="fp-group">
      <div class="fp-group-row">
        <DzText size="sm" weight="medium" as="div" class="fp-group-title">Price</DzText>
        <span class="fp-readout">{{ priceLabel }}</span>
      </div>
      <DzRangeSlider
        v-model="price"
        :min="0"
        :max="250"
        :step="5"
        tone="primary"
        aria-label="Price range"
      />
    </div>

    <DzDivider decorative />

    <!-- Rating -->
    <div class="fp-group">
      <DzText size="sm" weight="medium" as="div" class="fp-group-title">Minimum rating</DzText>
      <DzRadioGroup v-model="minRating" orientation="vertical" aria-label="Minimum rating">
        <DzRadio value="any" size="sm">Any rating</DzRadio>
        <DzRadio value="4" size="sm">4 stars &amp; up</DzRadio>
        <DzRadio value="3" size="sm">3 stars &amp; up</DzRadio>
      </DzRadioGroup>
    </div>

    <DzDivider decorative />

    <!-- Availability -->
    <div class="fp-switch-row">
      <div class="fp-switch-copy">
        <DzText size="sm" weight="medium" as="div">In stock only</DzText>
        <DzText size="xs" tone="muted" as="div">Hide sold-out items</DzText>
      </div>
      <DzSwitch v-model="inStock" aria-label="In stock only" />
    </div>

    <DzButton variant="solid" tone="primary" class="fp-apply">
      Show results
    </DzButton>
  </section>
</template>

<style scoped>
.fp-panel {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-4, 1rem);
  width: 100%;
  max-width: 19rem;
  padding: var(--dz-space-5, 1.25rem);
  border: 1px solid var(--dz-border, #e5e7eb);
  border-radius: var(--dz-radius-lg, 0.75rem);
  background: var(--dz-surface, #fff);
  box-shadow: var(--dz-shadow-sm, 0 1px 2px rgb(0 0 0 / 0.06));
}

.fp-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dz-space-2, 0.5rem);
}

.fp-title {
  margin: 0;
}

.fp-group {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-3, 0.75rem);
}

.fp-group-title {
  margin: 0;
}

.fp-group-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--dz-space-2, 0.5rem);
}

.fp-readout {
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--dz-primary, #4f46e5);
}

.fp-switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dz-space-3, 0.75rem);
}

.fp-switch-copy {
  line-height: 1.3;
  min-width: 0;
}

.fp-apply {
  width: 100%;
  margin-top: var(--dz-space-1, 0.25rem);
}
</style>
```
