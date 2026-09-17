/**
 * DzScrollArea — Type definitions for the custom scrollbar area.
 *
 * Uses Reka UI ScrollArea primitives (ADR-07).
 *
 * @module @dzup-ui/core/components/layout/DzScrollArea
 */

import type { BaseAccessibilityProps } from '@dzup-ui/contracts'
import type { DzScrollAreaUi } from './DzScrollArea.anatomy.ts'

/** Scrollbar orientation — includes 'both', so cannot alias to the Orientation type from contracts */
export type ScrollOrientation = 'vertical' | 'horizontal' | 'both'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzScrollArea component */
export interface DzScrollAreaProps extends BaseAccessibilityProps {
  /** Which scrollbar(s) to display */
  orientation?: ScrollOrientation
  /** Type of scrollbar: auto shows only when content overflows */
  type?: 'auto' | 'always' | 'scroll' | 'hover'
  /**
   * Per-part class overrides, keyed by the names in `DzScrollArea.anatomy.ts`
   * (ADR-19 §5). `class` keeps its existing target (the scroll root); `ui`
   * reaches the viewport. The scrollbar, thumb and corner have no ADR-19
   * vocabulary word yet and are not addressable — see the anatomy file.
   */
  ui?: DzScrollAreaUi
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzScrollArea */
export interface DzScrollAreaSlots {
  /** Scrollable content */
  default: () => unknown
}
