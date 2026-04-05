/**
 * useFormField — Provides form field context to nested sub-parts.
 *
 * Generates unique IDs via Vue 3.5 `useId()` and provides them to
 * DzFormLabel, DzFormDescription, and DzFormMessage via inject (ADR-08).
 *
 * @module @dzip-ui/core/composables/useFormField
 */

import type { ComputedRef, InjectionKey, MaybeRef } from 'vue'
import {
  computed,

  inject,

  provide,
  toValue,
  useId,
} from 'vue'

// ---------------------------------------------------------------------------
// Context interface (ADR-08)
// ---------------------------------------------------------------------------

/** Context shape provided by DzFormField to child sub-parts */
export interface DzFormFieldContext {
  /** Unique ID for the form control (used by label `for` attribute) */
  fieldId: string
  /** ID for the label element */
  labelId: string
  /** ID for the description element */
  descriptionId: string
  /** ID for the error message element */
  messageId: string
  /** Computed aria-describedby linking description + error IDs when present */
  ariaDescribedby: ComputedRef<string | undefined>
  /** Whether the field is currently invalid */
  isInvalid: ComputedRef<boolean>
  /** Whether the field is required */
  isRequired: ComputedRef<boolean>
  /** Whether the field is disabled */
  isDisabled: ComputedRef<boolean>
  /** Error message string (if any) */
  error: ComputedRef<string | undefined>
}

/** Typed injection key (ADR-08, SCREAMING_SNAKE) */
export const DZ_FORM_FIELD_KEY: InjectionKey<DzFormFieldContext>
  = Symbol('dz-form-field')

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

/** Options for the useFormField composable */
export interface UseFormFieldOptions {
  /** Error message to display */
  error?: MaybeRef<string | undefined>
  /** Whether the field is required */
  required?: MaybeRef<boolean>
  /** Whether the field is disabled */
  disabled?: MaybeRef<boolean>
  /** Whether the field is invalid */
  invalid?: MaybeRef<boolean>
  /** Custom ID prefix (uses Vue useId() by default) */
  id?: MaybeRef<string | undefined>
}

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

/**
 * Provides form field context (IDs, error state, aria attributes) via
 * provide/inject so DzFormField sub-parts (Label, Description, Message)
 * can connect their ARIA relationships automatically.
 */
export function useFormField(options: UseFormFieldOptions = {}): DzFormFieldContext {
  const generatedId = useId()
  const baseId = computed(() => toValue(options.id) ?? generatedId)
  const fieldId = computed(() => `${baseId.value}-field`)
  const labelId = computed(() => `${baseId.value}-label`)
  const descriptionId = computed(() => `${baseId.value}-description`)
  const messageId = computed(() => `${baseId.value}-message`)

  const error = computed(() => toValue(options.error))
  const isInvalid = computed(() => toValue(options.invalid) || !!error.value)
  const isRequired = computed(() => toValue(options.required) ?? false)
  const isDisabled = computed(() => toValue(options.disabled) ?? false)

  const ariaDescribedby = computed(() => {
    const parts: string[] = []
    parts.push(descriptionId.value)
    if (isInvalid.value) {
      parts.push(messageId.value)
    }
    return parts.length > 0 ? parts.join(' ') : undefined
  })

  const context: DzFormFieldContext = {
    fieldId: fieldId.value,
    labelId: labelId.value,
    descriptionId: descriptionId.value,
    messageId: messageId.value,
    ariaDescribedby,
    isInvalid,
    isRequired,
    isDisabled,
    error,
  }

  provide(DZ_FORM_FIELD_KEY, context)

  return context
}

/**
 * Inject form field context from a parent DzFormField.
 * Returns null if used outside a DzFormField.
 */
export function useFormFieldContext(): DzFormFieldContext | null {
  return inject(DZ_FORM_FIELD_KEY, null)
}
