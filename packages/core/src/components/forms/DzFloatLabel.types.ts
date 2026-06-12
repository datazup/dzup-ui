/**
 * DzFloatLabel — type definitions.
 *
 * A wrapper that floats a label above a slotted dzup form control when the
 * control is focused or filled. The label animates from a placeholder-like
 * resting position to a floated caption, and is associated with the control's
 * `id` for accessibility (never a purely visual label).
 *
 * @module @dzup-ui/core/components/forms/DzFloatLabel
 */

import type { BaseAccessibilityProps } from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Unions
// ---------------------------------------------------------------------------

/**
 * Label rest/float positioning style.
 * - `over` — label rests over the control (placeholder position) and floats
 *   *above* the control on focus/fill (default).
 * - `in`   — label rests over the control and floats to the *top inside* it.
 * - `on`   — label rests over the control and floats *onto its top border*
 *   (notched-outline style, masked with a background).
 */
export type DzFloatLabelVariant = 'over' | 'in' | 'on'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzFloatLabel component */
export interface DzFloatLabelProps extends BaseAccessibilityProps {
  /** The label text rendered over / above the control */
  label?: string
  /** Label rest/float positioning style (default `over`) */
  variant?: DzFloatLabelVariant
  /**
   * Explicit filled state. When provided, it overrides automatic detection —
   * useful for non-native controls (e.g. a combobox button) whose value cannot
   * be read from a native `input`/`select`/`textarea` element.
   */
  filled?: boolean
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzFloatLabel */
export interface DzFloatLabelSlots {
  /** The wrapped dzup form control (DzInput, DzSelect, DzTextarea, ...) */
  default?: () => unknown
  /** Custom label content (overrides the `label` prop) */
  label?: () => unknown
}
