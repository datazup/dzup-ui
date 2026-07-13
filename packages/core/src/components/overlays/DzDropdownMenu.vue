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

defineOptions({
  inheritAttrs: false,
})

// `default: undefined` is load-bearing. Without it Vue boolean-casts an unbound
// `open` prop to `false`, which Reka reads as "controlled and closed" — so
// `defaultOpen` could never take effect. An explicit default keeps `open`
// undefined until someone binds `v-model:open`, leaving the menu uncontrolled.
const open = defineModel<boolean | undefined>('open', { default: undefined })

withDefaults(defineProps<DzDropdownMenuProps>(), {
  defaultOpen: false,
  modal: true,
})

defineSlots<DzDropdownMenuSlots>()
</script>

<template>
  <DropdownMenuRoot v-model:open="open" :default-open="defaultOpen" :modal="modal">
    <slot />
  </DropdownMenuRoot>
</template>
