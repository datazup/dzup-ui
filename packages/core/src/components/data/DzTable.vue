<script setup lang="ts">
import type { DzTableContext, DzTableProps, DzTableSlots } from './DzTable.types.ts'
/**
 * DzTable — Compound semantic table root component.
 *
 * Simple styled table wrapper. For advanced features (sorting, pagination,
 * selection), use DzDataGrid instead.
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
import { computed, provide, toRef, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_TABLE_KEY } from './DzTable.types.ts'
import { tableVariants } from './DzTable.variants.ts'

const props = withDefaults(defineProps<DzTableProps>(), {
  size: 'md',
  variant: 'default',
  striped: false,
  hoverable: false,
  density: 'default',
  loading: false,
})

defineSlots<DzTableSlots>()

const attrs = useAttrs()

const context: DzTableContext = {
  size: toRef(() => props.size),
  striped: toRef(() => props.striped),
  hoverable: toRef(() => props.hoverable),
  density: toRef(() => props.density),
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

const rootClasses = computed(() =>
  cn('relative overflow-auto', attrs.class as string | undefined),
)

const tableClasses = computed(() => styles.value.root())
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    :class="rootClasses"
    :data-loading="loading ? '' : undefined"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
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
      <caption v-if="$slots.caption" class="sr-only">
        <slot name="caption" />
      </caption>
      <slot />
    </table>
  </div>
</template>
