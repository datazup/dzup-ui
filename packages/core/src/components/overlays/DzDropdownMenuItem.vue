<script setup lang="ts">
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
defineSlots<DzDropdownMenuItemSlots>()

const attrs = useAttrs()
const styles = computed(() => dropdownMenuVariants())

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
  <DropdownMenuItem
    :disabled="disabled"
    :class="classes"
    v-bind="{ ...$attrs, class: undefined }"
    @select="handleSelect"
  >
    <slot />
  </DropdownMenuItem>
</template>
