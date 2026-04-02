<script setup lang="ts">
import type { DzDialogOverlaySlots } from './DzDialog.types.ts'
import { DialogOverlay } from 'reka-ui'
/**
 * DzDialogOverlay -- Backdrop overlay for DzDialog compound.
 *
 * Wraps Reka UI DialogOverlay with token-based styling (ADR-04).
 * Typically rendered internally by DzDialogContent, but can be used standalone.
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { dialogVariants } from './DzDialog.variants.ts'

defineSlots<DzDialogOverlaySlots>()

const attrs = useAttrs()
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
  <DialogOverlay
    :class="overlayClasses"
    v-bind="{ ...$attrs, class: undefined }"
  />
</template>
