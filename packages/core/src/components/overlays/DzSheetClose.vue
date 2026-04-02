<script setup lang="ts">
import type { DzSheetCloseSlots } from './DzSheet.types.ts'
import { DialogClose } from 'reka-ui'
/**
 * DzSheetClose — Close button for DzSheet.
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { sheetVariants } from './DzSheet.variants.ts'

defineSlots<DzSheetCloseSlots>()

const attrs = useAttrs()
const styles = computed(() => sheetVariants())
const classes = computed(() =>
  cn(styles.value.close(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <DialogClose
    :class="classes"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot>
      <svg
        class="h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
      <span class="sr-only">Close</span>
    </slot>
  </DialogClose>
</template>
