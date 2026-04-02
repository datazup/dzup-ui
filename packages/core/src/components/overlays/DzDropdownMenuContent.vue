<script setup lang="ts">
import type {
  DzDropdownMenuContentEmits,
  DzDropdownMenuContentProps,
  DzDropdownMenuContentSlots,
} from './DzDropdownMenu.types.ts'
import { DropdownMenuContent, DropdownMenuPortal } from 'reka-ui'
/**
 * DzDropdownMenuContent — Content panel for DzDropdownMenu.
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { dropdownMenuVariants } from './DzDropdownMenu.variants.ts'

withDefaults(defineProps<DzDropdownMenuContentProps>(), {
  side: 'bottom',
  align: 'start',
  sideOffset: 4,
})

const emit = defineEmits<DzDropdownMenuContentEmits>()
defineSlots<DzDropdownMenuContentSlots>()

const attrs = useAttrs()
const styles = computed(() => dropdownMenuVariants())

const classes = computed(() =>
  cn(styles.value.content(), attrs.class as string | undefined),
)

function handleEscapeKeyDown(event: KeyboardEvent): void {
  emit('escapeKeyDown', event)
}

function handlePointerDownOutside(event: Event): void {
  emit('pointerDownOutside', event)
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <DropdownMenuPortal>
    <DropdownMenuContent
      :id="id"
      :side="side"
      :align="align"
      :side-offset="sideOffset"
      :class="classes"
      :aria-label="ariaLabel"
      v-bind="{ ...$attrs, class: undefined }"
      @escape-key-down="handleEscapeKeyDown"
      @pointer-down-outside="handlePointerDownOutside"
    >
      <slot />
    </DropdownMenuContent>
  </DropdownMenuPortal>
</template>
