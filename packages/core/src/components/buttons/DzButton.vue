<script setup lang="ts">
import type { DzButtonEmits, DzButtonProps, DzButtonSlots } from './DzButton.types.ts'
/**
 * DzButton — Primary button component.
 *
 * Supports five variants (solid, outline, ghost, text, link),
 * six semantic tones, five sizes, loading/disabled states,
 * and prefix/suffix icon slots.
 *
 * @example
 * ```vue
 * <DzButton tone="primary" @click="handleClick">Save</DzButton>
 * <DzButton variant="outline" size="sm" loading>Processing</DzButton>
 * ```
 */
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { buttonVariants } from './DzButton.variants.ts'
import { DZ_BUTTON_GROUP_KEY } from './DzButtonGroup.types.ts'

const props = withDefaults(defineProps<DzButtonProps>(), {
  variant: undefined,
  size: undefined,
  tone: undefined,
  disabled: false,
  loading: false,
  type: 'button',
  asChild: false,
})

const emit = defineEmits<DzButtonEmits>()
defineSlots<DzButtonSlots>()

const attrs = useAttrs()
const groupContext = inject(DZ_BUTTON_GROUP_KEY, null)

/** Resolved size: prop wins, then group context, then default */
const resolvedSize = computed(() => props.size ?? groupContext?.size.value ?? 'md')

/** Resolved variant: prop wins, then group context, then default */
const resolvedVariant = computed(() => props.variant ?? groupContext?.variant.value ?? 'solid')

/** Resolved tone: prop wins, then group context, then default */
const resolvedTone = computed(() => props.tone ?? groupContext?.tone.value ?? 'primary')

/** Resolved disabled: own prop OR group-level disabled */
const resolvedDisabled = computed(() => props.disabled || (groupContext?.disabled.value ?? false))

/** Whether interaction is blocked */
const isInert = computed(() => resolvedDisabled.value || props.loading)

/** Merged class string using cn() (ADR-10) */
const classes = computed(() =>
  cn(
    buttonVariants({
      variant: resolvedVariant.value,
      size: resolvedSize.value,
      tone: resolvedTone.value,
    }),
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
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
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
      :class="[
        resolvedSize === 'xs' ? 'h-3 w-3' : '',
        resolvedSize === 'sm' ? 'h-3.5 w-3.5' : '',
        resolvedSize === 'md' ? 'h-4 w-4' : '',
        resolvedSize === 'lg' ? 'h-5 w-5' : '',
        resolvedSize === 'xl' ? 'h-5 w-5' : '',
      ]"
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

    <!-- Prefix slot (hidden during loading to avoid double icon) -->
    <slot v-if="!loading" name="prefix" />

    <!-- Default content -->
    <slot />

    <!-- Suffix slot -->
    <slot name="suffix" />
  </button>
</template>
