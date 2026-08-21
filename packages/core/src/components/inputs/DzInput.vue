<script setup lang="ts">
import type { DzInputEmits, DzInputProps, DzInputSlots } from './DzInput.types.ts'
/**
 * DzInput — Text input component with v-model binding.
 *
 * Supports three variants (outline, filled, underlined), five sizes,
 * prefix/suffix slots, clearable behavior, and full a11y compliance.
 *
 * @example
 * ```vue
 * <DzInput v-model="email" type="email" placeholder="Enter email" />
 * <DzInput v-model="search" clearable variant="filled" size="sm">
 *   <template #prefix><SearchIcon /></template>
 * </DzInput>
 * ```
 */
import { computed, inject, ref, useAttrs, useId } from 'vue'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { useComponentMessages } from '../../i18n/useComponentMessages.ts'
import { cn } from '../../utilities/cn.ts'
import DzSpinner from '../feedback/DzSpinner.vue'
import { inputElementVariants, inputWrapperVariants } from './DzInput.variants.ts'
import { DZ_INPUT_GROUP_KEY } from './DzInputGroup.types.ts'

defineOptions({
  inheritAttrs: false,
})

const model = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<DzInputProps>(), {
  variant: 'outline',
  size: undefined,
  tone: undefined,
  type: 'text',
  disabled: false,
  readonly: false,
  loading: false,
  invalid: false,
  required: false,
  clearable: false,
  loadingLabel: undefined,
  ui: undefined,
})

const emit = defineEmits<DzInputEmits>()
defineSlots<DzInputSlots>()
// User-visible strings, resolved against the application's catalog (ADR-20).
// An explicit prop still wins; these are the defaults that used to be literals.
const dzMessages = useComponentMessages('DzInput')
const resolvedLoadingLabel = computed(() => props.loadingLabel ?? dzMessages.value.loading)

const attrs = useAttrs()
const inputRef = ref<HTMLInputElement | null>(null)
const autoId = useId()

/** Optional DzInputGroup context (ADR-08) — present only when grouped */
const groupContext = inject(DZ_INPUT_GROUP_KEY, null)

/** Optional DzFormField context (ADR-08) — present only when inside a field */
const fieldContext = useFormFieldContext()

/** Whether this input is nested inside a DzInputGroup shell */
const isGrouped = computed(() => groupContext !== null)

/** Resolved size: own prop wins, then group context, then default */
const resolvedSize = computed(() => props.size ?? groupContext?.size.value ?? 'md')

/** Resolved disabled: own prop OR group-level OR form-field-level disabled */
const resolvedDisabled = computed(
  () => props.disabled || (groupContext?.disabled.value ?? false) || (fieldContext?.isDisabled.value ?? false),
)

/** Resolved required: own prop OR form-field-level required */
const resolvedRequired = computed(() => props.required || (fieldContext?.isRequired.value ?? false))

/** Resolved element ID — explicit prop wins, then the field context's control ID */
const resolvedId = computed(() => props.id ?? fieldContext?.fieldId ?? autoId)

/** Whether the invalid state should show (own prop/error OR form-field-level) */
const isInvalid = computed(
  () => props.invalid || !!props.error || (fieldContext?.isInvalid.value ?? false),
)

/**
 * Control classes merged with consumer class via cn() (ADR-10).
 *
 * `class` lands on the visual field rather than on the outer root: that is
 * where it has always landed, and moving it now would silently restyle every
 * existing consumer. `ui.root` reaches the outer node (ADR-19).
 */
const controlClasses = computed(() =>
  cn(
    inputWrapperVariants({
      variant: props.variant,
      size: resolvedSize.value,
      tone: props.tone ?? 'neutral',
      invalid: isInvalid.value,
      seamless: isGrouped.value,
    }),
    props.ui?.control,
    attrs.class as string | undefined,
  ),
)

/** Affix classes — shared by the prefix and suffix parts, overridable apart. */
const AFFIX_BASE = 'flex shrink-0 items-center text-[var(--dz-colors-neutral-400)]'
const prefixClasses = computed(() => cn(AFFIX_BASE, props.ui?.prefix))
const suffixClasses = computed(() => cn(AFFIX_BASE, props.ui?.suffix))

const spinnerClasses = computed(() => cn('shrink-0', props.ui?.spinner))

const clearClasses = computed(() => cn(
  'flex shrink-0 items-center justify-center text-[var(--dz-colors-neutral-400)] '
  + 'hover:text-[var(--dz-foreground)] transition-colors',
  props.ui?.clear,
))

const errorClasses = computed(() => cn(
  'mt-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)] text-[var(--dz-danger)]',
  props.ui?.error,
))

/**
 * Spinner size mapped down from the input size so the indicator stays
 * proportionate to the field height (DzSpinner's md is 24px — too large).
 */
const spinnerSize = computed(() => {
  switch (resolvedSize.value) {
    case 'xs':
    case 'sm':
      return 'xs' as const
    case 'xl':
      return 'md' as const
    default:
      return 'sm' as const
  }
})

/** Inner input element classes */
const inputClasses = computed(() => cn(inputElementVariants(), props.ui?.input))

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

function handleChange(): void {
  emit('change', model.value, { source: 'user' })
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}

function handleClear(): void {
  model.value = ''
  emit('clear')
  emit('change', '', { source: 'user' })
  inputRef.value?.focus()
}

/** Expose the native input ref for programmatic focus */
defineExpose({ inputRef })
</script>

<template>
  <div
    data-part="root"
    :class="cn(ui?.root)"
    :data-state="resolvedDisabled ? 'disabled' : loading ? 'loading' : readonly ? 'readonly' : undefined"
    :data-tone="tone"
    :data-loading="loading ? '' : undefined"
    :data-disabled="resolvedDisabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <!-- The visual field: border, background, focus ring -->
    <div data-part="control" :class="controlClasses">
      <!-- Prefix slot -->
      <span
        v-if="$slots.prefix"
        data-part="prefix"
        :class="prefixClasses"
      >
        <slot name="prefix" />
      </span>

      <!-- Native input element -->
      <input
        :id="resolvedId"
        ref="inputRef"
        v-model="model"
        data-part="input"
        :type="type"
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

      <!-- Clear button -->
      <button
        v-if="clearable && model && !resolvedDisabled && !readonly && !loading"
        type="button"
        data-part="clear"
        :class="clearClasses"
        :aria-label="dzMessages.clear"
        tabindex="-1"
        @click="handleClear"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
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
      <span
        v-if="$slots.suffix"
        data-part="suffix"
        :class="suffixClasses"
      >
        <slot name="suffix" />
      </span>
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
