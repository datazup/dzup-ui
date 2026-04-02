<script setup lang="ts">
import type { DzTableBodySlots } from './DzTable.types.ts'
/**
 * DzTableBody — Table body section (<tbody>).
 *
 * Child of DzTable compound component.
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'

defineSlots<DzTableBodySlots>()

const attrs = useAttrs()

const classes = computed(() =>
  cn(attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <tbody :class="classes" v-bind="{ ...$attrs, class: undefined }">
    <slot />
  </tbody>
</template>
