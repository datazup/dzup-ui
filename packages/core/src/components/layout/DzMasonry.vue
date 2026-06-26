<script setup lang="ts">
import type { ComponentPublicInstance, PropType, VNode } from 'vue'
import type {
  DzMasonryProps,
  DzMasonrySlots,
  MasonryColumns,
  ResponsiveColumns,
} from './DzMasonry.types.ts'
/**
 * DzMasonry -- responsive masonry / cascading-column layout.
 *
 * Packs variable-height items into balanced columns without cropping or
 * letterboxing. Two rendering paths share one public API:
 *
 * - **CSS fast path** (`sequential` -- the default, and whenever `ordered` is
 *   set): native CSS multi-column. Children flow in source order, column-major,
 *   with the browser balancing column heights. Zero measurement, SSR-safe, and
 *   DOM order is identical to source order (best for reading / tab order).
 * - **Measured-JS path** (`sequential: false`): each item is measured with a
 *   `ResizeObserver` and assigned, in source order, to the shortest column for
 *   exact height balancing. Items are grouped into per-column wrappers, so DOM
 *   order is column-major rather than source order -- set `ordered` to opt back
 *   into the CSS path when source DOM order must be preserved.
 *
 * @example
 * ```vue
 * <DzMasonry :columns="{ xs: 1, md: 2, lg: 3 }" gap="md">
 *   <DzImageCard v-for="p in photos" :key="p.id" v-bind="p" />
 * </DzMasonry>
 * ```
 */
import {
  Comment,
  computed,
  defineComponent,
  Fragment,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  ref,
  Text,
  useAttrs,
} from 'vue'
import { cn } from '../../utilities/cn.ts'
import { masonryTokens } from './DzMasonry.tokens.ts'
import {
  masonryColumn,
  masonryColumnContainer,
  masonryVariants,
  responsiveColumnsMap,
} from './DzMasonry.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzMasonryProps>(), {
  columns: 3,
  gap: 'md',
  sequential: true,
  ordered: false,
  as: 'div',
})

const slots = defineSlots<DzMasonrySlots>()

const attrs = useAttrs()

// ---------------------------------------------------------------------------
// Breakpoints (mirror Tailwind defaults, mobile-first)
// ---------------------------------------------------------------------------

const BREAKPOINTS = { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280 } as const
const BP_ORDER = ['xs', 'sm', 'md', 'lg', 'xl'] as const

// ---------------------------------------------------------------------------
// Path selection
// ---------------------------------------------------------------------------

/** CSS multi-column path handles the common case and any DOM-order request. */
const useCssPath = computed(() => props.sequential || props.ordered)

/** Whether `columns` is a responsive object. */
const isResponsive = computed(() => typeof props.columns === 'object' && props.columns !== null)

// ---------------------------------------------------------------------------
// Slot flattening (measured-JS path)
// ---------------------------------------------------------------------------

/** Flatten fragments and drop comment / whitespace-only nodes. */
function flattenVNodes(nodes: VNode[]): VNode[] {
  const out: VNode[] = []
  for (const node of nodes) {
    if (node.type === Fragment) {
      if (Array.isArray(node.children))
        out.push(...flattenVNodes(node.children as VNode[]))
    }
    else if (node.type === Comment) {
      continue
    }
    else if (
      node.type === Text
      && typeof node.children === 'string'
      && node.children.trim() === ''
    ) {
      continue
    }
    else {
      out.push(node)
    }
  }
  return out
}

/**
 * Source-order list of masonry items. Invoked from the render function (the
 * template) so the slot's own reactive dependencies are tracked correctly.
 */
function getItems(): VNode[] {
  return flattenVNodes(slots.default?.() ?? [])
}

/** Renders a single captured vnode (lets us re-parent items into columns). */
const VNodeRenderer = defineComponent({
  name: 'DzMasonryItem',
  props: { node: { type: Object as PropType<VNode>, required: true } },
  setup: itemProps => () => itemProps.node,
})

// ---------------------------------------------------------------------------
// Measurement state (measured-JS path only)
// ---------------------------------------------------------------------------

const containerRef = ref<HTMLElement | null>(null)
const containerWidth = ref(0)
const itemHeights = ref<number[]>([])
const measured = ref(false)
const itemEls = new Map<number, HTMLElement>()

let observer: ResizeObserver | null = null
let debounceId: ReturnType<typeof setTimeout> | null = null

function setContainerRef(el: Element | ComponentPublicInstance | null): void {
  containerRef.value = (el as HTMLElement | null) ?? null
}

function setItemRef(index: number, el: unknown): void {
  const node = el as HTMLElement | null
  if (node) {
    itemEls.set(index, node)
    observer?.observe(node)
  }
  else {
    const prev = itemEls.get(index)
    if (prev)
      observer?.unobserve(prev)
    itemEls.delete(index)
  }
}

/** Shallow equality for the measured-height arrays. */
function sameHeights(a: number[], b: number[]): boolean {
  if (a.length !== b.length)
    return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i])
      return false
  }
  return true
}

