<script setup lang="ts">
import type { VNode } from 'vue'
import type { DzTableBodyProps, DzTableBodySlots } from './DzTable.types.ts'
/**
 * DzTableBody — Table body section (<tbody>).
 *
 * Child of DzTable compound component.
 *
 * - When the table is `loading`, renders `skeletonRows` placeholder rows via
 *   `DzSkeleton`, taking priority over both real rows and the empty state.
 * - Otherwise, when the `default` slot yields zero rows, renders a full-width
 *   placeholder row via the `#empty` slot (defaults to `DzEmpty`).
 */
import { Comment, computed, Fragment, inject, Text, useAttrs } from 'vue'
import DzEmpty from '../feedback/DzEmpty.vue'
import DzSkeleton from '../feedback/DzSkeleton.vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_TABLE_KEY } from './DzTable.types.ts'

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

/** Whether the `default` slot rendered zero actual rows. */
const isEmpty = computed(() => flattenVNodes(slots.default?.() ?? []).length === 0)
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
