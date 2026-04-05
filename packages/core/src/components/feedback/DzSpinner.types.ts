/**
 * DzSpinner — type definitions.
 *
 * @module @dzip-ui/core/components/feedback/DzSpinner
 */

import type {
  CanonicalSize,
  CanonicalTone,
} from '@dzip-ui/contracts'

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
