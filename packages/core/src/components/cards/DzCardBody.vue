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
import type { DzCardBodySlots } from './DzCard.types.ts'
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { cardBodyVariants } from './DzCard.variants.ts'

defineOptions({
  inheritAttrs: false,
})

defineSlots<DzCardBodySlots>()

const attrs = useAttrs()

/** Computed class string merging variant classes with consumer overrides (ADR-10). */
const classes = computed(() =>
  cn(cardBodyVariants(), attrs.class as string),
)
</script>

<template>
  <div data-part="body" :class="classes">
    <slot />
  </div>
</template>
