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

/**
 * Props for the DzGrid component.
 *
 * `ariaInvalid` is omitted from {@link BaseAccessibilityProps}: a layout box is
 * not invalid — the fields inside it are. The prop was declared and never
 * forwarded, so the declaration was a promise the component could not keep.
 * Its removal is a breaking type change and ships in the minor position
 * (`packages/contracts/VERSIONING.md` §3).
 */
export interface DzGridProps extends Omit<BaseAccessibilityProps, 'ariaInvalid'> {
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

// ---------------------------------------------------------------------------
// DzGridItem (TASK-R3-O3, decision D67)
// ---------------------------------------------------------------------------

/**
 * How many columns a grid item occupies: a count from 1 to 12, or `'full'` for
 * every column the grid has at that breakpoint.
 *
 * A span is writing-mode relative (`grid-column: span N`), so it mirrors under
 * `dir="rtl"` with nothing to configure.
 */
export type GridSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full'

/**
 * A span per breakpoint, mirroring {@link ResponsiveCols}.
 *
 * `base` applies below `sm` and upward until a larger breakpoint overrides it.
 * An omitted breakpoint inherits the one below it, as CSS does.
 */
export interface ResponsiveSpan {
  /** Span at every width, until a breakpoint below overrides it */
  base?: GridSpan
  /** Span at small breakpoint (640px+) */
  sm?: GridSpan
  /** Span at medium breakpoint (768px+) */
  md?: GridSpan
  /** Span at large breakpoint (1024px+) */
  lg?: GridSpan
}

/**
 * Props for the DzGridItem component — a child of `DzGrid` that says how many
 * columns it occupies.
 */
export interface DzGridItemProps {
  /**
   * Columns this item occupies, fixed or per breakpoint. Omitted means one
   * column, the CSS default. A numeric span outside 1–12 is clamped into that
   * range; a span wider than the grid's own column count creates implicit
   * columns, exactly as the CSS it compiles to would — clamp to your grid.
   */
  span?: GridSpan | ResponsiveSpan
  /** HTML element to render as */
  as?: string
}

/** Slot definitions for DzGridItem */
export interface DzGridItemSlots {
  /** The item's content — usually one field */
  default?: () => unknown
}
