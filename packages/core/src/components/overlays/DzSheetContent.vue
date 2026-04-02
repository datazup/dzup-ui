<script setup lang="ts">
import type { DzSheetContentEmits, DzSheetContentProps, DzSheetContentSlots } from './DzSheet.types.ts'
import { DialogContent, DialogOverlay, DialogPortal } from 'reka-ui'
/**
 * DzSheetContent — Content panel for DzSheet compound.
 *
 * Wraps Reka UI DialogPortal + DialogOverlay + DialogContent
 * with sheet-specific side positioning.
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { sheetVariants } from './DzSheet.variants.ts'

const props = withDefaults(defineProps<DzSheetContentProps>(), {
  side: 'right',
})

const emit = defineEmits<DzSheetContentEmits>()
defineSlots<DzSheetContentSlots>()

const attrs = useAttrs()
const styles = computed(() => sheetVariants({ side: props.side }))
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
      :data-side="side"
      style="contain: layout style"
      v-bind="{ ...$attrs, class: undefined }"
      @escape-key-down="handleEscapeKeyDown"
      @pointer-down-outside="handlePointerDownOutside"
      @interact-outside="handleInteractOutside"
    >
      <slot />
    </DialogContent>
  </DialogPortal>
</template>
