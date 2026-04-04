<script setup lang="ts">
import type { DzIconButtonEmits, DzIconButtonProps } from './DzIconButton.types.ts'
/**
 * DzIconButton — Icon-only button component.
 *
 * Renders a single icon with no visible text. Requires `ariaLabel`
 * for accessibility. Extends the DzButton API.
 *
 * @example
 * ```vue
 * <DzIconButton :icon="PlusIcon" aria-label="Add item" />
 * <DzIconButton :icon="TrashIcon" aria-label="Delete" tone="danger" size="sm" />
 * ```
 */
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { buttonVariants } from './DzButton.variants.ts'
import { DZ_BUTTON_GROUP_KEY } from './DzButtonGroup.types.ts'

const props = withDefaults(defineProps<DzIconButtonProps>(), {
  variant: undefined,
  size: undefined,
  tone: undefined,
  disabled: false,
  loading: false,
  type: 'button',
})

const emit = defineEmits<DzIconButtonEmits>()

const attrs = useAttrs()
const groupContext = inject(DZ_BUTTON_GROUP_KEY, null)

const resolvedSize = computed(() => props.size ?? groupContext?.size.value ?? 'md')
const resolvedVariant = computed(() => props.variant ?? groupContext?.variant.value ?? 'solid')
const resolvedTone = computed(() => props.tone ?? groupContext?.tone.value ?? 'primary')
const resolvedDisabled = computed(() => props.disabled || (groupContext?.disabled.value ?? false))
const isInert = computed(() => resolvedDisabled.value || props.loading)

/** Icon size class based on resolved size */
const iconSizeClass = computed(() => {
  const map: Record<string, string> = {
    xs: 'h-3.5 w-3.5',
    sm: 'h-4 w-4',
    md: 'h-[18px] w-[18px]',
    lg: 'h-5 w-5',
    xl: 'h-[22px] w-[22px]',
  }
  return map[resolvedSize.value] ?? 'h-[18px] w-[18px]'
})

/** Square button dimensions per size */
const squareSizeClass = computed(() => {
  const map: Record<string, string> = {
    xs: 'h-[var(--dz-button-xs-height)] w-[var(--dz-button-xs-height)]',
    sm: 'h-[var(--dz-button-sm-height)] w-[var(--dz-button-sm-height)]',
    md: 'h-[var(--dz-button-md-height)] w-[var(--dz-button-md-height)]',
    lg: 'h-[var(--dz-button-lg-height)] w-[var(--dz-button-lg-height)]',
    xl: 'h-[var(--dz-button-xl-height)] w-[var(--dz-button-xl-height)]',
  }
  return map[resolvedSize.value] ?? map.md
})

const classes = computed(() =>
  cn(
    buttonVariants({
      variant: resolvedVariant.value,
      size: resolvedSize.value,
      tone: resolvedTone.value,
    }),
    // Override padding to make it square
    'p-0',
    squareSizeClass.value,
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

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <button
    :id="id"
    :type="type"
    :class="classes"
    :disabled="resolvedDisabled || undefined"
    :aria-disabled="isInert || undefined"
    :aria-busy="loading || undefined"
    :aria-label="ariaLabel"
    :data-state="loading ? 'loading' : resolvedDisabled ? 'disabled' : 'idle'"
    :data-tone="resolvedTone"
    :data-loading="loading ? '' : undefined"
    :data-disabled="resolvedDisabled ? '' : undefined"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <!-- Loading spinner -->
    <svg
      v-if="loading"
      class="animate-spin"
      :class="iconSizeClass"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>

    <!-- Icon (hidden when loading) -->
    <component
      :is="icon"
      v-else
      :class="iconSizeClass"
      aria-hidden="true"
    />
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
