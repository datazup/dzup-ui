/**
 * DzRating — type definitions.
 *
 * A star/icon rating input that behaves like a real form control so it
 * composes with DzFormField and participates in validation.
 *
 * Implemented as a single `role="slider"` widget (ADR-07 has no Reka primitive
 * for ratings). v-model:value via defineModel (ADR-16).
 *
 * @module @dzup-ui/core/components/forms/DzRating
 */

import type { BaseFormControlProps, ChangeEvents } from '@dzup-ui/contracts'
import type { Component } from 'vue'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzRating component */
export interface DzRatingProps extends BaseFormControlProps<never> {
  /** Number of rating items (default 5) */
  count?: number
  /** Allow half-step (0.5) selection */
  allowHalf?: boolean
  /** Click the currently selected value to reset it to 0 */
  allowClear?: boolean
  /** Icon component used for the filled state (defaults to a star glyph) */
  icon?: Component
  /** Icon component used for the empty state (defaults to the filled icon) */
  emptyIcon?: Component
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzRating */
export interface DzRatingEmits extends ChangeEvents<number> {}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzRating */
export interface DzRatingSlots {
  /** Custom filled icon. Receives the 1-based item index. */
  icon?: (props: { index: number }) => unknown
  /** Custom empty icon. Receives the 1-based item index. */
  emptyIcon?: (props: { index: number }) => unknown
}
