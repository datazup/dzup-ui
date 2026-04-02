<script setup lang="ts">
import type { DzDialogCloseSlots } from './DzDialog.types.ts'
import { X } from 'lucide-vue-next'
import { DialogClose } from 'reka-ui'
/**
 * DzDialogClose -- Close button for DzDialog compound.
 *
 * Wraps Reka UI DialogClose with token-based styling.
 * When no slot content is provided, renders a default X icon.
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { dialogVariants } from './DzDialog.variants.ts'

defineSlots<DzDialogCloseSlots>()

const attrs = useAttrs()
const styles = computed(() => dialogVariants())
const closeClasses = computed(() =>
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
    :class="closeClasses"
    v-bind="{ ...$attrs, 'class': undefined, 'aria-label': ($attrs['aria-label'] as string) ?? 'Close' }"
  >
    <slot>
      <X class="h-4 w-4" aria-hidden="true" />
    </slot>
  </DialogClose>
</template>
