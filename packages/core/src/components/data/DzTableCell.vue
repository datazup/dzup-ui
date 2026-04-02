<script setup lang="ts">
import type { DzTableCellProps, DzTableCellSlots } from './DzTable.types.ts'
/**
 * DzTableCell — Table cell (<td> or <th>).
 *
 * Child of DzTable compound component. Inherits context via inject.
 */
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_TABLE_KEY } from './DzTable.types.ts'
import { tableVariants } from './DzTable.variants.ts'

const props = withDefaults(defineProps<DzTableCellProps>(), {
  header: false,
  align: 'left',
  colspan: undefined,
  rowspan: undefined,
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

const classes = computed(() =>
  cn(
    props.header ? styles.value.headerCell() : styles.value.cell(),
    alignClass.value,
    attrs.class as string | undefined,
  ),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <component
    :is="header ? 'th' : 'td'"
    :class="classes"
    :colspan="colspan"
    :rowspan="rowspan"
    :scope="header ? 'col' : undefined"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </component>
</template>
