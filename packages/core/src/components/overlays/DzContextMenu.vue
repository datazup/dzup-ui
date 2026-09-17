<script setup lang="ts">
import type { DzContextMenuProps, DzContextMenuSlots } from './DzContextMenu.types.ts'
/**
 * DzContextMenu — Root context menu using Reka UI (ADR-07).
 *
 * @example
 * ```vue
 * <DzContextMenu>
 *   <DzContextMenuTrigger>
 *     <div>Right click me</div>
 *   </DzContextMenuTrigger>
 *   <DzContextMenuContent>
 *     <DzContextMenuItem @select="edit">Edit</DzContextMenuItem>
 *     <DzContextMenuSeparator />
 *     <DzContextMenuItem @select="del">Delete</DzContextMenuItem>
 *   </DzContextMenuContent>
 * </DzContextMenu>
 * ```
 */
import { ContextMenuRoot } from 'reka-ui'

defineOptions({
  inheritAttrs: false,
})

/**
 * Whether the menu is open. Left `undefined` (the default) Reka UI owns the
 * open state and the menu opens from the context-menu gesture without a binding.
 */
const open = defineModel<boolean | undefined>('open')

withDefaults(defineProps<DzContextMenuProps>(), {
  modal: true,
})

defineSlots<DzContextMenuSlots>()
</script>

<template>
  <ContextMenuRoot v-model:open="open" :modal="modal">
    <slot />
  </ContextMenuRoot>
</template>
