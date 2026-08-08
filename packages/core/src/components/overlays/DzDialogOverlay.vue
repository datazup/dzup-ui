<script setup lang="ts">
import type { DzDialogOverlaySlots } from './DzDialog.types.ts'
import { DialogOverlay } from 'reka-ui'
/**
 * DzDialogOverlay -- Backdrop overlay for DzDialog compound.
 *
 * Wraps Reka UI DialogOverlay with token-based styling (ADR-04).
 * Supports open/close fade transition via parent DzDialog context.
 * DzDialogContent already owns and renders the normal dialog backdrop. Use this
 * component only for advanced low-level composition; do not render it as a
 * sibling of DzDialogContent or the dialog will have two overlays.
 */
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_DIALOG_KEY } from './DzDialog.types.ts'
import { dialogVariants } from './DzDialog.variants.ts'

defineOptions({
  inheritAttrs: false,
})

defineSlots<DzDialogOverlaySlots>()

const attrs = useAttrs()
const dialogCtx = inject(DZ_DIALOG_KEY, undefined)
const overlayTransitionName = computed(() => dialogCtx?.overlayTransition.value ?? 'dz-dialog-overlay')

const styles = computed(() => dialogVariants())
const overlayClasses = computed(() =>
  cn(styles.value.overlay(), attrs.class as string | undefined),
)
</script>

<template>
  <Transition :name="overlayTransitionName">
    <DialogOverlay
      :class="overlayClasses"
      v-bind="{ ...$attrs, class: undefined }"
    />
  </Transition>
</template>
