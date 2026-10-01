<script setup lang="ts">
import type { DzGridItemProps, DzGridItemSlots, GridSpan, ResponsiveSpan } from './DzGrid.types.ts'
/**
 * DzGridItem — a `DzGrid` child that says how many columns and rows it occupies.
 *
 * The spans are typed props rather than raw `col-span-*` / `row-span-*` classes
 * on the child (TASK-R3-O3 decision D67 for the column axis; TASK-S3-O2
 * decision `D-S3O2-1` for the row axis and the document spelling), so a form
 * renderer's "this field takes six of twelve columns and two rows" is an API
 * rather than a class name it has to look up. Classes come from literal
 * per-breakpoint tables, so Tailwind's scanner emits every one of them.
 *
 * `colSpan` and `rowSpan` are the Form document's own field names
 * (`layout.colSpan` / `layout.rowSpan`, doc 03 §3), so a renderer forwards them
 * with no translation table. `span` is D67's original spelling and is retained
 * as an additive alias of `colSpan`; `colSpan` wins when both are given, and dev
 * mode says so once rather than resolving it silently.
 *
 * Renders one element and nothing else: no `data-part` (it follows its Tier A
 * parent, which declares no anatomy), no provide/inject, no DOM read — the same
 * output on the server and the client. Both axes are writing-mode relative
 * (`grid-column`/`grid-row: span N`), so the item mirrors under `dir="rtl"` with
 * nothing to configure.
 *
 * @example
 * ```vue
 * <DzGrid :cols="{ sm: 1, md: 12 }" :rows="2">
 *   <DzGridItem :col-span="{ md: 6 }"><DzInput /></DzGridItem>
 *   <DzGridItem :col-span="{ md: 6 }" :row-span="2"><DzTextarea /></DzGridItem>
 *   <DzGridItem col-span="full"><DzTextarea /></DzGridItem>
 * </DzGrid>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { warnConflictingProps } from '../../utilities/warnConflictingProps.ts'
import { gridItemRowSpanMap, gridItemSpanMap } from './DzGrid.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzGridItemProps>(), {
  span: undefined,
  colSpan: undefined,
  rowSpan: undefined,
  as: 'div',
})

defineSlots<DzGridItemSlots>()

const attrs = useAttrs()

/** Clamp a numeric span into 1–12; `'full'` passes through. */
function normalise(span: GridSpan): GridSpan {
  if (span === 'full')
    return span
  const n = Math.trunc(Number(span))
  if (!Number.isFinite(n))
    return 1
  return Math.min(12, Math.max(1, n)) as GridSpan
}

const BREAKPOINTS = ['base', 'sm', 'md', 'lg'] as const

type SpanTable = typeof gridItemSpanMap | typeof gridItemRowSpanMap

/** The span classes for one axis, one per breakpoint that was given. */
function spanClassesFor(span: GridSpan | ResponsiveSpan | undefined, table: SpanTable): string {
  if (span === undefined || span === null)
    return ''
  if (typeof span !== 'object')
    return table.base[normalise(span)]
  const classes: string[] = []
  for (const bp of BREAKPOINTS) {
    const value = span[bp]
    if (value !== undefined)
      classes.push(table[bp][normalise(value)])
  }
  return classes.join(' ')
}

// Two spellings of one axis cannot be combined, so say which one lost rather
// than resolving it silently. Checked at setup, like `warnRemovedProps`: a
// component handed both at mount is the case worth catching, and a `computed`
// that warns is a side effect in a pure position.
warnConflictingProps(
  'DzGridItem',
  ['colSpan', props.colSpan],
  ['span', props.span],
  '`colSpan` matches the form document field name (`layout.colSpan`); `span` is '
  + 'the original spelling and is kept as an alias.',
)

/**
 * The column span, from `colSpan` if given and `span` otherwise.
 *
 * Deterministic rather than merged, and picking the document's name as the
 * winner is the answer a renderer forwarding `node.layout.colSpan` needs.
 */
const resolvedColSpan = computed(() => props.colSpan ?? props.span)

/** Merged class string using cn() (ADR-10) — a consumer class still wins. */
const classes = computed(() => cn(
  spanClassesFor(resolvedColSpan.value, gridItemSpanMap),
  spanClassesFor(props.rowSpan, gridItemRowSpanMap),
  attrs.class as string | undefined,
) || undefined)
</script>

<template>
  <component
    :is="as"
    :class="classes"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </component>
</template>
