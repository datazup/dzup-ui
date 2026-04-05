/**
 * DzRadioGroup — type definitions.
 *
 * Uses Reka UI RadioGroupRoot (ADR-07).
 * v-model via defineModel<string>() (ADR-16).
 *
 * @module @dzip-ui/core/components/forms/DzRadioGroup
 */

import type { BaseAccessibilityProps, BaseEvents, CanonicalSize } from '@dzip-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzRadioGroup component */
export interface DzRadioGroupProps extends BaseAccessibilityProps {
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical'
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
