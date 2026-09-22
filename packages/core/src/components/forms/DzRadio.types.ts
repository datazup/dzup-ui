/**
 * DzRadio — type definitions.
 *
 * Uses Reka UI RadioGroupItem + RadioGroupIndicator (ADR-07).
 * Must be used within a DzRadioGroup.
 *
 * @module @dzup-ui/core/components/forms/DzRadio
 */

import type { BaseAccessibilityProps, CanonicalSize } from '@dzup-ui/contracts'
import type { DzRadioUi } from './DzRadio.anatomy.ts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzRadio component */
export interface DzRadioProps extends BaseAccessibilityProps {
  // Declared locally since TASK-R0-O2 (2026-09-22): `ariaInvalid` left
  // BaseAccessibilityProps for BaseValidationProps (N5-02 D1). This control
  // resolves invalidity from the enclosing DzFormField, so it keeps the one
  // prop rather than inheriting `invalid`/`error`/`required` it never reads.
  /** Indicates the component has invalid input */
  ariaInvalid?: boolean | 'grammar' | 'spelling'
  /** The value of this radio option (required) */
  value: string
  /** Disabled state -- prevents interaction */
  disabled?: boolean
  /** Component size */
  size?: CanonicalSize
  /**
   * Per-part class overrides, keyed by the names in `DzRadio.anatomy.ts`
   * (ADR-19 §5). `class` keeps its existing meaning and its existing target.
   */
  ui?: DzRadioUi
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzRadio */
export interface DzRadioSlots {
  /** Label text for the radio option */
  default?: () => unknown
}
