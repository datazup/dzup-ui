<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { DzTableCellProps, DzTableCellSlots } from './DzTable.types.ts'
/**
 * DzTableCell — Table cell (<td> or <th>).
 *
 * Child of DzTable compound component. Inherits context via inject.
 *
 * Supports:
 * - Column pinning: `pin="left|right"` sticks the cell to the scroll-container
 *   edge; `pinOffset` stacks multiple pinned columns; `pinBoundary` adds the
 *   edge shadow separating pinned from scrolling content.
 * - Column resizing: on a header cell, `resizable` + `colId` render a drag handle
 *   whose pointer drag writes the column width into context; body cells sharing
 *   the `colId` adopt that width.
 */
import { computed, inject, ref, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_TABLE_KEY } from './DzTable.types.ts'
import { tableVariants } from './DzTable.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzTableCellProps>(), {
  header: false,
  align: 'left',
  colspan: undefined,
  rowspan: undefined,
  pin: undefined,
  pinOffset: 0,
  pinBoundary: false,
  colId: undefined,
  resizable: false,
})

defineSlots<DzTableCellSlots>()

const attrs = useAttrs()
const tableContext = inject(DZ_TABLE_KEY, null)

const styles = computed(() =>
  tableVariants({
    variant: 'default',
    size: tableContext?.size.value ?? 'md',
    density: tableContext?.density.value ?? 'default',
  }),
)

const alignClass = computed(() => {
  const map: Record<string, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }
  return map[props.align] ?? 'text-left'
})

// ── Column pinning ───────────────────────────────────────────────────────
const isPinned = computed(() => props.pin != null)

const pinClasses = computed(() =>
  isPinned.value
    ? cn(
        'sticky z-[var(--dz-z-sticky)] bg-[var(--dz-background)]',
        props.header && 'bg-[var(--dz-muted)]',
        props.pinBoundary && props.pin === 'left' && 'shadow-[inset_-4px_0_var(--dz-shadow-xs)]',
        props.pinBoundary && props.pin === 'right' && 'shadow-[inset_4px_0_var(--dz-shadow-xs)]',
      )
    : '',
)

// ── Column resizing ──────────────────────────────────────────────────────
/** Width (px) resolved for this cell's column, if any. */
const resolvedWidth = computed<number | undefined>(() =>
  props.colId != null ? tableContext?.colWidths.value.get(props.colId) : undefined,
)

/** Whether this cell should render an interactive resize handle. */
const showResizeHandle = computed(() => props.header && props.resizable && props.colId != null)

const cellStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}
  if (isPinned.value) {
    style.position = 'sticky'
    if (props.pin === 'left') style.left = `${props.pinOffset}px`
    else if (props.pin === 'right') style.right = `${props.pinOffset}px`
  }
  if (resolvedWidth.value != null) {
    style.width = `${resolvedWidth.value}px`
    style.minWidth = `${resolvedWidth.value}px`
    style.maxWidth = `${resolvedWidth.value}px`
  }
  return style
})

const cellEl = ref<HTMLElement | null>(null)
let dragStartX = 0
let dragStartWidth = 0

/** Minimum column width (px), from `--dz-table-col-min-width` (fallback 48). */
function minColWidth(): number {
  const el = cellEl.value
  if (!el) return 48
  const raw = getComputedStyle(el).getPropertyValue('--dz-table-col-min-width').trim()
  const parsed = Number.parseFloat(raw)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 48
}

function onResizeMove(event: PointerEvent): void {
  if (props.colId == null) return
  const delta = event.clientX - dragStartX
  const next = Math.max(minColWidth(), dragStartWidth + delta)
  tableContext?.setColWidth(props.colId, next)
}

function onResizeEnd(event: PointerEvent): void {
  window.removeEventListener('pointermove', onResizeMove)
  window.removeEventListener('pointerup', onResizeEnd)
  ;(event.target as HTMLElement | null)?.releasePointerCapture?.(event.pointerId)
}

function onResizeStart(event: PointerEvent): void {
  if (props.colId == null) return
  event.preventDefault()
  event.stopPropagation()
  dragStartX = event.clientX
  dragStartWidth =
    resolvedWidth.value ?? cellEl.value?.getBoundingClientRect().width ?? minColWidth()
  ;(event.target as HTMLElement | null)?.setPointerCapture?.(event.pointerId)
  window.addEventListener('pointermove', onResizeMove)
  window.addEventListener('pointerup', onResizeEnd)
}

/** Keyboard resize: arrow keys nudge the column width by 8px. */
function onResizeKey(event: KeyboardEvent): void {
  if (props.colId == null) return
  const step = event.shiftKey ? 24 : 8
  const current =
    resolvedWidth.value ?? cellEl.value?.getBoundingClientRect().width ?? minColWidth()
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    tableContext?.setColWidth(props.colId, Math.max(minColWidth(), current - step))
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    tableContext?.setColWidth(props.colId, current + step)
  }
}

const classes = computed(() =>
  cn(
    props.header ? styles.value.headerCell() : styles.value.cell(),
    alignClass.value,
    showResizeHandle.value ? 'relative' : '',
    pinClasses.value,
    attrs.class as string | undefined,
  ),
)
</script>

<template>
  <component
    :is="header ? 'th' : 'td'"
    ref="cellEl"
    :class="classes"
    :style="cellStyle"
    :colspan="colspan"
    :rowspan="rowspan"
    :scope="header ? 'col' : undefined"
    :data-pinned="pin ?? undefined"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
    <button
      v-if="showResizeHandle"
      type="button"
      class="absolute -right-1 top-0 z-10 h-full w-2 cursor-col-resize touch-none select-none bg-transparent hover:bg-[var(--dz-primary)]/40"
      :aria-label="`Resize column`"
      data-dz-resize-handle
      @pointerdown="onResizeStart"
      @keydown="onResizeKey"
      @click.stop
    />
  </component>
</template>
