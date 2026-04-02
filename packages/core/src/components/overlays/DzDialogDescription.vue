<script setup lang="ts">
import type { DzDialogDescriptionSlots } from './DzDialog.types.ts'
import { DialogDescription } from 'reka-ui'
/**
 * DzDialogDescription -- Description element for DzDialog compound.
 *
 * Wraps Reka UI DialogDescription with token-based styling.
 * Reka UI auto-sets aria-describedby on the dialog content.
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { dialogVariants } from './DzDialog.variants.ts'

defineSlots<DzDialogDescriptionSlots>()

const attrs = useAttrs()
const styles = computed(() => dialogVariants())
const descriptionClasses = computed(() =>
  cn(styles.value.description(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <DialogDescription
    :class="descriptionClasses"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </DialogDescription>
</template>
