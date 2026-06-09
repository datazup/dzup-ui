<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

import type {
  DzSearchInputEmits,
  DzSearchInputProps,
  DzSearchInputSlots,
} from './DzSearchInput.types.ts'
/**
 * DzSearchInput — Search input with search icon and clear button.
 *
 * Provides a search-specific input with built-in search icon prefix,
 * clear button, and Enter key submission.
 *
 * @example
 * ```vue
 * <DzSearchInput v-model="query" placeholder="Search..." @search="handleSearch" />
 * ```
 */
import { computed, onBeforeUnmount, ref, useAttrs, useId, watch } from 'vue'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { cn } from '../../utilities/cn.ts'
import DzSpinner from '../feedback/DzSpinner.vue'
import { inputElementVariants, inputWrapperVariants } from './DzInput.variants.ts'

const model = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<DzSearchInputProps>(), {
  variant: 'outline',
  size: 'md',
  tone: undefined,
  disabled: false,
  readonly: false,
  loading: false,
  invalid: false,
  required: false,
  clearable: true,
  debounce: 0,
  loadingLabel: 'Loading',
})

const emit = defineEmits<DzSearchInputEmits>()
defineSlots<DzSearchInputSlots>()

const attrs = useAttrs()
const inputRef = ref<HTMLInputElement | null>(null)
const autoId = useId()

/** Optional DzFormField context (ADR-08) — present only when inside a field */
const fieldContext = useFormFieldContext()

const resolvedId = computed(() => props.id ?? fieldContext?.fieldId ?? autoId)
const resolvedDisabled = computed(() => props.disabled || (fieldContext?.isDisabled.value ?? false))
const resolvedRequired = computed(() => props.required || (fieldContext?.isRequired.value ?? false))
const isInvalid = computed(
  () => props.invalid || !!props.error || (fieldContext?.isInvalid.value ?? false),
)

/** ID for the error message element (for aria-describedby) */
const errorId = computed(() => (props.error ? `${resolvedId.value}-error` : undefined))

/** Combined aria-describedby from prop + own error element + field context */
const resolvedAriaDescribedby = computed(() => {
  const parts: string[] = []
  if (props.ariaDescribedby)
    parts.push(props.ariaDescribedby)
  if (errorId.value)
    parts.push(errorId.value)
  if (fieldContext?.ariaDescribedby.value)
    parts.push(fieldContext.ariaDescribedby.value)
  return parts.length > 0 ? parts.join(' ') : undefined
})

const wrapperClasses = computed(() =>
  cn(
    inputWrapperVariants({
      variant: props.variant,
      size: props.size,
      invalid: isInvalid.value,
    }),
    attrs.class as string | undefined,
  ),
)

const inputClasses = computed(() => inputElementVariants())

/**
 * Spinner size mapped down from the input size so the indicator stays
 * proportionate to the field height (DzSpinner's md is 24px — too large).
 */
const spinnerSize = computed(() => {
  switch (props.size) {
    case 'xs':
    case 'sm':
      return 'xs' as const
    case 'xl':
      return 'md' as const
    default:
      return 'sm' as const
  }
})

function handleChange(): void {
  emit('change', model.value, { source: 'user' })
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}

// Debounced auto-search on input change
let debounceTimer: ReturnType<typeof setTimeout> | undefined

function cancelDebounce(): void {
  if (debounceTimer !== undefined) {
    clearTimeout(debounceTimer)
    debounceTimer = undefined
  }
}

if (props.debounce > 0) {
  watch(model, (value) => {
    cancelDebounce()
    if (!value)
      return
    debounceTimer = setTimeout(() => {
      emit('search', value)
    }, props.debounce)
  })
}

onBeforeUnmount(cancelDebounce)

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter') {
    cancelDebounce()
    emit('search', model.value)
  }
}

function handleClear(): void {
  cancelDebounce()
  model.value = ''
  emit('clear')
  emit('change', '', { source: 'user' })
  inputRef.value?.focus()
}

defineExpose({ inputRef })
</script>


<template>
  <div
    :data-state="resolvedDisabled ? 'disabled' : readonly ? 'readonly' : undefined"
    :data-tone="tone"
    :data-loading="loading ? '' : undefined"
    :data-disabled="resolvedDisabled ? '' : undefined"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <div :class="wrapperClasses">
      <!-- Search icon -->
      <span class="flex shrink-0 items-center text-[var(--dz-colors-neutral-400)]">
        <svg
          class="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>

      <!-- Search input -->
      <input
        :id="resolvedId"
        ref="inputRef"
        v-model="model"
        type="search"
        :class="inputClasses"
        :name="name"
        :placeholder="placeholder ?? 'Search...'"
        :disabled="resolvedDisabled"
        :readonly="readonly || loading"
        :required="resolvedRequired"
        :aria-label="ariaLabel ?? 'Search'"
        :aria-labelledby="ariaLabelledby"
        :aria-describedby="resolvedAriaDescribedby"
        :aria-invalid="isInvalid || undefined"
        :aria-required="resolvedRequired || undefined"
        :aria-busy="loading || undefined"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      >

      <!-- Loading spinner -->
      <DzSpinner
        v-if="loading"
        class="shrink-0"
        :size="spinnerSize"
        :tone="tone ?? 'neutral'"
        :label="loadingLabel"
      />

      <!-- Clear button -->
      <button
        v-if="clearable && model && !resolvedDisabled && !readonly && !loading"
        type="button"
        class="flex shrink-0 items-center justify-center text-[var(--dz-colors-neutral-400)] hover:text-[var(--dz-foreground)] transition-colors"
        aria-label="Clear search"
        tabindex="-1"
        @click="handleClear"
      >
        <svg
          class="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <!-- Suffix slot -->
      <slot name="suffix" />
    </div>

    <!-- Error message -->
    <p
      v-if="error"
      :id="errorId"
      class="mt-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)] text-[var(--dz-danger)]"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
/*
 * Suppress the browser's native search affordances. `type="search"` renders a
 * platform clear ("x") button and decoration that appear whenever the field has
 * a value — independent of the `clearable` prop. Hiding them ensures the only
 * clear control is our own button, which is gated on `clearable`.
 */
input[type='search']::-webkit-search-cancel-button,
input[type='search']::-webkit-search-decoration,
input[type='search']::-webkit-search-results-button,
input[type='search']::-webkit-search-results-decoration {
  -webkit-appearance: none;
  appearance: none;
}

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
