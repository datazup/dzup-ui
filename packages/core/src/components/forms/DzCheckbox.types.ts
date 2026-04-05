/**
 * DzCheckbox — type definitions.
 *
 * Uses Reka UI CheckboxRoot + CheckboxIndicator (ADR-07).
 * v-model via defineModel<boolean>() (ADR-16).
 *
 * @module @dzip-ui/core/components/forms/DzCheckbox
 */

import type {
  BaseAccessibilityProps,
  BaseEvents,
  CanonicalSize,
} from '@dzip-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzCheckbox component */
export interface DzCheckboxProps extends BaseAccessibilityProps {
  /** String value for checkbox groups */
  value?: string
  /** Disabled state -- prevents interaction */
  disabled?: boolean
  /** Component size */
  size?: CanonicalSize
  /** Indeterminate (mixed) state */
  indeterminate?: boolean
  /** Form field name */
  name?: string
  /** Whether the checkbox is required */
  required?: boolean
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzCheckbox */
export interface DzCheckboxEmits extends BaseEvents {
  /** Value changed after user interaction */
  change: [checked: boolean]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzCheckbox */
export interface DzCheckboxSlots {
  /** Label text for the checkbox */
  default?: () => unknown
}
