<script setup lang="ts">
import type { DzTableFooterSlots } from './DzTable.types.ts'
/**
 * DzTableFooter — Table footer section (<tfoot>).
 *
 * Child of DzTable compound component. Inherits context via inject.
 * Use for summary/aggregate rows.
 */
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_TABLE_KEY } from './DzTable.types.ts'
import { tableVariants } from './DzTable.variants.ts'

defineOptions({
  inheritAttrs: false,
})

defineSlots<DzTableFooterSlots>()

const attrs = useAttrs()
const tableContext = inject(DZ_TABLE_KEY, null)

const styles = computed(() =>
  tableVariants({
    variant: 'default',
    size: tableContext?.size.value ?? 'md',
    density: tableContext?.density.value ?? 'default',
  }),
)

const classes = computed(() => cn(styles.value.footer(), attrs.class as string | undefined))
</script>

<template>
  <tfoot data-part="footer" :class="classes" v-bind="{ ...$attrs, class: undefined }">
    <slot />
  </tfoot>
</template>
