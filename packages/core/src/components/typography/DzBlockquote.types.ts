/**
 * DzBlockquote — Type definitions for the styled blockquote component.
 *
 * @module @dzup-ui/core/components/typography/DzBlockquote
 */

/** Props for the DzBlockquote component */
import type { DzBlockquoteUi } from './DzBlockquote.anatomy.ts'

export interface DzBlockquoteProps {
  /** Attribution source or author */
  cite?: string
  /** Unique element ID */
  id?: string
  /**
   * Per-part class overrides, keyed by the names in `DzBlockquote.anatomy.ts`
   * (ADR-19 §5). `class` keeps its existing meaning and its existing target;
   * `ui` addresses the other parts by name, and a typo is a type error.
   *
   * @example
   * ```vue
   * <DzBlockquote :ui="{ footer: 'text-[var(--dz-primary)]' }">Quote</DzBlockquote>
   * ```
   */
  ui?: DzBlockquoteUi
}

/** Slot definitions for DzBlockquote */
export interface DzBlockquoteSlots {
  /** Quote content */
  default: () => unknown
  /** Attribution footer */
  footer?: () => unknown
}
