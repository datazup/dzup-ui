<script setup lang="ts">
import type { ColumnDef, DzDataGridContext } from './DzDataGrid.types.ts'
/**
 * DzDataGridBody — Internal body sub-part for DzDataGrid.
 *
 * Renders data rows with selection and cell rendering.
 * Injects DzDataGrid context (ADR-08).
 */
import { computed, inject } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_DATA_GRID_KEY } from './DzDataGrid.types.ts'
import { dataGridVariants } from './DzDataGrid.variants.ts'

defineProps<{
  /** Key field for row identity */
  rowKey?: string
}>()

const emit = defineEmits<{
  rowClick: [row: Record<string, unknown>, index: number]
}>()

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

function handleRowClick(row: Record<string, unknown>, index: number): void {
  emit('rowClick', row, index)
  if (ctx.selectable.value) {
    ctx.toggleRowSelection(row)
  }
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <tbody :class="styles.body()">
    <tr
      v-for="(row, index) in ctx.data.value"
      :key="rowKey ? String(row[rowKey]) : index"
      :class="cn(styles.row(), ctx.isRowSelected(row) ? 'bg-[var(--dz-primary-muted)]' : '')"
      :aria-selected="ctx.isRowSelected(row) || undefined"
      :data-state="ctx.isRowSelected(row) ? 'selected' : undefined"
      role="row"
      @click="handleRowClick(row, index)"
    >
      <td
        v-if="ctx.selectable.value === 'multiple'"
        :class="cn(styles.cell(), 'w-[var(--dz-spacing-10)]')"
        role="gridcell"
      >
        <input
          type="checkbox"
          :class="styles.checkbox()"
          :checked="ctx.isRowSelected(row)"
          :aria-label="`Select row ${index + 1}`"
          @click.stop
          @change="ctx.toggleRowSelection(row)"
        >
      </td>
      <td
        v-for="col in ctx.columns.value"
        :key="col.field"
        :class="cn(styles.cell(), getAlignClass(col.align))"
        :style="getColumnStyle(col)"
        role="gridcell"
      >
        <slot name="cell" :row="row" :column="col" :value="row[col.field]">
          {{ row[col.field] }}
        </slot>
      </td>
    </tr>
  </tbody>
</template>
