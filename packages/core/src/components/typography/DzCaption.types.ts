/**
 * DzCaption — Type definitions for the small caption text component.
 *
 * @module @dzup-ui/core/components/typography/DzCaption
 */

/** Semantic tone for caption */
import type { DzCaptionUi } from './DzCaption.anatomy.ts'

export type CaptionTone = 'default' | 'muted' | 'success' | 'warning' | 'danger'

/** Props for the DzCaption component */
export interface DzCaptionProps {
  /** Semantic color tone */
  tone?: CaptionTone
  /** Unique element ID */
  id?: string
  /**
   * Per-part class overrides, keyed by the names in `DzCaption.anatomy.ts`
   * (ADR-19 §5). `class` keeps its existing meaning and its existing target;
   * `ui` addresses the other parts by name, and a typo is a type error.
   *
   * @example
   * ```vue
   * <DzCaption :ui="{ root: 'italic' }">Fig. 1</DzCaption>
   * ```
   */
  ui?: DzCaptionUi
}

/** Slot definitions for DzCaption */
export interface DzCaptionSlots {
  /** Caption text content */
  default: () => unknown
}
