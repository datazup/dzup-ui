/**
 * DzMasonry -- type definitions.
 *
 * Responsive masonry / cascading-column layout that packs variable-height
 * items into balanced columns.
 *
 * @module @dzup-ui/core/components/layout/DzMasonry
 */

import type { BaseAccessibilityProps, CanonicalSize } from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Allowed column counts for the masonry layout. */
export type MasonryColumns = 1 | 2 | 3 | 4 | 5 | 6

/** Gap size options (mirrors the shared layout gap scale). */
export type MasonryGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * Responsive column configuration, keyed by {@link CanonicalSize} breakpoints.
 *
 * `xs` is the mobile-first base; each larger breakpoint overrides it from its
 * min-width upward (`sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px).
 */
export type ResponsiveColumns = Partial<Record<Exclude<CanonicalSize, 'icon'>, MasonryColumns>>

/** Props for the DzMasonry component. */
export interface DzMasonryProps extends BaseAccessibilityProps {
  /** Number of columns, or a responsive object keyed by breakpoint. */
  columns?: MasonryColumns | ResponsiveColumns
  /** Gap between items (both column-gap and vertical item spacing). */
  gap?: MasonryGap
  /**
   * Place items left-to-right in source order via the native CSS multi-column
   * fast path. When `false`, items are measured and packed into the shortest
   * column for exact height balancing (measured-JS path). Defaults to `true`.
   */
  sequential?: boolean
  /**
   * Accessibility guarantee: keep DOM order identical to source order by always
   * rendering through the CSS multi-column path, even when `sequential` is
   * `false`. The balanced JS path groups children into per-column wrappers, so
   * DOM order no longer matches visual order -- enable `ordered` when reading /
   * tab order must follow source order exactly. Defaults to `false`.
   */
  ordered?: boolean
  /** HTML element to render as. */
  as?: string
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzMasonry. */
export interface DzMasonrySlots {
  /** Masonry items; distributed across columns by the component. */
  default?: () => unknown
}
