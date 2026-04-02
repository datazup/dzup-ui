<script setup lang="ts">
/**
 * DzCardBody — Structural sub-part for the card body/content section.
 *
 * @example
 * ```vue
 * <DzCardBody>
 *   <p>Card content goes here.</p>
 * </DzCardBody>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { cardBodyVariants } from './DzCard.variants.ts'

const attrs = useAttrs()

/** Computed class string merging variant classes with consumer overrides (ADR-10). */
const classes = computed(() =>
  cn(cardBodyVariants(), attrs.class as string),
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
