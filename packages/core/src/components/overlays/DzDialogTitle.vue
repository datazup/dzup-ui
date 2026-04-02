<script setup lang="ts">
import type { DzDialogTitleSlots } from './DzDialog.types.ts'
import { DialogTitle } from 'reka-ui'
/**
 * DzDialogTitle -- Title element for DzDialog compound.
 *
 * Wraps Reka UI DialogTitle with token-based styling.
 * Reka UI auto-sets aria-labelledby on the dialog content.
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { dialogVariants } from './DzDialog.variants.ts'

defineSlots<DzDialogTitleSlots>()

const attrs = useAttrs()
const styles = computed(() => dialogVariants())
const titleClasses = computed(() =>
  cn(styles.value.title(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <DialogTitle
    :class="titleClasses"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </DialogTitle>
</template>
