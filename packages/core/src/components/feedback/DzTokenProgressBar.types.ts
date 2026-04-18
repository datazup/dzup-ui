/**
 * DzTokenProgressBar — type definitions.
 *
 * Token-usage progress indicator with threshold-based warning colors.
 *
 * @module @dzup-ui/core/components/feedback/DzTokenProgressBar
 */

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzTokenProgressBar component */
export interface DzTokenProgressBarProps {
  /** Tokens consumed so far */
  used: number
  /** Token budget (denominator); must be > 0 */
  total: number
  /** Apply threshold colors at 70% (amber) and 90% (red). Default: true */
  showWarning?: boolean
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot context passed to the label slot */
export interface DzTokenProgressBarSlotProps {
  /** Clamped 0–100 percent */
  percent: number
  /** Tokens used (pass-through) */
  used: number
  /** Total budget (pass-through) */
  total: number
  /** Threshold state (none | warn at 70% | danger at 90%) */
  state: 'normal' | 'warn' | 'danger'
}

/** Slot definitions for DzTokenProgressBar */
export interface DzTokenProgressBarSlots {
  /** Optional label text rendered next to the bar */
  default?: (props: DzTokenProgressBarSlotProps) => unknown
}
