<script setup lang="ts">
import type {
  DzSplitButtonActionEmits,
  DzSplitButtonActionProps,
  DzSplitButtonActionSlots,
} from './DzSplitButton.types.ts'
/**
 * DzSplitButtonAction — Primary action button within DzSplitButton.
 *
 * Inherits variant, size, tone, disabled, and loading from parent context.
 *
 * @example
 * ```vue
 * <DzSplitButtonAction @click="save">Save</DzSplitButtonAction>
 * ```
 */
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { buttonVariants } from './DzButton.variants.ts'
import { DZ_SPLIT_BUTTON_KEY } from './DzSplitButton.types.ts'

defineOptions({
  inheritAttrs: false,
})

defineProps<DzSplitButtonActionProps>()
const emit = defineEmits<DzSplitButtonActionEmits>()
defineSlots<DzSplitButtonActionSlots>()

const attrs = useAttrs()
const ctx = inject(DZ_SPLIT_BUTTON_KEY, null)

const isInert = computed(() => (ctx?.disabled.value ?? false) || (ctx?.loading.value ?? false))

const classes = computed(() =>
  cn(
    buttonVariants({
      variant: ctx?.variant.value ?? 'solid',
      size: ctx?.size.value ?? 'md',
      tone: ctx?.tone.value ?? 'primary',
    }),
    // Remove right rounding for split button effect
    'rounded-r-none border-r-0',
    attrs.class as string | undefined,
  ),
)

function handleClick(event: MouseEvent): void {
  if (isInert.value) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  emit('click', event)
}
</script>

<template>
  <button
    type="button"
    :class="classes"
    :disabled="ctx?.disabled.value || undefined"
    :aria-disabled="isInert || undefined"
    :aria-busy="ctx?.loading.value || undefined"
    :aria-label="ariaLabel"
    :data-state="ctx?.loading.value ? 'loading' : ctx?.disabled.value ? 'disabled' : 'idle'"
    :data-tone="ctx?.tone.value"
    :data-disabled="ctx?.disabled.value ? '' : undefined"
    :data-loading="ctx?.loading.value ? '' : undefined"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
    @click="handleClick"
  >
    <!-- Loading: spinner replaces the visible label, but the label stays
         available to assistive tech (sr-only) so the button keeps an
         accessible name (axe button-name). An author-supplied aria-label
         takes precedence and covers icon-only actions. -->
    <template v-if="ctx?.loading.value">
      <svg
        class="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span class="sr-only"><slot /></span>
    </template>
    <slot v-else />
  </button>
</template>

<style scoped>
/* Accessibility: respect user's motion preference */
@media (prefers-reduced-motion: reduce) {
  :deep(*),
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
