<script setup lang="ts">
import type {
  DzDialogContentEmits,
  DzDialogContentProps,
  DzDialogContentSlots,
} from './DzDialog.types.ts'
import { DialogContent, DialogOverlay, DialogPortal } from 'reka-ui'
/**
 * DzDialogContent -- Content panel for DzDialog compound.
 *
 * Wraps Reka UI DialogPortal + DialogOverlay + DialogContent.
 * Renders portal, overlay backdrop, and content panel as one unit.
 * Size variants via tailwind-variants (ADR-04).
 *
 * @example
 * ```vue
 * <DzDialogContent size="lg">
 *   <DzDialogTitle>Large dialog</DzDialogTitle>
 *   <DzDialogDescription>Content here</DzDialogDescription>
 * </DzDialogContent>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { dialogVariants } from './DzDialog.variants.ts'

const props = withDefaults(defineProps<DzDialogContentProps>(), {
  size: 'md',
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzDialogContentEmits>()
defineSlots<DzDialogContentSlots>()

const attrs = useAttrs()

const styles = computed(() => dialogVariants({ size: props.size }))
const overlayClasses = computed(() => styles.value.overlay())
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
  <DialogPortal>
    <DialogOverlay :class="overlayClasses" />
    <DialogContent
      :id="id"
      :class="contentClasses"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabelledby"
      :aria-describedby="ariaDescribedby"
      style="contain: layout style"
      v-bind="{ ...$attrs, class: undefined }"
      @escape-key-down="handleEscapeKeyDown"
      @pointer-down-outside="handlePointerDownOutside"
      @interact-outside="handleInteractOutside"
      @open-auto-focus="handleOpenAutoFocus"
      @close-auto-focus="handleCloseAutoFocus"
    >
      <slot />
    </DialogContent>
  </DialogPortal>
</template>
