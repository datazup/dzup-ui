<script setup lang="ts">
import type { ColumnDef, DzDataGridContext } from './DzDataGrid.types.ts'
/**
 * DzDataGridHeader — Internal header sub-part for DzDataGrid.
 *
 * Renders column headers with sort indicators and select-all checkbox.
 * Injects DzDataGrid context (ADR-08).
 */
import { computed, inject } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_DATA_GRID_KEY } from './DzDataGrid.types.ts'
import { dataGridVariants } from './DzDataGrid.variants.ts'

const ctx = inject(DZ_DATA_GRID_KEY) as DzDataGridContext

const styles = computed(() =>
  dataGridVariants({
    size: ctx.size.value,
    density: ctx.density.value,
  }),
)

function getAlignClass(align?: 'left' | 'center' | 'right'): string {
  if (align === 'center')
    return 'text-center'
  if (align === 'right')
    return 'text-right'
  return 'text-left'
}

function getColumnStyle(col: ColumnDef<Record<string, unknown>>): string | undefined {
  if (!col.width)
    return undefined
  const w = typeof col.width === 'number' ? `${col.width}px` : col.width
  return `width: ${w}; min-width: ${w}`
}

function handleHeaderKeyDown(event: KeyboardEvent, field: string): void {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    ctx.sort(field)
  }
}
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
        v-if="ctx.selectable.value === 'multiple'"
        :class="cn(styles.headerCell(), 'w-[var(--dz-spacing-10)]')"
        role="columnheader"
      >
        <input
          type="checkbox"
          :class="styles.checkbox()"
          :checked="ctx.isAllSelected.value"
          :indeterminate="ctx.isSomeSelected.value"
          aria-label="Select all rows"
          @change="ctx.toggleAllSelection()"
        >
      </th>
      <th
        v-for="col in ctx.columns.value"
        :key="col.field"
        :class="cn(styles.headerCell(), getAlignClass(col.align))"
        :style="getColumnStyle(col)"
        :aria-sort="
          ctx.sortModel.value.find(s => s.field === col.field)?.direction === 'asc' ? 'ascending'
          : ctx.sortModel.value.find(s => s.field === col.field)?.direction === 'desc' ? 'descending'
            : ctx.sortable.value && col.sortable !== false ? 'none'
              : undefined
        "
        :tabindex="ctx.sortable.value && col.sortable !== false ? 0 : undefined"
        role="columnheader"
        @click="ctx.sortable.value && col.sortable !== false ? ctx.sort(col.field) : undefined"
        @keydown="ctx.sortable.value && col.sortable !== false ? handleHeaderKeyDown($event, col.field) : undefined"
      >
        <span class="inline-flex items-center gap-[var(--dz-spacing-1)]">
          {{ col.header }}
          <span
            v-if="ctx.sortable.value && col.sortable !== false"
            :class="styles.sortIcon()"
            aria-hidden="true"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
              <path v-if="!ctx.sortModel.value.find(s => s.field === col.field)" d="M7 15l5 5 5-5M7 9l5-5 5 5" />
              <path v-else-if="ctx.sortModel.value.find(s => s.field === col.field)?.direction === 'asc'" d="M7 14l5-5 5 5" />
              <path v-else d="M7 10l5 5 5-5" />
            </svg>
          </span>
        </span>
      </th>
    </tr>
  </thead>
</template>
