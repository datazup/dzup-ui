/**
 * DzBlockquote — Type definitions for the styled blockquote component.
 *
 * @module @dzip-ui/core/components/typography/DzBlockquote
 */

/** Props for the DzBlockquote component */
export interface DzBlockquoteProps {
  /** Attribution source or author */
  cite?: string
  /** Unique element ID */
  id?: string
}

/** Slot definitions for DzBlockquote */
export interface DzBlockquoteSlots {
  /** Quote content */
  default: () => unknown
  /** Attribution footer */
  footer?: () => unknown
}
