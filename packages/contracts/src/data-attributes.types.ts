/**
 * Data attribute types for component state exposure.
 *
 * Components set these on their root element so consumers (and CSS)
 * can query component state via attribute selectors.
 *
 * @module @dzup-ui/contracts/data-attributes
 */

import type { CanonicalTone } from './canonical.types.js'

// ---------------------------------------------------------------------------
// State values
// ---------------------------------------------------------------------------

/**
 * The **named vocabulary** of common `data-state` values — not a closed list of
 * what a component may emit.
 *
 * ADR-19 §4 (widened by TASK-R5-O1, 2026-09-04): `data-state` is a per-component
 * enum declared in that component's `.anatomy.ts`, and the anatomy carries the
 * real constraint. This union stays as the set of words that recur across
 * families, so a component whose lifecycle genuinely is open/closed picks the
 * same word every other one does instead of inventing `expanded`.
 *
 * It is deliberately NOT the type of {@link DataAttributes}`['data-state']` any
 * more. It was, and `DzButton` has emitted `idle | loading | disabled` — none of
 * the three in this list — since it shipped. A union a shipped component already
 * violates is not a contract; keeping it as the attribute's type would only have
 * meant the next component quietly violated it too.
 *
 * The gate that replaced it is `yarn validate:anatomy-parts`, which reads every
 * literal a component's template puts in `data-state` and fails when the
 * component's own anatomy does not declare it.
 */
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
  /**
   * The component's lifecycle value — exactly one at a time.
   *
   * Typed `string`, not {@link DataState}, per ADR-19 §4: the per-component enum
   * in the component's `.anatomy.ts` is what constrains it, and
   * `validate:anatomy-parts` is what checks it. {@link DataState} remains the
   * shared vocabulary to draw from where it fits.
   */
  'data-state'?: string
  /** Current tone value */
  'data-tone'?: CanonicalTone
  /** Present when loading (empty string = attribute exists) */
  'data-loading'?: '' | undefined
  /** Present when disabled (empty string = attribute exists) */
  'data-disabled'?: '' | undefined
}
