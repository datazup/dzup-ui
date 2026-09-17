/**
 * DzCheckbox — type definitions.
 *
 * Uses Reka UI CheckboxRoot + CheckboxIndicator (ADR-07).
 * v-model via defineModel<boolean>() (ADR-16).
 *
 * @module @dzup-ui/core/components/forms/DzCheckbox
 */

import type {
  BaseAccessibilityProps,
  BaseEvents,
  CanonicalSize,
} from '@dzup-ui/contracts'
import type { DzCheckboxUi } from './DzCheckbox.anatomy.ts'

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
  /**
   * Per-part class overrides, keyed by the names in `DzCheckbox.anatomy.ts`
   * (ADR-19 §5). `class` keeps its existing meaning and its existing target;
   * a key outside the declared parts is a type error, not a class that lands
   * nowhere.
   */
  ui?: DzCheckboxUi
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
