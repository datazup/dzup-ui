/**
 * DzText — Type definitions for the text component.
 *
 * Renders inline or block text with semantic element control and visual styling.
 */

/** Allowed HTML elements for the text component */
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
}

export interface DzTextSlots {
  /** Text content */
  default: () => unknown
}
