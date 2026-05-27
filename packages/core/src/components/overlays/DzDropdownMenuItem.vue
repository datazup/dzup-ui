<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

import type {
  DzDropdownMenuItemEmits,
  DzDropdownMenuItemProps,
  DzDropdownMenuItemSlots,
} from './DzDropdownMenu.types.ts'
import { DropdownMenuItem } from 'reka-ui'
/**
 * DzDropdownMenuItem — A single item within DzDropdownMenuContent.
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { dropdownMenuVariants } from './DzDropdownMenu.variants.ts'

withDefaults(defineProps<DzDropdownMenuItemProps>(), {
  disabled: false,
})

const emit = defineEmits<DzDropdownMenuItemEmits>()
const slots = defineSlots<DzDropdownMenuItemSlots>()

const attrs = useAttrs()
const styles = computed(() => dropdownMenuVariants())

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
  <DropdownMenuItem
    :disabled="disabled"
    :class="classes"
    v-bind="{ ...$attrs, class: undefined }"
    @select="handleSelect"
  >
    <span v-if="hasPrefix" :class="prefixClasses">
      <slot name="prefix" />
    </span>
    <slot />
    <span v-if="hasSuffix" :class="suffixClasses">
      <slot name="suffix" />
    </span>
  </DropdownMenuItem>
</template>
