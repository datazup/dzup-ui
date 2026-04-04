<script setup lang="ts">
import type { FilterOperator } from './DzDataGrid.types.ts'
/**
 * DzDataGridHeader — Internal header sub-part for DzDataGrid.
 *
 * Renders column headers with sort indicators, select-all checkbox,
 * and column filter UI (when filterable is enabled).
 * Injects DzDataGrid context (ADR-08).
 * Logic extracted to useDataGridHeader composable.
 */
import { computed, inject } from 'vue'
import { useDataGridHeader } from '../../composables/useDataGridHeader/index.ts'
import { cn } from '../../utilities/cn.ts'
import { DZ_DATA_GRID_KEY } from './DzDataGrid.types.ts'
import { dataGridVariants } from './DzDataGrid.variants.ts'

const ctx = inject(DZ_DATA_GRID_KEY, null)
if (!ctx) {
  if (import.meta.env?.DEV) {
    console.warn('[DzDataGridHeader] must be used inside a <DzDataGrid> parent.')
  }
}

const styles = computed(() =>
  dataGridVariants({
    size: ctx!.size.value,
    density: ctx!.density.value,
  }),
)

const {
  openFilterField,
  getAlignClass,
  getColumnStyle,
  handleHeaderKeyDown,
  isColumnFilterable,
  hasActiveFilter,
  getFilterValue,
  getFilterOperator,
  toggleFilterPopover,
  handleFilterInput,
  handleOperatorChange,
  handleFilterKeyDown,
  handleClearFilter,
} = useDataGridHeader({ ctx: ctx! })
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <thead :class="styles.header()">
    <tr :class="styles.headerRow()" role="row">
      <th
        v-if="ctx!.selectable.value === 'multiple'"
        :class="cn(styles.headerCell(), 'w-[var(--dz-spacing-10)]')"
        role="columnheader"
      >
        <input
          type="checkbox"
          :class="styles.checkbox()"
          :checked="ctx!.isAllSelected.value"
          :indeterminate="ctx!.isSomeSelected.value"
          aria-label="Select all rows"
          @change="ctx!.toggleAllSelection()"
        >
      </th>
      <th
        v-for="col in ctx!.columns.value"
        :key="col.field"
        :class="cn(styles.headerCell(), getAlignClass(col.align), 'relative')"
        :style="getColumnStyle(col)"
        :aria-sort="
          ctx!.sortModel.value.find(s => s.field === col.field)?.direction === 'asc' ? 'ascending'
          : ctx!.sortModel.value.find(s => s.field === col.field)?.direction === 'desc' ? 'descending'
            : ctx!.sortable.value && col.sortable !== false ? 'none'
              : undefined
        "
        :tabindex="ctx!.sortable.value && col.sortable !== false ? 0 : undefined"
        role="columnheader"
        @click="ctx!.sortable.value && col.sortable !== false ? ctx!.sort(col.field) : undefined"
        @keydown="ctx!.sortable.value && col.sortable !== false ? handleHeaderKeyDown($event, col.field) : undefined"
      >
        <span class="inline-flex items-center gap-[var(--dz-spacing-1)]">
          {{ col.header }}
          <span
            v-if="ctx!.sortable.value && col.sortable !== false"
            :class="styles.sortIcon()"
            aria-hidden="true"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
              <path v-if="!ctx!.sortModel.value.find(s => s.field === col.field)" d="M7 15l5 5 5-5M7 9l5-5 5 5" />
              <path v-else-if="ctx!.sortModel.value.find(s => s.field === col.field)?.direction === 'asc'" d="M7 14l5-5 5 5" />
              <path v-else d="M7 10l5 5 5-5" />
            </svg>
          </span>
          <!-- Filter icon button -->
          <button
            v-if="isColumnFilterable(col)"
            type="button"
            :class="cn(
              'inline-flex items-center justify-center h-5 w-5 rounded-[var(--dz-radius-sm)]',
              'hover:bg-[var(--dz-muted)] transition-[var(--dz-transition-fast)]',
              hasActiveFilter(col.field) ? 'text-[var(--dz-primary)]' : 'text-[var(--dz-muted-foreground)]',
            )"
            :aria-label="`Filter ${col.header}`"
            :data-active="hasActiveFilter(col.field) ? '' : undefined"
            data-testid="filter-trigger"
            @click="toggleFilterPopover($event, col.field)"
            @keydown.escape="openFilterField = null"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5" aria-hidden="true">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" :fill="hasActiveFilter(col.field) ? 'currentColor' : 'none'" />
            </svg>
          </button>
        </span>

        <!-- Filter popover -->
        <div
          v-if="isColumnFilterable(col) && openFilterField === col.field"
          :class="cn(
            'absolute top-full left-0 z-50 mt-1',
            'bg-[var(--dz-background)] border border-[var(--dz-border)]',
            'rounded-[var(--dz-radius-md)] shadow-[var(--dz-shadow-md)]',
            'p-[var(--dz-spacing-3)] min-w-[200px]',
          )"
          role="dialog"
          :aria-label="`Filter ${col.header}`"
          data-testid="filter-popover"
          @click.stop
          @keydown="handleFilterKeyDown"
        >
          <!-- Text filter -->
          <template v-if="(col.filterType ?? 'text') === 'text'">
            <input
              type="text"
              :class="cn(
                'w-full px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1)]',
                'border border-[var(--dz-border)] rounded-[var(--dz-radius-sm)]',
                'text-[length:var(--dz-text-sm)] bg-[var(--dz-background)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--dz-ring)]',
              )"
              :value="getFilterValue(col.field)"
              placeholder="Filter..."
              :aria-label="`Filter ${col.header} by text`"
              data-testid="filter-text-input"
              @input="handleFilterInput(col.field, ($event.target as HTMLInputElement).value, col)"
              @keydown="handleFilterKeyDown"
            >
          </template>

          <!-- Number filter -->
          <template v-else-if="col.filterType === 'number'">
            <div class="flex flex-col gap-[var(--dz-spacing-2)]">
              <select
                :class="cn(
                  'w-full px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1)]',
                  'border border-[var(--dz-border)] rounded-[var(--dz-radius-sm)]',
                  'text-[length:var(--dz-text-sm)] bg-[var(--dz-background)]',
                )"
                :value="getFilterOperator(col.field)"
                :aria-label="`Filter operator for ${col.header}`"
                data-testid="filter-operator-select"
                @change="handleOperatorChange(col.field, ($event.target as HTMLSelectElement).value as FilterOperator)"
              >
                <option value="equals">
                  Equals
                </option>
                <option value="gt">
                  Greater than
                </option>
                <option value="lt">
                  Less than
                </option>
                <option value="gte">
                  Greater or equal
                </option>
                <option value="lte">
                  Less or equal
                </option>
              </select>
              <input
                type="number"
                :class="cn(
                  'w-full px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1)]',
                  'border border-[var(--dz-border)] rounded-[var(--dz-radius-sm)]',
                  'text-[length:var(--dz-text-sm)] bg-[var(--dz-background)]',
                  'focus:outline-none focus:ring-2 focus:ring-[var(--dz-ring)]',
                )"
                :value="getFilterValue(col.field)"
                placeholder="Value..."
                :aria-label="`Filter ${col.header} by number`"
                data-testid="filter-number-input"
                @input="handleFilterInput(col.field, ($event.target as HTMLInputElement).value, col)"
                @keydown="handleFilterKeyDown"
              >
            </div>
          </template>

          <!-- Select filter -->
          <template v-else-if="col.filterType === 'select'">
            <select
              :class="cn(
                'w-full px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1)]',
                'border border-[var(--dz-border)] rounded-[var(--dz-radius-sm)]',
                'text-[length:var(--dz-text-sm)] bg-[var(--dz-background)]',
              )"
              :value="getFilterValue(col.field)"
              :aria-label="`Filter ${col.header} by selection`"
              data-testid="filter-select-input"
              @change="handleFilterInput(col.field, ($event.target as HTMLSelectElement).value, col)"
            >
              <option value="">
                All
              </option>
              <option v-for="opt in (col.filterOptions ?? [])" :key="opt" :value="opt">
                {{ opt }}
              </option>
            </select>
          </template>

          <!-- Clear filter button -->
          <button
            v-if="hasActiveFilter(col.field)"
            type="button"
            :class="cn(
              'mt-[var(--dz-spacing-2)] w-full px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1)]',
              'text-[length:var(--dz-text-sm)] text-[var(--dz-muted-foreground)]',
              'border border-[var(--dz-border)] rounded-[var(--dz-radius-sm)]',
              'hover:bg-[var(--dz-muted)] transition-[var(--dz-transition-fast)]',
            )"
            data-testid="filter-clear-button"
            @click="handleClearFilter($event, col.field)"
          >
            Clear filter
          </button>
        </div>
      </th>
    </tr>
  </thead>
</template>

<style scoped>
/* Accessibility: respect user's motion preference */
@media (prefers-reduced-motion: reduce) {
  :deep(*),
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
