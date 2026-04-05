/**
 * DzProgress — type definitions.
 *
 * @module @dzip-ui/core/components/feedback/DzProgress
 */

import type {
  BaseAccessibilityProps,
  CanonicalSize,
  CanonicalTone,
  ProgressVariant,
} from '@dzip-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzProgress component */
export interface DzProgressProps extends BaseAccessibilityProps {
  /** Current progress value (0 to max) */
  value?: number
  /** Maximum progress value */
  max?: number
  /** Visual display variant */
  variant?: ProgressVariant
  /** Component size */
  size?: CanonicalSize
  /** Semantic color tone */
  tone?: CanonicalTone
  /** Whether progress is indeterminate (unknown completion) */
  indeterminate?: boolean
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzProgress */
export interface DzProgressSlots {
  /** Optional label content displayed inside or near the progress indicator */
  default?: (props: { value: number, max: number, percentage: number }) => unknown
}
