/**
 * Data attribute types for component state exposure.
 *
 * Components set these on their root element so consumers (and CSS)
 * can query component state via attribute selectors.
 *
 * @module @dzip-ui/contracts/data-attributes
 */

import type { CanonicalTone } from './canonical.types.ts'

// ---------------------------------------------------------------------------
// State values
// ---------------------------------------------------------------------------

/** Canonical data-state values used across component families */
export type DataState
  = | 'open'
    | 'closed'
    | 'active'
    | 'inactive'
    | 'checked'
    | 'unchecked'
    | 'indeterminate'
    | 'selected'

// ---------------------------------------------------------------------------
// Data attribute map
// ---------------------------------------------------------------------------

/**
 * Standard data attributes set on component root elements.
 *
 * When a boolean data attribute is "off", the attribute is absent
 * (undefined), not set to `"false"`.
 */
export interface DataAttributes {
  /** Component-specific state */
  'data-state'?: DataState
  /** Current tone value */
  'data-tone'?: CanonicalTone
  /** Present when loading (empty string = attribute exists) */
  'data-loading'?: '' | undefined
  /** Present when disabled (empty string = attribute exists) */
  'data-disabled'?: '' | undefined
}
