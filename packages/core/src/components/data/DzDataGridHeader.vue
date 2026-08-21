<script setup lang="ts">
import type { DzSelectItem } from '../forms/DzSelect.types.ts'
import type { FilterOperator } from './DzDataGrid.types.ts'
import { Filter } from 'lucide-vue-next'
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
import { useComponentMessages } from '../../i18n/useComponentMessages.ts'
import { cn } from '../../utilities/cn.ts'
import DzButton from '../buttons/DzButton.vue'
import DzIconButton from '../buttons/DzIconButton.vue'
import DzCheckbox from '../forms/DzCheckbox.vue'
import DzSelect from '../forms/DzSelect.vue'
import DzInput from '../inputs/DzInput.vue'
import { DZ_DATA_GRID_KEY } from './DzDataGrid.types.ts'
import { dataGridVariants } from './DzDataGrid.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const filterPopoverClasses = [
  'absolute top-full left-0 z-50 mt-1',
  'bg-[var(--dz-background)] border border-[var(--dz-border)]',
  'rounded-[var(--dz-radius-md)] shadow-[var(--dz-shadow-md)]',
  'p-[var(--dz-spacing-3)] min-w-[200px]',
].join(' ')

/** Operator options for number filters */
const operatorItems: DzSelectItem[] = [
  { label: 'Equals', value: 'equals' },
  { label: 'Greater than', value: 'gt' },
  { label: 'Less than', value: 'lt' },
  { label: 'Greater or equal', value: 'gte' },
  { label: 'Less or equal', value: 'lte' },
]

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
  handleHeaderClick,
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

// User-visible strings, resolved against the application's catalog (ADR-20).
const dzMessages = useComponentMessages('DzDataGridHeader')
</script>

<template>
  <thead :class="styles.header()" role="rowgroup">
    <tr :class="styles.headerRow()" role="row">
      <th
        v-if="ctx!.selectable.value === 'multiple'"
        :class="cn(styles.headerCell(), 'w-[var(--dz-spacing-10)]')"
        role="columnheader"
      >
        <DzCheckbox
          :model-value="ctx!.isAllSelected.value"
          :indeterminate="ctx!.isSomeSelected.value"
          size="sm"
          :aria-label="dzMessages.selectAllRows"
          @update:model-value="ctx!.toggleAllSelection()"
        />
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
        @click="ctx!.sortable.value && col.sortable !== false ? handleHeaderClick($event, col.field) : undefined"
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
          <DzIconButton
            v-if="isColumnFilterable(col)"
            :icon="Filter"
            :aria-label="`Filter ${col.header}`"
            variant="ghost"
            size="xs"
            :tone="hasActiveFilter(col.field) ? 'primary' : 'neutral'"
            :data-active="hasActiveFilter(col.field) ? '' : undefined"
            data-testid="filter-trigger"
            @click="toggleFilterPopover($event, col.field)"
            @keydown.escape="openFilterField = null"
          />
        </span>

        <!-- Filter popover -->
        <div
          v-if="isColumnFilterable(col) && openFilterField === col.field"
          :class="filterPopoverClasses"
          role="dialog"
          :ariaLabel="`Filter ${col.header}`"
          data-testid="filter-popover"
          @click.stop
          @keydown="handleFilterKeyDown"
        >
          <!-- Text filter -->
          <template v-if="(col.filterType ?? 'text') === 'text'">
            <DzInput
              :model-value="String(getFilterValue(col.field))"
              size="sm"
              placeholder="Filter..."
              :aria-label="`Filter ${col.header} by text`"
              data-testid="filter-text-input"
              @update:model-value="handleFilterInput(col.field, $event, col)"
              @keydown="handleFilterKeyDown"
            />
          </template>

          <!-- Number filter -->
          <template v-else-if="col.filterType === 'number'">
            <div class="flex flex-col gap-[var(--dz-spacing-2)]">
              <DzSelect
                :model-value="getFilterOperator(col.field)"
                :items="operatorItems"
                size="sm"
                :aria-label="`Filter operator for ${col.header}`"
                data-testid="filter-operator-select"
                @update:model-value="handleOperatorChange(col.field, $event as FilterOperator)"
              />
              <DzInput
                :model-value="String(getFilterValue(col.field))"
                size="sm"
                placeholder="Value..."
                :aria-label="`Filter ${col.header} by number`"
                data-testid="filter-number-input"
                @update:model-value="handleFilterInput(col.field, $event, col)"
                @keydown="handleFilterKeyDown"
              />
            </div>
          </template>

          <!-- Select filter -->
          <template v-else-if="col.filterType === 'select'">
            <DzSelect
              :model-value="String(getFilterValue(col.field))"
              :items="[{ label: 'All', value: '' }, ...(col.filterOptions ?? []).map((o: string) => ({ label: o, value: o }))]"
              size="sm"
              :aria-label="`Filter ${col.header} by selection`"
              data-testid="filter-select-input"
              @update:model-value="handleFilterInput(col.field, $event, col)"
            />
          </template>

          <!-- Clear filter button -->
          <DzButton
            v-if="hasActiveFilter(col.field)"
            variant="ghost"
            size="sm"
            tone="neutral"
            class="mt-[var(--dz-spacing-2)] w-full"
            data-testid="filter-clear-button"
            @click="handleClearFilter($event, col.field)"
          >
            Clear filter
          </DzButton>
        </div>
      </th>
    </tr>
  </thead>
</template>
