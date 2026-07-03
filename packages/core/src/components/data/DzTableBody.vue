<script setup lang="ts">
import type { VNode } from 'vue'
import type { DzTableBodyProps, DzTableBodySlots, VirtualWindow } from './DzTable.types.ts'
/**
 * DzTableBody — Table body section (<tbody>).
 *
 * Child of DzTable compound component.
 *
 * - When the table is `loading`, renders `skeletonRows` placeholder rows via
 *   `DzSkeleton`, taking priority over both real rows and the empty state.
 * - Otherwise, when the `default` slot yields zero rows, renders a full-width
 *   placeholder row via the `#empty` slot (defaults to `DzEmpty`).
 * - When the table has `virtualScroll` enabled, only the rows within the visible
 *   window (plus overscan) are rendered; top/bottom spacer rows of fixed height
 *   preserve the scroll geometry.
 */
import { Comment, computed, Fragment, inject, Text, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import DzEmpty from '../feedback/DzEmpty.vue'
import DzSkeleton from '../feedback/DzSkeleton.vue'
import { DZ_TABLE_KEY } from './DzTable.types.ts'

/**
 * Functional renderer that emits a pre-computed array of row VNodes. Used to
 * inject the windowed slice of `<DzTableRow>` nodes between the virtual spacer
 * rows without re-wrapping them in an extra element.
 */
const RowFragment = (fnProps: { nodes: VNode[] }): VNode[] => fnProps.nodes

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzTableBodyProps>(), {
  skeletonRows: 3,
})

const slots = defineSlots<DzTableBodySlots>()

const attrs = useAttrs()
const tableContext = inject(DZ_TABLE_KEY, null)

const classes = computed(() => cn(attrs.class as string | undefined))

/** Flatten fragments and drop comment / whitespace-only text nodes. */
function flattenVNodes(nodes: VNode[]): VNode[] {
  const out: VNode[] = []
  for (const node of nodes) {
    if (node.type === Fragment) {
      if (Array.isArray(node.children)) out.push(...flattenVNodes(node.children as VNode[]))
    } else if (node.type === Comment) {
      continue
    } else if (
      node.type === Text &&
      typeof node.children === 'string' &&
      node.children.trim() === ''
    ) {
      continue
    } else {
      out.push(node)
    }
  }
  return out
}

const isLoading = computed(() => tableContext?.loading.value ?? false)

/** Real, renderable rows produced by the `default` slot. */
const rows = computed<VNode[]>(() => flattenVNodes((slots.default?.() ?? []) as VNode[]))

/** Whether the `default` slot rendered zero actual rows. */
const isEmpty = computed(() => rows.value.length === 0)

// ── Virtual scroll windowing ─────────────────────────────────────────────
const isVirtual = computed(() => tableContext?.virtualScroll.value ?? false)

/**
 * Derive the visible window from the container geometry published by DzTable and
 * this body's own row count. Fixed row height, so scroll position maps directly
 * to a row-index slice.
 */
const virtualWindow = computed<VirtualWindow | null>(() => {
  if (!isVirtual.value || !tableContext) return null
  const total = rows.value.length
  const rh = Math.max(1, tableContext.rowHeight.value)
  const overscan = Math.max(0, tableContext.overscan.value)
  if (total === 0) return { startIndex: 0, endIndex: 0, paddingTop: 0, paddingBottom: 0 }
  const vh = tableContext.viewportHeight.value || total * rh
  const first = Math.floor(tableContext.scrollTop.value / rh)
  const visibleCount = Math.ceil(vh / rh) + 1
  const startIndex = Math.max(0, first - overscan)
  const endIndex = Math.min(total, first + visibleCount + overscan)
  return {
    startIndex,
    endIndex,
    paddingTop: startIndex * rh,
    paddingBottom: Math.max(0, (total - endIndex) * rh),
  }
})

/** The subset of rows actually rendered when virtual scroll is active. */
const windowedRows = computed<VNode[]>(() => {
  const win = virtualWindow.value
  if (!win) return rows.value
  return rows.value.slice(win.startIndex, win.endIndex)
})
</script>

<template>
  <tbody :class="classes" v-bind="{ ...$attrs, class: undefined }">
    <template v-if="isLoading">
      <tr v-for="n in props.skeletonRows" :key="`skeleton-row-${n}`" aria-hidden="true">
        <td colspan="1000">
          <DzSkeleton variant="text" />
        </td>
      </tr>
    </template>
    <template v-else-if="isVirtual && !isEmpty">
      <tr
        v-if="virtualWindow && virtualWindow.paddingTop > 0"
        aria-hidden="true"
        class="dz-virtual-spacer"
        :style="{ height: `${virtualWindow.paddingTop}px` }"
      >
        <td colspan="1000" style="padding: 0; border: none" />
      </tr>
      <RowFragment :nodes="windowedRows" />
      <tr
        v-if="virtualWindow && virtualWindow.paddingBottom > 0"
        aria-hidden="true"
        class="dz-virtual-spacer"
        :style="{ height: `${virtualWindow.paddingBottom}px` }"
      >
        <td colspan="1000" style="padding: 0; border: none" />
      </tr>
    </template>
    <slot v-else-if="!isEmpty" />
    <tr v-else>
      <td colspan="1000">
        <slot name="empty">
          <DzEmpty title="No records found." />
        </slot>
      </td>
    </tr>
  </tbody>
</template>
