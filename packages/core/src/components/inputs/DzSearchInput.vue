<script setup lang="ts">
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
import { computed, ref, useAttrs, useId } from 'vue'
import { cn } from '../../utilities/cn.ts'
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
})

const emit = defineEmits<DzSearchInputEmits>()
defineSlots<DzSearchInputSlots>()

const attrs = useAttrs()
const inputRef = ref<HTMLInputElement | null>(null)
const autoId = useId()

const resolvedId = computed(() => props.id ?? autoId)
const isInvalid = computed(() => props.invalid || !!props.error)

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

function handleChange(): void {
  emit('change', model.value, { source: 'user' })
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter') {
    emit('search', model.value)
  }
}

function handleClear(): void {
  model.value = ''
  emit('clear')
  emit('change', '', { source: 'user' })
  inputRef.value?.focus()
}

defineExpose({ inputRef })
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    :data-state="disabled ? 'disabled' : readonly ? 'readonly' : undefined"
    :data-tone="tone"
    :data-loading="loading ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
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
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :aria-label="ariaLabel ?? 'Search'"
        :aria-labelledby="ariaLabelledby"
        :aria-describedby="ariaDescribedby"
        :aria-invalid="isInvalid || undefined"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      >

      <!-- Clear button -->
      <button
        v-if="clearable && model && !disabled && !readonly"
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
      class="mt-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)] text-[var(--dz-danger)]"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
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
