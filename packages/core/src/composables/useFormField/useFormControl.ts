/**
 * useFormControl — the control side of the DzFormField wiring.
 *
 * `useFormField` is the provider half: a `DzFormField` creates the ids and the
 * state its sub-parts share. Every field control (DzInput, DzSelect,
 * DzCheckbox, …) then resolves its own id, disabled / invalid / required state,
 * error-message id and `aria-describedby` from its props and that context. Those
 * computeds used to be copied into each SFC, and the copies drifted
 * (UI-DZUP-UI-CODE-M-08). This is the one definition.
 *
 * @module @dzup-ui/core/composables/useFormField
 */

import type { ComputedRef } from 'vue'
import type { DzFormFieldContext } from './useFormField.ts'
import { computed, useId } from 'vue'
import { useFormFieldContext } from './useFormField.ts'

/**
 * The props a field control may declare that feed the resolution. All are
 * optional: a control that does not declare one (DzRadio has no `error`, for
 * example) reads it as absent.
 */
export interface FormControlProps {
  /** Explicit element id; wins over the field's id and the generated one */
  id?: string
  /** Disables the control */
  disabled?: boolean
  /** Marks the control invalid */
  invalid?: boolean
  /** Error message; any non-empty value marks the control invalid */
  error?: string
  /** Marks the control required */
  required?: boolean
  /** Consumer-supplied `aria-describedby` ids */
  ariaDescribedby?: string
}

/** Options for {@link useFormControl} */
export interface UseFormControlOptions {
  /** A further disabled source, such as an enclosing input or checkbox group */
  disabled?: () => boolean
  /**
   * Ids announced after the control's own `ariaDescribedby` and before its
   * error id, such as a live status region the control renders. Receives the
   * resolved element id, from which such ids are usually derived.
   */
  describedby?: (id: string) => string | undefined
}

/** What {@link useFormControl} resolves */
export interface UseFormControlReturn {
  /** The enclosing DzFormField's context, or `null` outside one */
  fieldContext: DzFormFieldContext | null
  /** Element id — prop, then the field's id, then a generated one */
  resolvedId: ComputedRef<string>
  /** Prop, the extra `disabled` source, or the field */
  resolvedDisabled: ComputedRef<boolean>
  /** `invalid`, a non-empty `error`, or the field */
  resolvedInvalid: ComputedRef<boolean>
  /** Prop or the field; rendered as `required` / `aria-required` */
  resolvedRequired: ComputedRef<boolean>
  /** Id of the control's own error element, present only while `error` is set */
  errorId: ComputedRef<string | undefined>
  /**
   * The prop's ids, the extra `describedby` ids, the error id, then the
   * field's ids — merged, each id once, `undefined` when there are none.
   */
  resolvedAriaDescribedby: ComputedRef<string | undefined>
}

/**
 * Resolves a field control's id, state and `aria-describedby` from its props
 * and the enclosing `DzFormField`. Call it once in `setup`, passing the
 * component's reactive `props`.
 */
export function useFormControl(
  props: FormControlProps,
  options: UseFormControlOptions = {},
): UseFormControlReturn {
  const fieldContext = useFormFieldContext()
  const autoId = useId()

  const resolvedId = computed(() => props.id ?? fieldContext?.fieldId ?? autoId)

  const resolvedDisabled = computed(
    () =>
      props.disabled
      || (options.disabled?.() ?? false)
      || (fieldContext?.isDisabled.value ?? false),
  )

  const resolvedInvalid = computed(
    () => props.invalid || !!props.error || (fieldContext?.isInvalid.value ?? false),
  )

  /**
   * `required` was once declared, defaulted, and read nowhere — the type
   * promised a consumer it worked and the DOM never mentioned it (renderer
   * contract C3).
   */
  const resolvedRequired = computed(
    () => props.required || (fieldContext?.isRequired.value ?? false),
  )

  const errorId = computed(() => (props.error ? `${resolvedId.value}-error` : undefined))

  /**
   * Merged rather than overridden: a consumer's `ariaDescribedby` must not drop
   * the field's description and message ids, and an id named by both is
   * announced once.
   */
  const resolvedAriaDescribedby = computed(() => {
    const ids = new Set(
      [props.ariaDescribedby, options.describedby?.(resolvedId.value), errorId.value, fieldContext?.ariaDescribedby.value]
        .join(' ')
        .split(/\s+/)
        .filter(Boolean),
    )
    return ids.size > 0 ? [...ids].join(' ') : undefined
  })

  return {
    fieldContext,
    resolvedId,
    resolvedDisabled,
    resolvedInvalid,
    resolvedRequired,
    errorId,
    resolvedAriaDescribedby,
  }
}
