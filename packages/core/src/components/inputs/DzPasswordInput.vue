<script setup lang="ts">
import type {
  DzPasswordInputEmits,
  DzPasswordInputProps,
  DzPasswordInputSlots,
} from './DzPasswordInput.types.ts'
/**
 * DzPasswordInput — Password input with visibility toggle.
 *
 * Wraps DzInput with a show/hide toggle button that switches
 * between password and text input types.
 *
 * @example
 * ```vue
 * <DzPasswordInput v-model="password" placeholder="Enter password" />
 * ```
 */
import { computed, ref, useAttrs, useId } from 'vue'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { useComponentMessages } from '../../i18n/useComponentMessages.ts'
import { cn } from '../../utilities/cn.ts'
import DzSpinner from '../feedback/DzSpinner.vue'
import { inputElementVariants, inputWrapperVariants } from './DzInput.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const model = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<DzPasswordInputProps>(), {
  variant: 'outline',
  size: 'md',
  tone: undefined,
  disabled: false,
  readonly: false,
  loading: false,
  invalid: false,
  required: false,
  loadingLabel: undefined,
  ui: undefined,
})

const emit = defineEmits<DzPasswordInputEmits>()
defineSlots<DzPasswordInputSlots>()
// User-visible strings, resolved against the application's catalog (ADR-20).
// An explicit prop still wins; these are the defaults that used to be literals.
const dzMessages = useComponentMessages('DzPasswordInput')
const resolvedLoadingLabel = computed(() => props.loadingLabel ?? dzMessages.value.loading)

const attrs = useAttrs()
const inputRef = ref<HTMLInputElement | null>(null)
const autoId = useId()
const showPassword = ref(false)

/** Optional DzFormField context (ADR-08) — present only when inside a field */
const fieldContext = useFormFieldContext()

const resolvedId = computed(() => props.id ?? fieldContext?.fieldId ?? autoId)
const resolvedDisabled = computed(() => props.disabled || (fieldContext?.isDisabled.value ?? false))
const resolvedRequired = computed(() => props.required || (fieldContext?.isRequired.value ?? false))
const isInvalid = computed(
  () => props.invalid || !!props.error || (fieldContext?.isInvalid.value ?? false),
)

const wrapperClasses = computed(() =>
  cn(
    inputWrapperVariants({
      variant: props.variant,
      size: props.size,
      invalid: isInvalid.value,
    }),
    attrs.class as string | undefined,
    props.ui?.control,
  ),
)

// The outer shell paints the field surface, so the autofill cover stays clear
// rather than repainting --dz-input-bg over it (styles/base.css § 4c).
const inputClasses = computed(() => cn(
  inputElementVariants(),
  'dz-native-input-autofill-clear',
  props.ui?.input,
))

/** Per-part class values (ADR-19 §5). */
const prefixClasses = computed(() => cn(
  'flex shrink-0 items-center text-[var(--dz-colors-neutral-400)]',
  props.ui?.prefix,
))
const spinnerClasses = computed(() => cn('shrink-0', props.ui?.spinner))
const toggleClasses = computed(() => cn(
  'dz-target-min-tight [--dz-control-visual-size:1rem] flex shrink-0 items-center '
  + 'justify-center text-[var(--dz-colors-neutral-400)] hover:text-[var(--dz-foreground)] '
  + 'transition-colors',
  props.ui?.toggle,
))
const errorClasses = computed(() => cn(
  'mt-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)] text-[var(--dz-danger)]',
  props.ui?.error,
))

/**
 * Spinner size mapped down from the field size so the indicator stays
 * proportionate to the field height (mirrors DzInput).
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

const errorId = computed(() => (props.error ? `${resolvedId.value}-error` : undefined))
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

function toggleVisibility(): void {
  showPassword.value = !showPassword.value
}

function handleChange(): void {
  emit('change', model.value, { source: 'user' })
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}

defineExpose({ inputRef })
</script>

<template>
  <div
    data-part="root"
    :class="cn(ui?.root)"
    :data-state="
      resolvedDisabled ? 'disabled' : loading ? 'loading' : readonly ? 'readonly' : undefined
    "
    :data-tone="tone"
    :data-loading="loading ? '' : undefined"
    :data-disabled="resolvedDisabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
    :data-required="resolvedRequired ? '' : undefined"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <div data-part="control" :class="wrapperClasses">
      <!-- Prefix slot -->
      <span
        v-if="$slots.prefix"
        data-part="prefix"
        :class="prefixClasses"
      >
        <slot name="prefix" />
      </span>

      <!-- Password input -->
      <input
        :id="resolvedId"
        ref="inputRef"
        v-model="model"
        data-part="input"
        :type="showPassword ? 'text' : 'password'"
        :class="inputClasses"
        :name="name"
        :placeholder="placeholder"
        :disabled="resolvedDisabled"
        :readonly="readonly || loading"
        :required="resolvedRequired"
        :maxlength="maxlength"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
        :aria-describedby="resolvedAriaDescribedby"
        :aria-invalid="isInvalid || undefined"
        :aria-required="resolvedRequired || undefined"
        :aria-busy="loading || undefined"
        autocomplete="current-password"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      >

      <!-- Loading spinner -->
      <DzSpinner
        v-if="loading"
        data-part="spinner"
        :class="spinnerClasses"
        :size="spinnerSize"
        :tone="tone ?? 'neutral'"
        :label="resolvedLoadingLabel"
      />

      <!-- Toggle visibility button -->
      <button
        type="button"
        data-part="toggle"
        :class="toggleClasses"
        :aria-label="showPassword ? 'Hide password' : 'Show password'"
        :aria-pressed="showPassword"
        :disabled="resolvedDisabled || loading"
        tabindex="-1"
        @click="toggleVisibility"
      >
        <!-- Eye icon (show password) -->
        <svg
          v-if="!showPassword"
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
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <!-- Eye-off icon (hide password) -->
        <svg
          v-else
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
          <path
            d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
          />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      </button>
    </div>

    <!-- Error message -->
    <p
      v-if="error"
      :id="errorId"
      data-part="error"
      :class="errorClasses"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>
