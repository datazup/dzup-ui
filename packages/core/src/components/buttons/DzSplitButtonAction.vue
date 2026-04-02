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

<script lang="ts">
export default {
  inheritAttrs: false,
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
    v-bind="{ ...$attrs, class: undefined }"
    @click="handleClick"
  >
    <!-- Loading spinner -->
    <svg
      v-if="ctx?.loading.value"
      class="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
    <slot v-else />
  </button>
</template>
