<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { DzTableCellProps, DzTableCellSlots } from './DzTable.types.ts'
/**
 * DzTableCell — Table cell (`<td>` or `<th>`).
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
import { computed, inject, onMounted, ref, useAttrs } from 'vue'
import { useDzDirection } from '../../composables/provider/useDzLocale.ts'
import { useComponentMessages } from '../../i18n/useComponentMessages.ts'
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

// ArrowLeft and ArrowRight follow the writing direction (ADR-20 §4,
// TASK-R5-O3). This component declares `rtl: { keyboard: 'swap-horizontal' }`
// in its anatomy; until now nothing read the context that makes it true.
const dzDirection = useDzDirection()

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
    if (props.pin === 'left')
      style.left = `${props.pinOffset}px`
    else if (props.pin === 'right')
      style.right = `${props.pinOffset}px`
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
  if (!el)
    return 48
  const raw = getComputedStyle(el).getPropertyValue('--dz-table-col-min-width').trim()
  const parsed = Number.parseFloat(raw)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 48
}

function onResizeMove(event: PointerEvent): void {
  if (props.colId == null)
    return
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
  if (props.colId == null)
    return
  event.preventDefault()
  event.stopPropagation()
  dragStartX = event.clientX
  dragStartWidth
    = resolvedWidth.value ?? cellEl.value?.getBoundingClientRect().width ?? minColWidth()
  ;(event.target as HTMLElement | null)?.setPointerCapture?.(event.pointerId)
  window.addEventListener('pointermove', onResizeMove)
  window.addEventListener('pointerup', onResizeEnd)
}

/** The column's width right now, however it was last established. */
function currentWidth(): number {
  return resolvedWidth.value ?? cellEl.value?.getBoundingClientRect().width ?? minColWidth()
}

/**
 * One resize step, shared by the keyboard path and the pointer path.
 *
 * TASK-R2-O5 / owner decision **D117 option A** (2026-09-19). Before this
 * existed the arithmetic lived inside `onResizeKey`, which is why the column
 * could only be resized by a key or by a drag — the measured WCAG 2.2 SC 2.5.7
 * failure in `packages/core/docs/wcag-deviations.json`. Extracting it is what
 * makes "the pointer step and the keyboard step are the same step" a property
 * of the code rather than a promise in a comment: `Shift` is the larger step on
 * both paths because both call this.
 */
function stepColumn(sign: -1 | 1, large: boolean): void {
  if (props.colId == null)
    return
  const step = large ? 24 : 8
  const next = currentWidth() + sign * step
  // The clamp is applied on the way DOWN only, which is what `onResizeKey` has
  // always done: this extraction moves the arithmetic, it does not change it.
  tableContext?.setColWidth(props.colId, sign === -1 ? Math.max(minColWidth(), next) : next)
}

/** Keyboard resize: arrow keys nudge the column width by 8px. */
function onResizeKey(event: KeyboardEvent): void {
  if (props.colId == null)
    return
  // Narrower is a step back along the INLINE axis: the column's resizable edge
  // is its inline-end, which is on the right in LTR and on the left in RTL.
  const narrowerKey = dzDirection.value === 'rtl' ? 'ArrowRight' : 'ArrowLeft'
  const widerKey = dzDirection.value === 'rtl' ? 'ArrowLeft' : 'ArrowRight'

  if (event.key === narrowerKey) {
    event.preventDefault()
    stepColumn(-1, event.shiftKey)
  }
  else if (event.key === widerKey) {
    event.preventDefault()
    stepColumn(1, event.shiftKey)
  }
}

// ── SC 2.5.7: the single-pointer, non-drag path (D117/A) ───────────────────

/**
 * The width the handle reports as `aria-valuenow`.
 *
 * `role="separator"` with a focusable element is a value-bearing role, so it
 * owes a current value. Until a column has been resized nothing in context
 * holds one, so the rendered width is measured once on mount; after that
 * `resolvedWidth` is the authority and the measurement is never consulted
 * again. There is no authored maximum — `stepColumn` grows without a ceiling —
 * so `aria-valuemax` is deliberately not declared rather than invented.
 */
const measuredWidth = ref<number | null>(null)
/** The floor `stepColumn` clamps to, read once from `--dz-table-col-min-width`. */
const ariaValueMin = ref(48)
onMounted(() => {
  if (!showResizeHandle.value)
    return
  measuredWidth.value = Math.round(cellEl.value?.getBoundingClientRect().width ?? 0)
  ariaValueMin.value = Math.round(minColWidth())
})
const ariaValueNow = computed<number | undefined>(() =>
  resolvedWidth.value != null ? Math.round(resolvedWidth.value) : measuredWidth.value ?? undefined,
)

/**
 * Whether a pointer with no hover has asked for the steppers.
 *
 * Same rule as the splitter gutter: `:hover` serves a mouse, `:focus-within`
 * serves a keyboard, and one tap serves a touch pointer that has neither. A
 * mouse press is deliberately not sticky, so the resting rendering of a table
 * header is exactly what it was.
 */
const stepsRevealed = ref(false)
function onHandlePointerUp(event: PointerEvent): void {
  if (event.pointerType !== 'mouse')
    stepsRevealed.value = true
}

