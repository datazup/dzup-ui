<script setup lang="ts">
import type { DzDialogProps, DzDialogSlots } from './DzDialog.types.ts'
/**
 * DzDialog -- Root compound component wrapping Reka UI DialogRoot (ADR-07).
 *
 * Manages open state via defineModel<boolean>('open') (ADR-16).
 * Children (DzDialogTrigger, DzDialogContent, etc.) are rendered via default slot.
 *
 * @example
 * ```vue
 * <DzDialog v-model:open="isOpen">
 *   <DzDialogTrigger as-child>
 *     <DzButton>Open</DzButton>
 *   </DzDialogTrigger>
 *   <DzDialogContent>
 *     <DzDialogTitle>Title</DzDialogTitle>
 *     <DzDialogDescription>Description</DzDialogDescription>
 *     <DzDialogClose />
 *   </DzDialogContent>
 * </DzDialog>
 * ```
 */
import { DialogRoot } from 'reka-ui'

const open = defineModel<boolean>('open', { default: false })

withDefaults(defineProps<DzDialogProps>(), {
  modal: true,
})

defineSlots<DzDialogSlots>()
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <DialogRoot v-model:open="open" :modal="modal">
    <slot />
  </DialogRoot>
</template>
