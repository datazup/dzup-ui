/**
 * DzFormField — type definitions.
 *
 * Compound wrapper that provides form field context (IDs, validation state)
 * to child sub-parts via provide/inject (ADR-08).
 *
 * @module @dzip-ui/core/components/forms/DzFormField
 */

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzFormField compound wrapper */
export interface DzFormFieldProps {
  /** Whether the field is disabled */
  disabled?: boolean
  /** Whether the field is required */
  required?: boolean
  /** Whether the field value is invalid */
  invalid?: boolean
  /** Error message to display in DzFormMessage */
  error?: string
  /** Custom ID prefix for the field and sub-parts */
  id?: string
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzFormField */
export interface DzFormFieldSlots {
  /** Child content (label, control, description, message) */
  default: () => unknown
}
