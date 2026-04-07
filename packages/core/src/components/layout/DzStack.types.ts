/**
 * DzStack -- type definitions.
 *
 * Simplified vertical/horizontal stack layout.
 * Convenience wrapper over flexbox.
 *
 * @module @dzup-ui/core/components/layout/DzStack
 */

import type { BaseAccessibilityProps } from '@dzup-ui/contracts'
import type { LayoutGap } from './DzGrid.types.ts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Stack direction options */
export type StackDirection = 'vertical' | 'horizontal'

/** Stack alignment options */
export type StackAlign = 'start' | 'center' | 'end' | 'stretch'

/** Props for the DzStack component */
export interface DzStackProps extends BaseAccessibilityProps {
  /** Stack direction */
  direction?: StackDirection
  /** Gap between stack items */
  gap?: LayoutGap
  /** Align items along the cross axis */
  align?: StackAlign
  /** HTML element to render as */
  as?: string
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzStack */
export interface DzStackSlots {
  /** Stack items */
  default?: () => unknown
}
