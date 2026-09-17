<script setup lang="ts">
/**
 * DzCardFooter — Structural sub-part for the card footer section.
 *
 * @example
 * ```vue
 * <DzCardFooter>
 *   <DzButton variant="ghost">Cancel</DzButton>
 *   <DzButton>Save</DzButton>
 * </DzCardFooter>
 * ```
 */
import type { DzCardFooterSlots } from './DzCard.types.ts'
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { cardFooterVariants } from './DzCard.variants.ts'

defineOptions({
  inheritAttrs: false,
})

defineSlots<DzCardFooterSlots>()

const attrs = useAttrs()

/** Computed class string merging variant classes with consumer overrides (ADR-10). */
const classes = computed(() =>
  cn(cardFooterVariants(), attrs.class as string),
)
</script>

<template>
  <div data-part="footer" :class="classes">
    <slot />
  </div>
</template>
