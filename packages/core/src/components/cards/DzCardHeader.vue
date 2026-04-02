<script setup lang="ts">
/**
 * DzCardHeader — Structural sub-part for the card header section.
 *
 * Provides a flex layout with content and an optional actions slot.
 *
 * @example
 * ```vue
 * <DzCardHeader>
 *   <h3>Card Title</h3>
 *   <template #actions>
 *     <DzButton variant="ghost" size="sm">Edit</DzButton>
 *   </template>
 * </DzCardHeader>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { cardHeaderVariants } from './DzCard.variants.ts'

const attrs = useAttrs()

/** Computed class string merging variant classes with consumer overrides (ADR-10). */
const classes = computed(() =>
  cn(cardHeaderVariants(), attrs.class as string),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div :class="classes">
    <div class="flex-1 min-w-0">
      <slot />
    </div>
    <div v-if="$slots.actions" class="ml-[var(--dz-spacing-3)] flex-shrink-0">
      <slot name="actions" />
    </div>
  </div>
</template>