const classes = computed(() =>
  cn(
    props.header ? styles.value.headerCell() : styles.value.cell(),
    alignClass.value,
    // `group/dz-col-resize` is a marker with no paint of its own: it is what
    // lets the SC 2.5.7 steppers react to a hover or a focus anywhere on the
    // header cell they size (TASK-R2-O5, D117/A).
    showResizeHandle.value ? 'group/dz-col-resize relative' : '',
    pinClasses.value,
    attrs.class as string | undefined,
  ),
)

// User-visible strings, resolved against the application's catalog (ADR-20).
const dzMessages = useComponentMessages('DzTableCell')
</script>

<template>
  <component
    :is="header ? 'th' : 'td'"
    ref="cellEl"
    data-part="cell"
    :class="classes"
    :style="cellStyle"
    :colspan="colspan"
    :rowspan="rowspan"
    :scope="header ? 'col' : undefined"
    :data-pinned="pin ?? undefined"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
    <!--
      TASK-N1-O3 / WCAG 2.2 SC 2.5.8. The column-resize handle is 8 CSS px wide.
      It is not in the browser-matrix ledger only because no built DzTable story
      turns `resizable` on, so the lane never measured it; the 2.5.7 drag audit
      did. `dz-target-min` takes the pointer target to 24px across the inline
      axis (the block axis is already the full header height) and the hover tint
      moves to a pseudo-element at `--dz-control-visual-size` so the band the
      user sees stays 8px wide.
      That sentence was WRONG, and TASK-R2-O5 measured it wrong in three
      engines: ArrowLeft/ArrowRight is a KEYBOARD path and satisfies SC 2.1.1.
      SC 2.5.7 asks for a SINGLE POINTER with no dragging, and this handle had
      none — `@click.stop` actively discarded the one press that might have been
      it. The stepper pair below is the fix (owner decision D117 option A,
      2026-09-19); `@click.stop` is gone with it.
    -->
    <button
      v-if="showResizeHandle"
      type="button"
      class="dz-target-min [--dz-control-visual-size:0.5rem] absolute -right-1 top-0 z-10 h-full w-2 cursor-col-resize touch-none select-none bg-transparent before:absolute before:inset-block-0 before:inset-inline-end-0 before:-z-10 before:w-[var(--dz-control-visual-size)] hover:before:bg-[var(--dz-primary)]/40"
      :aria-label="dzMessages.resizeColumn"
      data-part="separator"
      data-dz-resize-handle
      role="separator"
      aria-orientation="vertical"
      :aria-valuenow="ariaValueNow"
      :aria-valuemin="ariaValueMin"
      @pointerdown="onResizeStart"
      @pointerup="onHandlePointerUp"
      @keydown="onResizeKey"
    />
    <!--
      WCAG 2.2 SC 2.5.7 — the single-pointer, non-drag path (D117/A).

      It OVERLAYS the header cell rather than sitting inside the handle: the
      handle's visible band is 8 CSS px wide and two 24 x 24 controls do not fit
      in it (decision sheet §2.3). 48 x 24 anchored at the resizable edge is the
      narrowest footprint that keeps both controls at the SC 2.5.8 floor, and it
      fits a column at `--dz-table-col-min-width` (48px) exactly.

      `tabindex="-1"`: the handle beside it is already the tab stop and already
      carries the Arrow key path, so these two would only duplicate it — one
      column would become three tab stops.

      `mousedown` / `touchstart` are stopped so a press on a stepper cannot also
      begin a zero-length drag through `onResizeStart`.
    -->
    <div
      v-if="showResizeHandle"
      class="pointer-events-none absolute right-0 top-1/2 z-20 flex -translate-y-1/2 items-center gap-px opacity-0 transition-opacity duration-150 group-hover/dz-col-resize:opacity-100 group-focus-within/dz-col-resize:opacity-100 data-[steppers=visible]:opacity-100"
      :data-steppers="stepsRevealed ? 'visible' : undefined"
    >
      <button
        type="button"
        tabindex="-1"
        data-part="step-decrease"
        data-dz-resize-step="decrease"
        class="dz-target-min dz-focus-ring-control pointer-events-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--dz-radius-sm)] border border-[var(--dz-border)] bg-[var(--dz-background)] text-[var(--dz-foreground)] hover:bg-[var(--dz-muted)]"
        :aria-label="dzMessages.narrowColumn"
        @pointerdown.stop
        @mousedown.stop
        @touchstart.stop
        @click="stepColumn(-1, $event.shiftKey)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-3 w-3 rotate-180"
          aria-hidden="true"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
      <button
        type="button"
        tabindex="-1"
        data-part="step-increase"
        data-dz-resize-step="increase"
        class="dz-target-min dz-focus-ring-control pointer-events-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--dz-radius-sm)] border border-[var(--dz-border)] bg-[var(--dz-background)] text-[var(--dz-foreground)] hover:bg-[var(--dz-muted)]"
        :aria-label="dzMessages.widenColumn"
        @pointerdown.stop
        @mousedown.stop
        @touchstart.stop
        @click="stepColumn(1, $event.shiftKey)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-3 w-3"
          aria-hidden="true"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </div>
  </component>
</template>
