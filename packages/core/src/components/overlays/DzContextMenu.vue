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

withDefaults(defineProps<DzContextMenuProps>(), {
  modal: true,
})

defineSlots<DzContextMenuSlots>()
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <ContextMenuRoot :modal="modal">
    <slot />
  </ContextMenuRoot>
</template>
