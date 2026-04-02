<script setup lang="ts">
import type {
  DzPopoverContentEmits,
  DzPopoverContentProps,
  DzPopoverContentSlots,
} from './DzPopover.types.ts'
import { PopoverArrow, PopoverContent, PopoverPortal } from 'reka-ui'
/**
 * DzPopoverContent -- Content panel for DzPopover compound.
 *
 * Wraps Reka UI PopoverPortal + PopoverContent + optional PopoverArrow.
 * Token-based styling (ADR-04), size variants via tailwind-variants.
 *
 * @example
 * ```vue
 * <DzPopoverContent side="bottom" size="lg">
 *   Rich content here
 * </DzPopoverContent>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { popoverVariants } from './DzPopover.variants.ts'

const props = withDefaults(defineProps<DzPopoverContentProps>(), {
  side: 'bottom',
  sideOffset: 4,
  align: 'center',
  arrow: true,
  size: 'md',
})

const emit = defineEmits<DzPopoverContentEmits>()
defineSlots<DzPopoverContentSlots>()

const attrs = useAttrs()
const styles = computed(() => popoverVariants({ size: props.size }))
const contentClasses = computed(() =>
  cn(styles.value.content(), attrs.class as string | undefined),
)

function handleEscapeKeyDown(event: KeyboardEvent): void {
  emit('escapeKeyDown', event)
}

function handlePointerDownOutside(event: Event): void {
  emit('pointerDownOutside', event)
}

function handleInteractOutside(event: Event): void {
  emit('interactOutside', event)
}

function handleOpenAutoFocus(event: Event): void {
  emit('openAutoFocus', event)
}

function handleCloseAutoFocus(event: Event): void {
  emit('closeAutoFocus', event)
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <PopoverPortal>
    <PopoverContent
      :side="props.side"
      :side-offset="props.sideOffset"
      :align="props.align"
      :class="contentClasses"
      style="contain: layout style"
      v-bind="{ ...$attrs, class: undefined }"
      @escape-key-down="handleEscapeKeyDown"
      @pointer-down-outside="handlePointerDownOutside"
      @interact-outside="handleInteractOutside"
      @open-auto-focus="handleOpenAutoFocus"
      @close-auto-focus="handleCloseAutoFocus"
    >
      <slot />
      <PopoverArrow
        v-if="props.arrow"
        :class="styles.arrow()"
        :width="10"
        :height="5"
      />
    </PopoverContent>
  </PopoverPortal>
</template>
