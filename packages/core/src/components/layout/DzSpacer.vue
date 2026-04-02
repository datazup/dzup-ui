<script setup lang="ts">
import type { DzSpacerProps } from './DzSpacer.types.ts'
/**
 * DzSpacer -- Flexible space filler.
 *
 * When size is 'auto', fills available space with `flex: 1`.
 * Fixed sizes use token-based spacing values.
 *
 * @example
 * ```vue
 * <DzFlex>
 *   <span>Left</span>
 *   <DzSpacer />
 *   <span>Right</span>
 * </DzFlex>
 *
 * <DzStack>
 *   <div>Top</div>
 *   <DzSpacer size="lg" />
 *   <div>Bottom</div>
 * </DzStack>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'

const props = withDefaults(defineProps<DzSpacerProps>(), {
  size: 'auto',
})

const attrs = useAttrs()

/** Size-to-class mapping using token CSS variables */
const sizeClassMap: Record<string, string> = {
  auto: 'flex-1',
  xs: 'w-[var(--dz-spacing-1)] h-[var(--dz-spacing-1)]',
  sm: 'w-[var(--dz-spacing-2)] h-[var(--dz-spacing-2)]',
  md: 'w-[var(--dz-spacing-4)] h-[var(--dz-spacing-4)]',
  lg: 'w-[var(--dz-spacing-6)] h-[var(--dz-spacing-6)]',
  xl: 'w-[var(--dz-spacing-8)] h-[var(--dz-spacing-8)]',
}

/** Merged class string using cn() (ADR-10) */
const classes = computed(() =>
  cn(
    'shrink-0',
    sizeClassMap[props.size] ?? 'flex-1',
    props.size === 'auto' ? 'shrink' : '',
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
  <div
    :class="classes"
    aria-hidden="true"
    v-bind="{ ...$attrs, class: undefined }"
  />
</template>
