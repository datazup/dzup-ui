/**
 * DzCode — Type definitions for the code display component.
 *
 * Renders inline or block code with consistent styling.
 *
 * @module @dzup-ui/core/components/typography/DzCode
 */

/** Code display variant */
import type { DzCodeUi } from './DzCode.anatomy.ts'

export type CodeVariant = 'inline' | 'block'

/** Props for the DzCode component */
export interface DzCodeProps {
  /** Display variant: inline or block */
  variant?: CodeVariant
  /** Programming language hint (for future syntax highlighting) */
  language?: string
  /** Unique element ID */
  id?: string
  /**
   * Per-part class overrides, keyed by the names in `DzCode.anatomy.ts`
   * (ADR-19 §5). `class` keeps its existing meaning and its existing target;
   * `ui` addresses the other parts by name, and a typo is a type error.
   *
   * @example
   * ```vue
   * <DzCode :ui="{ root: 'bg-[var(--dz-muted)]' }">npm i</DzCode>
   * ```
   */
  ui?: DzCodeUi
}

/** Slot definitions for DzCode */
export interface DzCodeSlots {
  /** Code content */
  default: () => unknown
}
