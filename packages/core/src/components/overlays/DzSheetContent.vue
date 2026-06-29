<script setup lang="ts">
import type { DzSheetContentEmits, DzSheetContentProps, DzSheetContentSlots } from './DzSheet.types.ts'
import { DialogContent, DialogOverlay, DialogPortal, injectDialogRootContext } from 'reka-ui'
/**
 * DzSheetContent — Content panel for DzSheet compound.
 *
 * Wraps Reka UI DialogPortal + DialogOverlay + DialogContent
 * with sheet-specific side positioning.
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { sheetVariants } from './DzSheet.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzSheetContentProps>(), {
  side: 'right',
  size: 'sm',
})

const emit = defineEmits<DzSheetContentEmits>()
defineSlots<DzSheetContentSlots>()

const attrs = useAttrs()

const rootContext = injectDialogRootContext()

/**
 * Accessibility attributes forwarded to Reka's DialogContent.
 *
 * Reka UI auto-wires `aria-labelledby` (DzSheetTitle) and `aria-describedby`
 * (DzSheetDescription) via the dialog root context; binding them to `undefined`
 * would strip those ids. Forward consumer overrides ONLY when provided, and
 * surface `aria-modal` here since Reka 2.9.x does not emit it.
 */
const contentAria = computed<Record<string, unknown>>(() => {
  const aria: Record<string, unknown> = {}
  if (props.ariaLabel !== undefined)
    aria['aria-label'] = props.ariaLabel
  if (props.ariaLabelledby !== undefined)
    aria['aria-labelledby'] = props.ariaLabelledby
  if (props.ariaDescribedby !== undefined)
    aria['aria-describedby'] = props.ariaDescribedby
  if (rootContext.modal.value)
    aria['aria-modal'] = 'true'
  return aria
})

const styles = computed(() => sheetVariants({ side: props.side, size: props.size }))
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

<template>
  <DialogPortal>
    <DialogOverlay :class="overlayClasses" />
    <DialogContent
      :id="id"
      :class="contentClasses"
      :data-side="side"
      style="contain: layout style"
      v-bind="{ ...contentAria, ...$attrs, class: undefined }"
      @escape-key-down="handleEscapeKeyDown"
      @pointer-down-outside="handlePointerDownOutside"
      @interact-outside="handleInteractOutside"
    >
      <slot />
    </DialogContent>
  </DialogPortal>
</template>
