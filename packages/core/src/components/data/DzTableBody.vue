<script setup lang="ts">
import type { VNode } from 'vue'
import type { DzTableBodySlots } from './DzTable.types.ts'
/**
 * DzTableBody — Table body section (<tbody>).
 *
 * Child of DzTable compound component.
 *
 * When the `default` slot yields zero rows (and the table isn't `loading`),
 * renders a full-width placeholder row via the `#empty` slot (defaults to
 * `DzEmpty`).
 */
import { Comment, computed, Fragment, Text, useAttrs } from 'vue'
import DzEmpty from '../feedback/DzEmpty.vue'
import { cn } from '../../utilities/cn.ts'

defineOptions({
  inheritAttrs: false,
})

const slots = defineSlots<DzTableBodySlots>()

const attrs = useAttrs()

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

/** Whether the `default` slot rendered zero actual rows. */
const isEmpty = computed(() => flattenVNodes(slots.default?.() ?? []).length === 0)
</script>

<template>
  <tbody :class="classes" v-bind="{ ...$attrs, class: undefined }">
    <slot v-if="!isEmpty" />
    <tr v-else>
      <td colspan="1000">
        <slot name="empty">
          <DzEmpty title="No records found." />
        </slot>
      </td>
    </tr>
  </tbody>
</template>
