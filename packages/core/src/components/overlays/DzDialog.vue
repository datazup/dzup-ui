<script setup lang="ts">
import type { DzDialogProps, DzDialogSlots } from './DzDialog.types.ts'
import { DialogRoot } from 'reka-ui'
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
import { provide, toRef } from 'vue'
import { DZ_DIALOG_KEY } from './DzDialog.types.ts'

const open = defineModel<boolean>('open', { default: false })

const props = withDefaults(defineProps<DzDialogProps>(), {
  modal: true,
  animated: true,
  overlayTransition: 'dz-dialog-overlay',
  contentTransition: 'dz-dialog-content',
})

defineSlots<DzDialogSlots>()

provide(DZ_DIALOG_KEY, {
  size: toRef(() => 'md' as const),
  animated: toRef(() => props.animated),
  overlayTransition: toRef(() => props.animated ? props.overlayTransition : ''),
  contentTransition: toRef(() => props.animated ? props.contentTransition : ''),
})
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
