<script setup lang="ts">
import type { DzSheetDescriptionSlots } from './DzSheet.types.ts'
import { DialogDescription } from 'reka-ui'
/**
 * DzSheetDescription — Description for DzSheet.
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { sheetVariants } from './DzSheet.variants.ts'

defineSlots<DzSheetDescriptionSlots>()

const attrs = useAttrs()
const styles = computed(() => sheetVariants())
const classes = computed(() =>
  cn(styles.value.description(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <DialogDescription :class="classes" v-bind="{ ...$attrs, class: undefined }">
    <slot />
  </DialogDescription>
</template>
