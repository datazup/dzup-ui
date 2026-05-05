<script setup lang="ts" generic="T extends Record<string, unknown>">
import type {
  ColumnDef,
  DzDataGridContext,
  DzDataGridEmits,
  DzDataGridFilter,
  DzDataGridProps,
  DzDataGridSlots,
  PaginationConfig,
} from './DzDataGrid.types.ts'
/**
 * DzDataGrid — Compound data grid root component.
 *
 * The most complex core component. Phase 1: sorting, pagination, row selection.
 * Uses useDataGrid composable for state management.
 * Composes DzDataGridHeader, DzDataGridBody, DzDataGridPagination sub-parts.
 *
 * Provides context to sub-parts via inject (ADR-08).
 *
 * @example
 * ```vue
 * <DzDataGrid :data="users" :columns="columns" sortable pagination selectable="multiple">
 *   <template #empty>No users found</template>
 * </DzDataGrid>
 * ```
 */
import { computed, provide, toRef, useAttrs } from 'vue'
import { useDataGrid } from '../../composables/useDataGrid/useDataGrid.ts'
import { cn } from '../../utilities/cn.ts'
import { DZ_DATA_GRID_KEY } from './DzDataGrid.types.ts'
import { dataGridVariants } from './DzDataGrid.variants.ts'
import DzDataGridBody from './DzDataGridBody.vue'
import DzDataGridHeader from './DzDataGridHeader.vue'
import DzDataGridPagination from './DzDataGridPagination.vue'

const props = withDefaults(defineProps<DzDataGridProps<T>>(), {
  loading: false,
  sortable: false,
  sortModel: () => [],
  filterable: false,
  filters: () => [],
  pagination: false,
  selectable: false,
  selectedRows: () => [],
  density: 'default',
  size: 'md',
  rowKey: undefined,
})

const emit = defineEmits<DzDataGridEmits<T>>()
defineSlots<DzDataGridSlots<T>>()

const attrs = useAttrs()

const grid = useDataGrid<T>({
  data: toRef(() => props.data),
  columns: toRef(() => props.columns as ColumnDef<T>[]),
  sortable: toRef(() => props.sortable),
  sortModel: toRef(() => props.sortModel ?? []),
  filterable: toRef(() => props.filterable),
  filters: toRef(() => props.filters ?? []),
  pagination: toRef(() => props.pagination),
  selectable: toRef(() => props.selectable),
  selectedRows: toRef(() => props.selectedRows ?? []),
  rowKey: props.rowKey,
  onSortChange: (model) => {
    emit('update:sortModel', model)
    emit('sort', model)
  },
  onFilterChange: (filterState: DzDataGridFilter[]) => {
    emit('update:filters', filterState)
    emit('filter', filterState)
  },
  onSelectionChange: (rows) => {
    emit('update:selectedRows', rows)
  },
  onPageChange: (page) => {
    emit('pageChange', page)
  },
  onPageSizeChange: (size) => {
    emit('pageSizeChange', size)
  },
})

const context: DzDataGridContext = {
  columns: toRef(() => props.columns) as DzDataGridContext['columns'],
  data: toRef(() => grid.displayData.value) as DzDataGridContext['data'],
  density: toRef(() => props.density),
  size: toRef(() => props.size),
  sortable: toRef(() => props.sortable),
  sortModel: grid.sortModel as DzDataGridContext['sortModel'],
  filterable: toRef(() => props.filterable),
  filters: grid.filters as DzDataGridContext['filters'],
  selectable: toRef(() => props.selectable),
  selectedRows: grid.selectedRows as DzDataGridContext['selectedRows'],
  loading: toRef(() => props.loading),
  sort: grid.sort,
  setFilter: grid.setFilter,
  clearFilter: grid.clearFilter,
  clearAllFilters: grid.clearAllFilters,
  toggleRowSelection: grid.toggleRowSelection as DzDataGridContext['toggleRowSelection'],
  toggleAllSelection: grid.toggleAllSelection,
  isRowSelected: grid.isRowSelected as DzDataGridContext['isRowSelected'],
  isAllSelected: grid.isAllSelected,
  isSomeSelected: grid.isSomeSelected,
}

provide(DZ_DATA_GRID_KEY, context)

const styles = computed(() =>
  dataGridVariants({ size: props.size, density: props.density }),
)

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)

const pageSizeOptions = computed<number[]>(() => {
  if (typeof props.pagination === 'object') {
    return (props.pagination as PaginationConfig).pageSizeOptions ?? [10, 25, 50, 100]
  }
  return [10, 25, 50, 100]
})

function handleRowClick(row: Record<string, unknown>, index: number): void {
  emit('rowClick', row as T, index)
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    :class="rootClasses"
    :aria-label="ariaLabel ?? 'Data grid'"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    :aria-busy="loading || undefined"
    :data-state="loading ? 'loading' : 'ready'"
    :data-loading="loading ? '' : undefined"
    role="region"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <!-- Loading overlay -->
    <div v-if="loading && grid.displayData.value.length > 0" :class="styles.loading()">
      <slot name="loading">
        <svg class="animate-spin h-6 w-6 text-[var(--dz-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </slot>
    </div>

    <!-- Empty state -->
    <div v-else-if="!loading && grid.displayData.value.length === 0" :class="styles.empty()">
      <slot name="empty">
        No data available
      </slot>
    </div>

    <!-- Table -->
    <table
      v-else
      :id="id"
      :class="styles.table()"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabelledby"
      :aria-describedby="ariaDescribedby"
      role="grid"
    >
      <DzDataGridHeader />
      <DzDataGridBody :row-key="(rowKey as string | undefined)" @row-click="handleRowClick">
        <template v-if="$slots.cell" #cell="cellProps">
          <!-- @vue-ignore: generic T not preserved across slot forwarding from DzDataGridBody -->
          <slot name="cell" v-bind="cellProps" />
        </template>
      </DzDataGridBody>
    </table>

    <!-- Pagination -->
    <DzDataGridPagination
      v-if="pagination && grid.totalRows.value > 0"
      :page="grid.currentPage.value"
      :page-size="grid.pageSize.value"
      :total="grid.totalRows.value"
      :page-size-options="pageSizeOptions"
      @update:page="grid.goToPage"
      @update:page-size="grid.changePageSize"
    >
      <template v-if="$slots.pagination" #default>
        <slot name="pagination" />
      </template>
    </DzDataGridPagination>
  </div>
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
