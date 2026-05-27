<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

import type { DzDialogCloseProps, DzDialogCloseSlots } from './DzDialog.types.ts'
import { X } from 'lucide-vue-next'
import { DialogClose } from 'reka-ui'
/**
 * DzDialogClose -- Close button for DzDialog compound.
 *
 * Wraps Reka UI DialogClose with token-based styling.
 * When no slot content is provided, renders a default X icon.
 *
 * Pass `as-child` to delegate the close behaviour to a slotted custom element
 * (e.g. a DzButton in the dialog footer). In that mode the absolute top-right
 * positioning and default X icon are skipped, and only the close-on-click
 * behaviour is forwarded.
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { dialogVariants } from './DzDialog.variants.ts'

const props = withDefaults(defineProps<DzDialogCloseProps>(), {
  asChild: false,
})

defineSlots<DzDialogCloseSlots>()

const attrs = useAttrs()
const styles = computed(() => dialogVariants())
const closeClasses = computed(() =>
  props.asChild ? (attrs.class as string | undefined) : cn(styles.value.close(), attrs.class as string | undefined),
)
const ariaLabel = computed(() =>
  props.asChild ? (attrs['aria-label'] as string | undefined) : ((attrs['aria-label'] as string) ?? 'Close'),
)
</script>


<template>
  <DialogClose
    :as-child="asChild"
    :class="closeClasses"
    v-bind="{ ...$attrs, 'class': undefined, 'aria-label': ariaLabel }"
  >
    <slot v-if="asChild" />
    <slot v-else>
      <X class="h-4 w-4" aria-hidden="true" />
    </slot>
  </DialogClose>
</template>
