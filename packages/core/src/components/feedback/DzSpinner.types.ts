/**
 * DzSpinner — type definitions.
 *
 * @module @dzup-ui/core/components/feedback/DzSpinner
 */

import type {
  CanonicalSize,
  CanonicalTone,
} from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzSpinner component */
export interface DzSpinnerProps {
  /** Component size */
  size?: CanonicalSize
  /** Semantic color tone */
  tone?: CanonicalTone
  /** Screen reader label */
  label?: string
}
