<script setup lang="ts">
import type { BadgeVariant, CanonicalSize, CanonicalTone } from '@dzup-ui/contracts'
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
import { useDzDefaults } from '../../composables/provider/useDzEnvironment.ts'
import { cn } from '../../utilities/cn.ts'
import { badgeVariants } from './DzBadge.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzBadgeProps>(), {
  variant: undefined,
  tone: undefined,
  size: undefined,
})

defineSlots<DzBadgeSlots>()

const attrs = useAttrs()

/**
 * Application-wide defaults (ADR-20 §6, adopted in TASK-R5-O3).
 *
 * Each axis keeps the literal it carried in `withDefaults` as `resolve`'s last
 * link, so an unprovided tree renders exactly what it rendered before.
 */
const { resolve } = useDzDefaults()

/** Resolved variant: prop, then provider, then default */
const resolvedVariant = computed(
  () => resolve<BadgeVariant>('DzBadge', 'variant', [props.variant]) ?? 'solid',
)

/** Resolved size: prop, then provider, then default */
const resolvedSize = computed(
  () => resolve<CanonicalSize>('DzBadge', 'size', [props.size]) ?? 'md',
)

/** Resolved tone: prop, then provider, then default */
const resolvedTone = computed(
  () => resolve<CanonicalTone>('DzBadge', 'tone', [props.tone]) ?? 'neutral',
)

/** Merged class string using cn() (ADR-10) */
const classes = computed(() =>
  cn(
    badgeVariants({ variant: resolvedVariant.value, size: resolvedSize.value, tone: resolvedTone.value }),
    attrs.class as string | undefined,
  ),
)
</script>

<template>
  <span
    :class="classes"
    data-state="ready"
    :data-tone="resolvedTone"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </span>
</template>
