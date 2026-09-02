/**
 * DzHeading — Type definitions for the heading component.
 *
 * Renders semantic heading elements (h1-h6) with independent visual sizing.
 */

/** Semantic heading level (renders <h1> through <h6>) */
import type { DzHeadingUi } from './DzHeading.anatomy.ts'

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
  /**
   * Per-part class overrides, keyed by the names in `DzHeading.anatomy.ts`
   * (ADR-19 §5). `class` keeps its existing meaning and its existing target;
   * `ui` addresses the other parts by name, and a typo is a type error.
   *
   * @example
   * ```vue
   * <DzHeading tag="h2" :ui="{ root: 'tracking-tight' }">Title</DzHeading>
   * ```
   */
  ui?: DzHeadingUi
}

export interface DzHeadingSlots {
  /** Heading content */
  default: () => unknown
}
