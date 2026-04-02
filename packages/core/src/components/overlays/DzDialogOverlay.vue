<script setup lang="ts">
import type { DzDialogOverlaySlots } from './DzDialog.types.ts'
import { DialogOverlay } from 'reka-ui'
/**
 * DzDialogOverlay -- Backdrop overlay for DzDialog compound.
 *
 * Wraps Reka UI DialogOverlay with token-based styling (ADR-04).
 * Supports open/close fade transition via parent DzDialog context.
 * Typically rendered internally by DzDialogContent, but can be used standalone.
 */
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_DIALOG_KEY } from './DzDialog.types.ts'
import { dialogVariants } from './DzDialog.variants.ts'

defineSlots<DzDialogOverlaySlots>()

const attrs = useAttrs()
const dialogCtx = inject(DZ_DIALOG_KEY, undefined)
const overlayTransitionName = computed(() => dialogCtx?.overlayTransition.value ?? 'dz-dialog-overlay')

const styles = computed(() => dialogVariants())
const overlayClasses = computed(() =>
  cn(styles.value.overlay(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <Transition :name="overlayTransitionName">
    <DialogOverlay
      :class="overlayClasses"
      v-bind="{ ...$attrs, class: undefined }"
    />
  </Transition>
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

/* Respect reduced motion preference (MANDATORY per CLAUDE.md) */
@media (prefers-reduced-motion: reduce) {
  .dz-dialog-overlay-enter-active,
  .dz-dialog-overlay-leave-active {
    transition: none;
  }
}
</style>
