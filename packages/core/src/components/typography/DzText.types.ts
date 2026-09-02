/**
 * DzText — Type definitions for the text component.
 *
 * Renders inline or block text with semantic element control and visual styling.
 */

/** Allowed HTML elements for the text component */
import type { DzTextUi } from './DzText.anatomy.ts'

export type TextElement = 'p' | 'span' | 'div' | 'label' | 'small' | 'strong' | 'em'

/** Text size */
export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/** Font weight */
export type TextWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold'

/** Semantic color tone for text */
export type TextTone = 'default' | 'muted' | 'success' | 'warning' | 'danger'

/** Text alignment */
export type TextAlign = 'left' | 'center' | 'right'

export interface DzTextProps {
  /** HTML element to render. Defaults to 'p'. */
  as?: TextElement
  /** Text size */
  size?: TextSize
  /** Font weight override */
  weight?: TextWeight
  /** Semantic color tone */
  tone?: TextTone
  /** Truncate text with ellipsis when overflowing */
  truncate?: boolean
  /** Text alignment */
  align?: TextAlign
  /** Accessible identifier */
  id?: string
  /**
   * Per-part class overrides, keyed by the names in `DzText.anatomy.ts`
   * (ADR-19 §5). `class` keeps its existing meaning and its existing target;
   * `ui` addresses the other parts by name, and a typo is a type error.
   *
   * @example
   * ```vue
   * <DzText :ui="{ root: 'max-w-prose' }">Body</DzText>
   * ```
   */
  ui?: DzTextUi
}

export interface DzTextSlots {
  /** Text content */
  default: () => unknown
}
