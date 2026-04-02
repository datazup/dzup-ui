/**
 * DzGrid -- type definitions.
 *
 * CSS Grid layout component with responsive column support.
 *
 * @module @dzup-ui/core/components/layout/DzGrid
 */

import type { BaseAccessibilityProps } from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Allowed column counts */
export type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 12

/** Gap size options */
export type LayoutGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/** Responsive column configuration */
export interface ResponsiveCols {
  /** Columns at small breakpoint (640px+) */
  sm?: GridCols
  /** Columns at medium breakpoint (768px+) */
  md?: GridCols
  /** Columns at large breakpoint (1024px+) */
  lg?: GridCols
}

/** Props for the DzGrid component */
export interface DzGridProps extends BaseAccessibilityProps {
  /** Number of columns (or responsive object) */
  cols?: GridCols | ResponsiveCols
  /** Gap between grid items */
  gap?: LayoutGap
  /** Number of rows (explicit grid rows) */
  rows?: number
  /** HTML element to render as */
  as?: string
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzGrid */
export interface DzGridSlots {
  /** Grid items */
  default?: () => unknown
}
