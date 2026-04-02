<script setup lang="ts">
import type { DzBadgeProps, DzBadgeSlots } from './DzBadge.types.ts'
/**
 * DzBadge — Compact label for status, counts, or categories.
 *
 * Supports three variants (solid, outline, subtle),
 * six semantic tones, and three sizes.
 *
 * @example
 * ```vue
 * <DzBadge tone="success">Active</DzBadge>
 * <DzBadge variant="outline" tone="danger" size="sm">3</DzBadge>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { badgeVariants } from './DzBadge.variants.ts'

const props = withDefaults(defineProps<DzBadgeProps>(), {
  variant: 'solid',
  tone: 'neutral',
  size: 'md',
})

defineSlots<DzBadgeSlots>()

const attrs = useAttrs()

/** Merged class string using cn() (ADR-10) */
const classes = computed(() =>
  cn(
    badgeVariants({ variant: props.variant, size: props.size, tone: props.tone }),
    attrs.class as string | undefined,
  ),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <span
    :class="classes"
    :data-tone="tone"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </span>
</template>
