<script setup lang="ts">
import type { DzPopoverProps, DzPopoverSlots } from './DzPopover.types.ts'
/**
 * DzPopover -- Root compound component wrapping Reka UI PopoverRoot (ADR-07).
 *
 * Open state via defineModel<boolean>('open') (ADR-16).
 *
 * @example
 * ```vue
 * <DzPopover v-model:open="isOpen">
 *   <DzPopoverTrigger as-child>
 *     <DzButton>Toggle</DzButton>
 *   </DzPopoverTrigger>
 *   <DzPopoverContent>
 *     Popover body
 *   </DzPopoverContent>
 * </DzPopover>
 * ```
 */
import { PopoverRoot } from 'reka-ui'

const open = defineModel<boolean>('open', { default: false })

withDefaults(defineProps<DzPopoverProps>(), {
  modal: false,
})

defineSlots<DzPopoverSlots>()
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <PopoverRoot v-model:open="open" :modal="modal">
    <slot />
  </PopoverRoot>
</template>
