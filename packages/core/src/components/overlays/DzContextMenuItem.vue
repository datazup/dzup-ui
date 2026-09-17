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

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzContextMenuItemProps>(), {
  disabled: false,
})

const emit = defineEmits<DzContextMenuItemEmits>()
const slots = defineSlots<DzContextMenuItemSlots>()

const attrs = useAttrs()
const styles = computed(() => contextMenuVariants())

const classes = computed(() =>
  cn(styles.value.item(), attrs.class as string | undefined),
)
const prefixClasses = computed(() => styles.value.itemPrefix())
const suffixClasses = computed(() => styles.value.itemSuffix())

const hasPrefix = computed(() => Boolean(slots.prefix))
const hasSuffix = computed(() => Boolean(slots.suffix))

function handleSelect(event: Event): void {
  emit('select', event)
}
</script>

<template>
  <ContextMenuItem
    :disabled="disabled"
    data-part="item"
    :class="classes"
    v-bind="{ ...$attrs, class: undefined }"
    @select="handleSelect"
  >
    <span v-if="hasPrefix" data-part="prefix" :class="cn(prefixClasses, props.ui?.prefix)">
      <slot name="prefix" />
    </span>
    <slot />
    <span v-if="hasSuffix" data-part="suffix" :class="cn(suffixClasses, props.ui?.suffix)">
      <slot name="suffix" />
    </span>
  </ContextMenuItem>
</template>
