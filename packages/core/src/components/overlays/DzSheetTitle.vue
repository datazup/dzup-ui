<script setup lang="ts">
import type { DzSheetTitleSlots } from './DzSheet.types.ts'
import { DialogTitle } from 'reka-ui'
/**
 * DzSheetTitle — Title for DzSheet.
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { sheetVariants } from './DzSheet.variants.ts'

defineSlots<DzSheetTitleSlots>()

const attrs = useAttrs()
const styles = computed(() => sheetVariants())
const classes = computed(() =>
  cn(styles.value.title(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <DialogTitle :class="classes" v-bind="{ ...$attrs, class: undefined }">
    <slot />
  </DialogTitle>
</template>
