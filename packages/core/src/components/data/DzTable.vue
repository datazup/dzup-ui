<script setup lang="ts">
import type { DzTableContext, DzTableEmits, DzTableProps, DzTableSlots } from './DzTable.types.ts'
/**
 * DzTable — Compound semantic table root component.
 *
 * Simple styled table wrapper with opt-in column pinning, column resizing, and
 * virtual (windowed) scrolling. For sorting, pagination, and row selection, use
 * DzDataGrid instead.
 *
 * Provides context to DzTableHeader, DzTableBody, DzTableRow, DzTableCell
 * children via provide/inject (ADR-08).
 *
 * @example
 * ```vue
 * <DzTable hoverable>
 *   <DzTableHeader>
 *     <DzTableRow>
 *       <DzTableCell header>Name</DzTableCell>
 *       <DzTableCell header>Email</DzTableCell>
 *     </DzTableRow>
 *   </DzTableHeader>
 *   <DzTableBody>
 *     <DzTableRow>
 *       <DzTableCell>Alice</DzTableCell>
 *       <DzTableCell>alice@example.com</DzTableCell>
 *     </DzTableRow>
 *   </DzTableBody>
 * </DzTable>
 * ```
 */
import { computed, provide, ref, toRef, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_TABLE_KEY } from './DzTable.types.ts'
import { tableVariants } from './DzTable.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzTableProps>(), {
  size: 'md',
  variant: 'default',
  striped: false,
  hoverable: false,
  density: 'default',
  loading: false,
  captionVisible: false,
  virtualScroll: false,
  rowHeight: 44,
  maxHeight: undefined,
  overscan: 4,
})

const emit = defineEmits<DzTableEmits>()

defineSlots<DzTableSlots>()

const attrs = useAttrs()

const expandedRows = ref<Set<string>>(new Set())

function toggleExpand(rowId: string): void {
  const next = new Set(expandedRows.value)
  if (next.has(rowId)) {
    next.delete(rowId)
    expandedRows.value = next
    emit('rowCollapse', rowId)
  }
  else {
    next.add(rowId)
    expandedRows.value = next
    emit('rowExpand', rowId)
  }
}

// ── Column resizing ──────────────────────────────────────────────────────
const colWidths = ref<Map<string, number>>(new Map())

function setColWidth(colId: string, width: number): void {
  const next = new Map(colWidths.value)
  next.set(colId, width)
  colWidths.value = next
}

// ── Virtual scroll ───────────────────────────────────────────────────────
const scrollEl = ref<HTMLElement | null>(null)
const scrollTop = ref(0)
/** Measured viewport height; `0` = not yet laid out (falls back to maxHeight). */
const measuredViewportHeight = ref(0)

const isVirtual = computed(() => props.virtualScroll)

/** Parse a px length like `'400px'` → 400; returns 0 for non-px units. */
function parsePx(value: string | undefined): number {
  if (!value)
    return 0
  const match = /^(\d+(?:\.\d+)?)px$/.exec(value.trim())
  return match ? Number(match[1]) : 0
}

/**
 * Viewport height windowing assumes. Prefers the measured height once laid out;
 * otherwise falls back to `maxHeight` (or the 400px default) so the first render
 * already windows correctly instead of rendering every row.
 */
const effectiveViewportHeight = computed(() =>
  measuredViewportHeight.value > 0
    ? measuredViewportHeight.value
    : parsePx(props.maxHeight ?? '400px') || 400,
)

function onScroll(): void {
  const el = scrollEl.value
  if (!el)
    return
  scrollTop.value = el.scrollTop
  if (el.clientHeight > 0)
    measuredViewportHeight.value = el.clientHeight
}

const context: DzTableContext = {
  size: toRef(() => props.size),
  striped: toRef(() => props.striped),
  hoverable: toRef(() => props.hoverable),
  density: toRef(() => props.density),
  loading: toRef(() => props.loading),
  expandedRows,
  toggleExpand,
  colWidths,
  setColWidth,
  virtualScroll: isVirtual,
  rowHeight: toRef(() => props.rowHeight),
  overscan: toRef(() => props.overscan),
  scrollTop,
  viewportHeight: effectiveViewportHeight,
}

provide(DZ_TABLE_KEY, context)

const styles = computed(() =>
  tableVariants({
    variant: props.variant,
    size: props.size,
    density: props.density,
    hoverable: props.hoverable,
  }),
)

const rootClasses = computed(() => cn('relative overflow-auto', attrs.class as string | undefined))

const rootStyle = computed(() => {
  const base = 'contain: layout style'
  if (isVirtual.value)
    return `${base}; overflow-y: auto; max-height: ${props.maxHeight ?? '400px'}`
  return base
})

const tableClasses = computed(() => styles.value.root())
</script>

<template>
  <div
    ref="scrollEl"
    :class="rootClasses"
    :data-state="loading ? 'loading' : 'ready'"
    :data-loading="loading ? '' : undefined"
    :data-virtual="virtualScroll ? '' : undefined"
    :style="rootStyle"
    v-bind="{ ...$attrs, class: undefined }"
    @scroll="isVirtual ? onScroll() : undefined"
  >
    <table
      :id="id"
      :class="tableClasses"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabelledby"
      :aria-describedby="ariaDescribedby"
      :aria-busy="loading || undefined"
      role="table"
    >
      <caption v-if="$slots.caption" :class="captionVisible ? undefined : 'sr-only'">
        <slot name="caption" />
      </caption>
      <slot />
    </table>
  </div>
</template>