/**
 * Read live box metrics into reactive refs. Only writes when values actually
 * change so the `onUpdated` re-measure can never spin into a render loop.
 */
function measure(): void {
  if (containerRef.value)
    containerWidth.value = containerRef.value.offsetWidth
  const heights: number[] = []
  itemEls.forEach((el, index) => {
    heights[index] = el.offsetHeight
  })
  if (!sameHeights(heights, itemHeights.value))
    itemHeights.value = heights
  if (!measured.value)
    measured.value = true
}

/** Debounced re-measure to coalesce resize / mutation bursts. */
function scheduleMeasure(): void {
  if (debounceId)
    clearTimeout(debounceId)
  debounceId = setTimeout(() => {
    debounceId = null
    measure()
  }, 60)
}

onMounted(() => {
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(() => scheduleMeasure())
    if (containerRef.value)
      observer.observe(containerRef.value)
    itemEls.forEach(el => observer!.observe(el))
  }
  nextTick(() => measure())
})

onBeforeUnmount(() => {
  if (debounceId)
    clearTimeout(debounceId)
  observer?.disconnect()
  observer = null
  itemEls.clear()
})

// Re-measure after any re-render (e.g. children added / removed). The change
// guard inside measure() keeps this from looping.
onUpdated(() => {
  if (!useCssPath.value)
    scheduleMeasure()
})

// ---------------------------------------------------------------------------
// Column resolution + distribution (measured-JS path)
// ---------------------------------------------------------------------------

/** Resolve the active column count from `columns` and the measured width. */
function resolveColumnCount(columns: MasonryColumns | ResponsiveColumns, width: number): number {
  if (typeof columns === 'number')
    return columns
  let count: number | undefined
  for (const bp of BP_ORDER) {
    const value = columns[bp]
    if (value === undefined)
      continue
    // Baseline is the smallest defined breakpoint; larger ones win past their width.
    if (count === undefined)
      count = value
    if (width >= BREAKPOINTS[bp])
      count = value
  }
  return count ?? 1
}

const resolvedColumns = computed(() => {
  const count = resolveColumnCount(props.columns, containerWidth.value)
  return Math.max(1, Math.min(6, count))
})

/**
 * Group items per column for the measured-JS path. Called from the render
 * function so it reads the slot inside render; it tracks `resolvedColumns`,
 * `itemHeights`, and `measured` as render dependencies.
 */
function buildColumns(): { node: VNode, index: number }[][] {
  const count = resolvedColumns.value
  const list = getItems()
  const heights = itemHeights.value
  // Balance by height only once real measurements exist; before then (SSR /
  // first paint / zero-height test envs) fall back to round-robin so items
  // still spread across every column.
  const balanced = measured.value && heights.some(h => h > 0)

  const columns: { node: VNode, index: number }[][] = Array.from({ length: count }, () => [])
  const columnHeights = new Array<number>(count).fill(0)

  for (let i = 0; i < list.length; i++) {
    const node = list[i]
    if (node === undefined)
      continue
    let target = i % count
    if (balanced) {
      target = 0
      for (let c = 1; c < count; c++) {
        if ((columnHeights[c] ?? 0) < (columnHeights[target] ?? 0))
          target = c
      }
    }
    columns[target]!.push({ node, index: i })
    columnHeights[target] = (columnHeights[target] ?? 0) + (heights[i] ?? 0)
  }
  return columns
}

// ---------------------------------------------------------------------------
// Classes + styles
// ---------------------------------------------------------------------------

/** Responsive `columns-N` classes for the CSS path. */
const cssResponsiveClasses = computed(() => {
  if (!isResponsive.value)
    return ''
  const obj = props.columns as ResponsiveColumns
  const classes: string[] = []
  for (const bp of BP_ORDER) {
    const value = obj[bp]
    if (value !== undefined) {
      const cls = responsiveColumnsMap[bp]?.[value]
      if (cls)
        classes.push(cls)
    }
  }
  return classes.join(' ')
})

const rootClasses = computed(() => {
  if (useCssPath.value) {
    return cn(
      masonryVariants({
        columns: isResponsive.value ? undefined : (props.columns as MasonryColumns),
      }),
      cssResponsiveClasses.value,
      attrs.class as string | undefined,
    )
  }
  return cn(masonryColumnContainer(), attrs.class as string | undefined)
})

const columnClass = masonryColumn()

/** Publishes the resolved gap once as a custom property (ADR-04). */
const containerStyle = computed(() => ({
  '--dz-masonry-gap': masonryTokens.gap[props.gap],
}))
</script>

<template>
  <component
    :is="as"
    :id="id"
    :ref="setContainerRef"
    :class="rootClasses"
    :style="containerStyle"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot v-if="useCssPath" />
    <template v-else>
      <div v-for="(column, ci) in buildColumns()" :key="ci" :class="columnClass">
        <div
          v-for="entry in column"
          :key="entry.index"
          :ref="(el) => setItemRef(entry.index, el)"
          class="dz-masonry__item"
        >
          <VNodeRenderer :node="entry.node" />
        </div>
      </div>
    </template>
  </component>
</template>
