/**
 * DzCollapse — Type definitions for the animated expand/collapse component.
 *
 * @module @dzip-ui/core/components/layout/DzCollapse
 */

import type { BaseAccessibilityProps } from '@dzip-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzCollapse component */
export interface DzCollapseProps extends BaseAccessibilityProps {
  /** Animation duration in milliseconds */
  duration?: number
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzCollapse */
export interface DzCollapseSlots {
  /** Collapsible content */
  default: () => unknown
}
