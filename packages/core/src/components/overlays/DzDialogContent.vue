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
 * Supports open/close transitions via parent DzDialog context.
 *
 * @example
 * ```vue
 * <DzDialogContent size="lg">
 *   <DzDialogTitle>Large dialog</DzDialogTitle>
 *   <DzDialogDescription>Content here</DzDialogDescription>
 * </DzDialogContent>
 * ```
 */
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_DIALOG_KEY } from './DzDialog.types.ts'
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

const dialogCtx = inject(DZ_DIALOG_KEY, undefined)
const overlayTransitionName = computed(() => dialogCtx?.overlayTransition.value ?? 'dz-dialog-overlay')
const contentTransitionName = computed(() => dialogCtx?.contentTransition.value ?? 'dz-dialog-content')

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
    <Transition :name="overlayTransitionName">
      <DialogOverlay :class="overlayClasses" />
    </Transition>
    <Transition :name="contentTransitionName">
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
    </Transition>
  </DialogPortal>
</template>

<style scoped>
/* Overlay fade transition */
.dz-dialog-overlay-enter-active,
.dz-dialog-overlay-leave-active {
  transition: opacity var(--dz-transition-fast, 150ms) ease;
}

.dz-dialog-overlay-enter-from,
.dz-dialog-overlay-leave-to {
  opacity: 0;
}

/* Content scale + fade transition */
.dz-dialog-content-enter-active,
.dz-dialog-content-leave-active {
  transition:
    opacity var(--dz-transition-fast, 150ms) ease,
    transform var(--dz-transition-fast, 150ms) ease;
}

.dz-dialog-content-enter-from,
.dz-dialog-content-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(4px);
}

/* Respect reduced motion preference (MANDATORY per CLAUDE.md) */
@media (prefers-reduced-motion: reduce) {
  .dz-dialog-overlay-enter-active,
  .dz-dialog-overlay-leave-active,
  .dz-dialog-content-enter-active,
  .dz-dialog-content-leave-active {
    transition: none;
  }
}
</style>
