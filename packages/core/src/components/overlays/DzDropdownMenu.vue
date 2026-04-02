<script setup lang="ts">
import type { DzDropdownMenuProps, DzDropdownMenuSlots } from './DzDropdownMenu.types.ts'
/**
 * DzDropdownMenu — Root dropdown menu using Reka UI (ADR-07).
 *
 * @example
 * ```vue
 * <DzDropdownMenu>
 *   <DzDropdownMenuTrigger as-child>
 *     <DzButton>Options</DzButton>
 *   </DzDropdownMenuTrigger>
 *   <DzDropdownMenuContent>
 *     <DzDropdownMenuItem @select="edit">Edit</DzDropdownMenuItem>
 *     <DzDropdownMenuSeparator />
 *     <DzDropdownMenuItem @select="del">Delete</DzDropdownMenuItem>
 *   </DzDropdownMenuContent>
 * </DzDropdownMenu>
 * ```
 */
import { DropdownMenuRoot } from 'reka-ui'

const open = defineModel<boolean>('open', { default: undefined })

withDefaults(defineProps<DzDropdownMenuProps>(), {
  modal: true,
})

defineSlots<DzDropdownMenuSlots>()
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <DropdownMenuRoot v-model:open="open" :modal="modal">
    <slot />
  </DropdownMenuRoot>
</template>
