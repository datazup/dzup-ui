/**
 * DzFlex -- type definitions.
 *
 * Flexbox layout component with full alignment and direction control.
 *
 * @module @dzip-ui/core/components/layout/DzFlex
 */

import type { BaseAccessibilityProps } from '@dzip-ui/contracts'
import type { LayoutGap } from './DzGrid.types.ts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Flex direction options */
export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse'

/** Flex alignment options */
export type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'

/** Flex justify options */
export type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'

/** Props for the DzFlex component */
export interface DzFlexProps extends BaseAccessibilityProps {
  /** Flex direction */
  direction?: FlexDirection
  /** Align items along the cross axis */
  align?: FlexAlign
  /** Justify content along the main axis */
  justify?: FlexJustify
  /** Gap between flex items */
  gap?: LayoutGap
  /** Whether to wrap items */
  wrap?: boolean
  /** Whether to use inline-flex instead of flex */
  inline?: boolean
  /** HTML element to render as */
  as?: string
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzFlex */
export interface DzFlexSlots {
  /** Flex items */
  default?: () => unknown
}
