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
 * How many tracks a grid item occupies on one axis: a count from 1 to 12, or
 * `'full'` for every track the grid has at that breakpoint.
 *
 * A span is writing-mode relative (`grid-column: span N` / `grid-row: span N`),
 * so it mirrors under `dir="rtl"` with nothing to configure.
 *
 * The same type serves both axes. The Form document constrains its own
 * `layout.colSpan` / `layout.rowSpan` to `integer, 1..12`
 * (`dzup-form-document-v1alpha1.schema.json` `$defs.nodeLayout`); `'full'` is
 * the additional value CSS has and a document does not, and it costs nothing to
 * accept.
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
 * columns and rows it occupies.
 *
 * `colSpan` and `rowSpan` are the canonical names and they are the Form
 * document's own field names (`layout.colSpan` / `layout.rowSpan`, doc 03 §3);
 * `span` is the original spelling from TASK-R3-O3 (D67) and is retained as an
 * additive alias of `colSpan`. Neither is deprecated — deprecation is an owner
 * act (`packages/contracts/VERSIONING.md` §4) and is raised as `D-S3O2-1`.
 */
export interface DzGridItemProps {
  /**
   * Columns this item occupies — the original spelling, an alias of
   * {@link DzGridItemProps.colSpan}.
   *
   * Kept because it reads better than `colSpan` on a grid with no row spans, and
   * because removing it would be a breaking change for the API D67 shipped. When
   * both are given, `colSpan` wins and dev mode warns.
   */
  span?: GridSpan | ResponsiveSpan
  /**
   * Columns this item occupies, fixed or per breakpoint. Omitted means one
   * column, the CSS default. A numeric span outside 1–12 is clamped into that
   * range; a span wider than the grid's own column count creates implicit
   * columns, exactly as the CSS it compiles to would — clamp to your grid.
   *
   * This is the name a Form document uses, so a renderer forwards
   * `node.layout.colSpan` with no lookup table of its own.
   */
  colSpan?: GridSpan | ResponsiveSpan
  /**
   * Rows this item occupies, fixed or per breakpoint. Omitted means one row.
   *
   * Clamped and mirrored on exactly the same terms as `colSpan`: `grid-row: span
   * N` is writing-mode relative on the block axis, so it needs no RTL handling
   * either. Without this prop a document carrying `layout.rowSpan` has to be
   * rendered with a raw `row-span-*` class — the persisted-CSS violation doc 03
   * §3 forbids, relocated into the component boundary rather than removed.
   *
   * A row span is meaningful whether or not the parent `DzGrid` declares `rows`:
   * with `rows` it spans explicit tracks, without it the item creates implicit
   * ones, exactly as the CSS does.
   */
  rowSpan?: GridSpan | ResponsiveSpan
  /** HTML element to render as */
  as?: string
}

/** Slot definitions for DzGridItem */
export interface DzGridItemSlots {
  /** The item's content — usually one field */
  default?: () => unknown
}
