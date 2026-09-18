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

/**
 * Stack direction options.
 *
 * `row` and `column` are additive aliases (TASK-R3-O3) for `horizontal` and
 * `vertical`: a form renderer's layout node and CSS both call the axis
 * `row`/`column`, and before the aliases `direction="row"` silently fell back to
 * vertical. Both spellings are supported; neither is deprecated. Every value is
 * writing-mode relative — `row` follows `dir`, so it never needs a physical
 * `-reverse` under RTL.
 */
export type StackDirection = 'vertical' | 'horizontal' | 'row' | 'column'

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
  /**
   * Stack direction. `vertical` (default) and `column` stack along the block
   * axis; `horizontal` and `row` lay out along the inline axis, which follows
   * `dir`.
   */
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
