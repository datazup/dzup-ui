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
 *   above* the control on focus/fill (default).
 * - `in`   — label rests over the control and floats to the *top inside* it.
 * - `on`   — label rests over the control and floats *onto its top border*
 *   (notched-outline style, masked with a background).
 */
export type DzFloatLabelVariant = 'over' | 'in' | 'on'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * Props for the DzFloatLabel component.
 *
 * Only `id` survives from {@link BaseAccessibilityProps}; the four ARIA props
 * are omitted. A float-label wrapper renders a generic `<div>` and a `<label>`:
 * it is not a labelable element, it computes no accessible name of its own, and
 * a generic element ignores `aria-describedby` and `aria-invalid` entirely. The
 * control it wraps owns all four, resolves them against `DzFormField` itself,
 * and merges its own error id into `aria-describedby` — writing any of them onto
 * the control from out here would clobber that merge.
 *
 * All four were declared and never forwarded. Their removal is a breaking type
 * change and ships in the minor position (`packages/contracts/VERSIONING.md` §3).
 */
export interface DzFloatLabelProps extends Omit<
  BaseAccessibilityProps,
  'ariaLabel' | 'ariaLabelledby' | 'ariaDescribedby' | 'ariaInvalid'
> {
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
