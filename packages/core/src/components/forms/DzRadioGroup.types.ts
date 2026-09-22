/**
 * DzRadioGroup — type definitions.
 *
 * Uses Reka UI RadioGroupRoot (ADR-07).
 * v-model via defineModel<string>() (ADR-16).
 *
 * @module @dzup-ui/core/components/forms/DzRadioGroup
 */

import type {
  BaseAccessibilityProps,
  BaseEvents,
  CanonicalSize,
  Orientation,
} from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzRadioGroup component */
export interface DzRadioGroupProps extends BaseAccessibilityProps {
  // Declared locally since TASK-R0-O2 (2026-09-22): `ariaInvalid` left
  // BaseAccessibilityProps for BaseValidationProps (N5-02 D1). This control
  // resolves invalidity from the enclosing DzFormField, so it keeps the one
  // prop rather than inheriting `invalid`/`error` it never reads.
  /** Indicates the component has invalid input */
  ariaInvalid?: boolean | 'grammar' | 'spelling'
  /** Layout orientation */
  orientation?: Orientation
  /** Disabled state propagated to all child radios */
  disabled?: boolean
  /** Size propagated to all child radios */
  size?: CanonicalSize
  /** Form field name */
  name?: string
  /** Whether a selection is required */
  required?: boolean
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzRadioGroup */
export interface DzRadioGroupEmits extends BaseEvents {
  /** Value changed after user interaction */
  change: [value: string]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzRadioGroup */
export interface DzRadioGroupSlots {
  /** Child DzRadio components */
  default: () => unknown
}
