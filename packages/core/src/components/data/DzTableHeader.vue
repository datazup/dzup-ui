<script setup lang="ts">
import type { DzTableHeaderSlots } from './DzTable.types.ts'
/**
 * DzTableHeader — Table header section (<thead>).
 *
 * Child of DzTable compound component. Inherits context via inject.
 */
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_TABLE_KEY } from './DzTable.types.ts'
import { tableVariants } from './DzTable.variants.ts'

defineSlots<DzTableHeaderSlots>()

const attrs = useAttrs()
const tableContext = inject(DZ_TABLE_KEY, null)

const styles = computed(() =>
  tableVariants({
    variant: 'default',
    size: tableContext?.size.value ?? 'md',
    density: tableContext?.density.value ?? 'default',
  }),
)

const classes = computed(() =>
  cn(styles.value.header(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <thead :class="classes" v-bind="{ ...$attrs, class: undefined }">
    <slot />
  </thead>
</template>
