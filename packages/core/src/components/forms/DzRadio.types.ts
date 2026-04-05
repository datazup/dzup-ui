/**
 * DzRadio — type definitions.
 *
 * Uses Reka UI RadioGroupItem + RadioGroupIndicator (ADR-07).
 * Must be used within a DzRadioGroup.
 *
 * @module @dzip-ui/core/components/forms/DzRadio
 */

import type { BaseAccessibilityProps, CanonicalSize } from '@dzip-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzRadio component */
export interface DzRadioProps extends BaseAccessibilityProps {
  /** The value of this radio option (required) */
  value: string
  /** Disabled state -- prevents interaction */
  disabled?: boolean
  /** Component size */
  size?: CanonicalSize
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzRadio */
export interface DzRadioSlots {
  /** Label text for the radio option */
  default?: () => unknown
}
