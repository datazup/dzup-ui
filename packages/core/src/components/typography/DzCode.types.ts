/**
 * DzCode — Type definitions for the code display component.
 *
 * Renders inline or block code with consistent styling.
 *
 * @module @dzip-ui/core/components/typography/DzCode
 */

/** Code display variant */
export type CodeVariant = 'inline' | 'block'

/** Props for the DzCode component */
export interface DzCodeProps {
  /** Display variant: inline or block */
  variant?: CodeVariant
  /** Programming language hint (for future syntax highlighting) */
  language?: string
  /** Unique element ID */
  id?: string
}

/** Slot definitions for DzCode */
export interface DzCodeSlots {
  /** Code content */
  default: () => unknown
}
