/**
 * DzHeading — Type definitions for the heading component.
 *
 * Renders semantic heading elements (h1-h6) with independent visual sizing.
 */

/** Semantic heading level (renders <h1> through <h6>) */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

/** Visual size of the heading, independent of semantic level */
export type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'

/** Font weight */
export type HeadingWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold'

/** Text alignment */
export type HeadingAlign = 'left' | 'center' | 'right'

export interface DzHeadingProps {
  /** Semantic heading level (1-6). Determines which HTML heading element to render. */
  level?: HeadingLevel
  /** Visual size, independent of semantic level. Defaults based on level if not specified. */
  size?: HeadingSize
  /** Font weight override */
  weight?: HeadingWeight
  /** Truncate text with ellipsis when overflowing */
  truncate?: boolean
  /** Text alignment */
  align?: HeadingAlign
  /** Accessible identifier */
  id?: string
}

export interface DzHeadingSlots {
  /** Heading content */
  default: () => unknown
}
