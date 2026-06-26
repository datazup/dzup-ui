/**
 * DzKnob — type definitions.
 *
 * A rotary numeric input rendered as an SVG circular dial. Behaves like a real
 * form control (single `role="slider"` widget) so it composes with DzFormField
 * and participates in validation. No Reka primitive exists for a knob (ADR-07),
 * so it is implemented directly.
 *
 * v-model:value via defineModel (ADR-16).
 *
 * @module @dzup-ui/core/components/forms/DzKnob
 */

import type { BaseFormControlProps, ChangeEvents } from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzKnob component */
export interface DzKnobProps extends BaseFormControlProps<never> {
  /** Minimum value (default 0) */
  min?: number
  /** Maximum value (default 100) */
  max?: number
  /** Step increment for keyboard/drag snapping (default 1) */
  step?: number
  /**
   * Template for the centered value label and `aria-valuetext`.
   * `{value}` is replaced with the current value. e.g. `'{value}%'`.
   */
  valueTemplate?: string
  /** Arc stroke width, in the 0–100 SVG viewBox units (default 8) */
  strokeWidth?: number
  /** Whether to render the value label in the center of the dial */
  showValue?: boolean
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzKnob */
export interface DzKnobEmits extends ChangeEvents<number> {}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzKnob */
export interface DzKnobSlots {
  /** Custom center content. Receives the numeric value and formatted text. */
  value?: (props: { value: number, text: string }) => unknown
}
