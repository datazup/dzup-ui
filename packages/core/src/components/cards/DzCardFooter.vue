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
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { cardFooterVariants } from './DzCard.variants.ts'

const attrs = useAttrs()

/** Computed class string merging variant classes with consumer overrides (ADR-10). */
const classes = computed(() =>
  cn(cardFooterVariants(), attrs.class as string),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
