<script setup lang="ts">
import type { DzCardEmits, DzCardProps } from './DzCard.types.ts'
/**
 * DzCard — A surface container component.
 *
 * Supports three visual variants (elevated, outlined, flat), configurable padding,
 * and optional interactive behavior (hoverable, clickable).
 *
 * When `clickable` is true, the card gains `role="button"`, `tabindex="0"`,
 * and keyboard support for Enter/Space activation.
 *
 * @example
 * ```vue
 * <DzCard variant="outlined" padding="lg">
 *   <template #header>Title</template>
 *   <template #default>Content here</template>
 *   <template #footer>Footer content</template>
 * </DzCard>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { cardVariants } from './DzCard.variants.ts'

const props = withDefaults(defineProps<DzCardProps>(), {
  variant: 'elevated',
  padding: 'md',
  hoverable: false,
  clickable: false,
  asChild: false,
})

const emit = defineEmits<DzCardEmits>()

const attrs = useAttrs()

/** Computed class string merging variant classes with consumer overrides (ADR-10). */
const classes = computed(() =>
  cn(
    cardVariants({
      variant: props.variant,
      padding: props.padding,
      hoverable: props.hoverable || undefined,
      clickable: props.clickable || undefined,
    }),
    attrs.class as string,
  ),
)

/** Data attributes for external state targeting. */
const dataAttrs = computed(() => ({
  'data-state': props.clickable ? 'interactive' : 'static',
  'data-variant': props.variant,
}))

/** Accessibility attributes — button semantics when clickable. */
const a11yAttrs = computed(() => {
  if (!props.clickable)
    return {}
  return {
    role: 'button' as const,
    tabindex: 0,
  }
})

/**
 * Handle click events — only emits when card is clickable.
 */
function handleClick(event: MouseEvent): void {
  if (props.clickable) {
    emit('click', event)
  }
}

/**
 * Handle keyboard activation — Enter/Space triggers click when clickable.
 */
function handleKeydown(event: KeyboardEvent): void {
  if (!props.clickable)
    return
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    emit('click', event)
  }
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    :class="classes"
    v-bind="{ ...dataAttrs, ...a11yAttrs }"
    style="contain: layout style"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <slot name="media" />
    <slot name="header" />
    <slot />
    <slot name="actions" />
    <slot name="footer" />
  </div>
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  div {
    transition-duration: 0.01ms !important;
  }
}
</style>
