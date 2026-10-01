<script setup lang="ts">
import type { ColumnDef } from './DzDataGrid.types.ts'
/**
 * DzDataGridBody — Internal body sub-part for DzDataGrid.
 *
 * Renders data rows with selection and cell rendering.
 * Injects DzDataGrid context (ADR-08).
 */
import { computed, inject } from 'vue'
import { cn } from '../../utilities/cn.ts'
import DzCheckbox from '../forms/DzCheckbox.vue'
import { DZ_DATA_GRID_KEY } from './DzDataGrid.types.ts'
import { dataGridVariants } from './DzDataGrid.variants.ts'

/**
 * Events emitted by DzDataGridBody.
 *
 * Named rather than inline so the `Dz…Emits` recovery can read the members'
 * JSDoc: Vue's `ShortEmits` mapped type erases it before `vue-component-meta`
 * sees it (TASK-N2-A2 finding F-1, TASK-R5-O8).
 */
interface DzDataGridBodyEmits {
  /** Emitted when a row is clicked, with the row and its zero-based index. Fires before selection toggles. */
  rowClick: [row: Record<string, unknown>, index: number]
}

defineOptions({
  inheritAttrs: false,
})

defineProps<{
  /** Key field for row identity */
  rowKey?: string
}>()

const emit = defineEmits<DzDataGridBodyEmits>()

defineSlots<{
  /**
   * Override one cell's rendering. Receives the row, its column definition and
   * the raw field value; unfilled, the cell prints `row[column.field]`.
   */
  cell?: (props: {
    row: Record<string, unknown>
    column: ColumnDef<Record<string, unknown>>
    value: unknown
  }) => unknown
}>()

const ctx = inject(DZ_DATA_GRID_KEY, null)
if (!ctx) {
  if (import.meta.env?.DEV) {
    console.warn('[DzDataGridBody] must be used inside a <DzDataGrid> parent.')
  }
}

const styles = computed(() =>
  dataGridVariants({
    size: ctx!.size.value,
    density: ctx!.density.value,
  }),
)

/**
 * How many cells precede the first data column — `1` when the selection cell
 * renders, `0` otherwise.
 *
 * The cell address the roving `tabindex` is asked about is the position in the
 * `<tr>`, because that is the address `useDataGridNavigation` computes from
 * `HTMLTableRowElement.cells`. Adding the offset here rather than in the
 * composable keeps the two halves reading the same coordinate.
 */
const selectionOffset = computed(() => (ctx!.selectable.value === 'multiple' ? 1 : 0))

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
  if (ctx!.selectable.value) {
    ctx!.toggleRowSelection(row)
  }
}
</script>

<template>
  <tbody data-part="body" :class="styles.body()" role="rowgroup">
    <tr
      v-for="(row, index) in ctx!.data.value"
      :key="rowKey ? String(row[rowKey]) : index"
      data-part="row"
      :class="cn(styles.row(), ctx!.isRowSelected(row) ? 'bg-[var(--dz-primary-muted)]' : '')"
      :aria-selected="ctx!.isRowSelected(row) || undefined"
      :data-state="ctx!.isRowSelected(row) ? 'selected' : undefined"
      role="row"
      @click="handleRowClick(row, index)"
    >
      <!--
        The roving `tabindex` behind the six declared `apg: 'grid'` cell rows
        (RESIDUAL-15, `D-RES14-1`): exactly one body cell is in the tab order and
        it follows the user, every other cell is reachable by arrow. The selection
        cell is index 0 when it renders, which is why `isActiveCell` is asked with
        an offset column index on the data cells below.
      -->
      <td
        v-if="ctx!.selectable.value === 'multiple'"
        data-part="cell"
        :class="cn(styles.cell(), 'w-[var(--dz-spacing-10)]')"
        role="gridcell"
        :tabindex="ctx!.isActiveCell(index, 0) ? 0 : -1"
        @keydown="ctx!.onCellKeydown"
      >
        <DzCheckbox
          :model-value="ctx!.isRowSelected(row)"
          size="sm"
          :aria-label="`Select row ${index + 1}`"
          @click.stop
          @update:model-value="ctx!.toggleRowSelection(row)"
        />
      </td>
      <td
        v-for="(col, colIndex) in ctx!.columns.value"
        :key="col.field"
        data-part="cell"
        :class="cn(styles.cell(), getAlignClass(col.align))"
        :style="getColumnStyle(col)"
        role="gridcell"
        :tabindex="ctx!.isActiveCell(index, colIndex + selectionOffset) ? 0 : -1"
        @keydown="ctx!.onCellKeydown"
      >
        <slot name="cell" :row="row" :column="col" :value="row[col.field]">
          {{ row[col.field] }}
        </slot>
      </td>
    </tr>
  </tbody>
</template>
