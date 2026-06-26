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

const open = defineModel<boolean>('open', { default: undefined })

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
