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

/**
 * Props for the DzStack component.
 *
 * `ariaInvalid` is omitted from {@link BaseAccessibilityProps}: a layout box is
 * not invalid — the fields inside it are. The prop was declared and never
 * forwarded. Its removal is a breaking type change and ships in the minor
 * position (`packages/contracts/VERSIONING.md` §3).
 */
export interface DzStackProps extends Omit<BaseAccessibilityProps, 'ariaInvalid'> {
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
