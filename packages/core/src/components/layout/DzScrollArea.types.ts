/**
 * DzScrollArea — Type definitions for the custom scrollbar area.
 *
 * Uses Reka UI ScrollArea primitives (ADR-07).
 *
 * @module @dzip-ui/core/components/layout/DzScrollArea
 */

import type { BaseAccessibilityProps } from '@dzip-ui/contracts'

/** Scrollbar orientation */
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
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzScrollArea */
export interface DzScrollAreaSlots {
  /** Scrollable content */
  default: () => unknown
}
