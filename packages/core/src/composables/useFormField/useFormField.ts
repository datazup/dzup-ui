/**
 * useFormField — Provides form field context to nested sub-parts.
 *
 * Generates unique IDs via Vue 3.5 `useId()` and provides them to
 * DzFormLabel, DzFormDescription, and DzFormMessage via inject (ADR-08).
 *
 * @module @dzup-ui/core/composables/useFormField
 */

import type { ComputedRef, InjectionKey, MaybeRef } from 'vue'
import {
  computed,
  inject,
  onScopeDispose,
  provide,
  ref,
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
  /**
   * Called by `DzFormDescription` when it mounts, and again on unmount.
   *
   * The field provides ids for sub-parts a consumer may or may not have
   * rendered. Without a registration the field cannot tell, and
   * `aria-describedby` ends up naming elements that do not exist.
   */
  registerDescription: () => void
  /** Called by `DzFormMessage` when it mounts, and again on unmount. */
  registerMessage: () => void
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
  /**
   * Whether a `DzFormDescription` is present, decided **before** children
   * render.
   *
   * Registration alone cannot answer this on the server. SSR renders children
   * in order and never comes back, so a control serialised before the
   * description's `setup` ran would omit the id — and the client, where
   * registration does work, would then add it. That is a hydration mismatch on
   * an accessibility attribute, which is worse than the dangling id it
   * replaced. `DzFormField` inspects its slot instead, synchronously, and gets
   * the same answer in both environments.
   */
  hasDescription?: MaybeRef<boolean>
  /** Whether a `DzFormMessage` is present. See {@link hasDescription}. */
  hasMessage?: MaybeRef<boolean>
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

  /**
   * The ids a control should announce itself described by: description first,
   * then message.
   *
   * Only ids whose element is **rendered**. `DzFormDescription` and
   * `DzFormMessage` register themselves when they mount, because the field
   * cannot see which sub-parts a consumer put inside it — and most fields have
   * no description at all.
   *
   * This used to push `descriptionId` unconditionally, so every control inside
   * a `DzFormField` without a `DzFormDescription` carried an
   * `aria-describedby` naming an element that did not exist. It fails silently:
   * assistive technology ignores a dangling id, no test asserts it, and the
   * `parts.length > 0` guard below could never be false.
   */
  const registeredDescriptions = ref(0)
  const registeredMessages = ref(0)

  /**
   * Slot inspection is the synchronous answer and registration is the
   * catch-all: a description rendered by some intermediate component of the
   * consumer's own is invisible to the inspection but still registers when it
   * mounts. Either is enough.
   */
  const describedByDescription = computed(
    () => (toValue(options.hasDescription) ?? false) || registeredDescriptions.value > 0,
  )
  const describedByMessage = computed(
    () => (toValue(options.hasMessage) ?? false) || registeredMessages.value > 0,
  )

  const ariaDescribedby = computed(() => {
    const parts: string[] = []
    if (describedByDescription.value)
      parts.push(descriptionId.value)
    if (describedByMessage.value && isInvalid.value)
      parts.push(messageId.value)
    return parts.length > 0 ? parts.join(' ') : undefined
  })

  /** Register/unregister helper shared by both sub-parts. */
  function registration(counter: { value: number }): () => void {
    return () => {
      counter.value++
      onScopeDispose(() => {
        counter.value--
      })
    }
  }

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
    registerDescription: registration(registeredDescriptions),
    registerMessage: registration(registeredMessages),
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
