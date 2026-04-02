<script setup lang="ts">
import type { DzSheetProps, DzSheetSlots } from './DzSheet.types.ts'
/**
 * DzSheet — Slide-out side panel root component using Reka UI Dialog (ADR-07).
 *
 * v-model via defineModel<boolean>('open') (ADR-16).
 *
 * @example
 * ```vue
 * <DzSheet v-model:open="isOpen">
 *   <DzSheetTrigger as-child>
 *     <DzButton>Open</DzButton>
 *   </DzSheetTrigger>
 *   <DzSheetContent side="right">
 *     <DzSheetTitle>Settings</DzSheetTitle>
 *     <DzSheetDescription>Configure your preferences.</DzSheetDescription>
 *   </DzSheetContent>
 * </DzSheet>
 * ```
 */
import { DialogRoot } from 'reka-ui'

const open = defineModel<boolean>('open', { default: false })

withDefaults(defineProps<DzSheetProps>(), {
  modal: true,
})

defineSlots<DzSheetSlots>()
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
