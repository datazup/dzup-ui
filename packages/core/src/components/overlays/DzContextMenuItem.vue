<script setup lang="ts">
import type {
  DzContextMenuItemEmits,
  DzContextMenuItemProps,
  DzContextMenuItemSlots,
} from './DzContextMenu.types.ts'
import { ContextMenuItem } from 'reka-ui'
/**
 * DzContextMenuItem — A single item within DzContextMenuContent.
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { contextMenuVariants } from './DzContextMenu.variants.ts'

withDefaults(defineProps<DzContextMenuItemProps>(), {
  disabled: false,
})

const emit = defineEmits<DzContextMenuItemEmits>()
defineSlots<DzContextMenuItemSlots>()

const attrs = useAttrs()
const styles = computed(() => contextMenuVariants())

const classes = computed(() =>
  cn(styles.value.item(), attrs.class as string | undefined),
)

function handleSelect(event: Event): void {
  emit('select', event)
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <ContextMenuItem
    :disabled="disabled"
    :class="classes"
    v-bind="{ ...$attrs, class: undefined }"
    @select="handleSelect"
  >
    <slot />
  </ContextMenuItem>
</template>
