<script setup lang="ts">
import type { DzTableRowProps, DzTableRowSlots } from './DzTable.types.ts'
/**
 * DzTableRow — Table row (<tr>).
 *
 * Child of DzTable compound component. Inherits context via inject.
 */
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_TABLE_KEY } from './DzTable.types.ts'
import { tableVariants } from './DzTable.variants.ts'

const props = withDefaults(defineProps<DzTableRowProps>(), {
  selected: false,
})

defineSlots<DzTableRowSlots>()

const attrs = useAttrs()
const tableContext = inject(DZ_TABLE_KEY, null)

const styles = computed(() =>
  tableVariants({
    variant: 'default',
    size: tableContext?.size.value ?? 'md',
    density: tableContext?.density.value ?? 'default',
    hoverable: tableContext?.hoverable.value ?? false,
  }),
)

const classes = computed(() =>
  cn(
    styles.value.row(),
    props.selected ? 'bg-[var(--dz-primary-muted)]' : '',
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
  <tr
    :class="classes"
    :aria-selected="selected || undefined"
    :data-state="selected ? 'selected' : undefined"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </tr>
</template>
