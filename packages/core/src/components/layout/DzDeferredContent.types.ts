/**
 * DzDeferredContent -- type definitions.
 *
 * A viewport-triggered lazy renderer. The default slot holds heavy content that
 * is only mounted once the wrapper scrolls into view; a `placeholder` slot
 * (defaulting to a DzSkeleton) reserves space until then. It complements
 * DzInfiniteScroll (which loads more) by lazily mounting what is already listed.
 *
 * @module @dzup-ui/core/components/layout/DzDeferredContent
 */

import type { BaseAccessibilityProps } from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzDeferredContent component. */
export interface DzDeferredContentProps extends BaseAccessibilityProps {
  /**
   * Margin grown around the viewport (or `root`) before the content is
   * considered in view — e.g. `'200px'` mounts 200px early. Maps to the
   * IntersectionObserver `rootMargin` option. Defaults to `'0px'`.
   */
  rootMargin?: string
  /**
   * Visibility ratio(s) at which the content reveals. Maps to the
   * IntersectionObserver `threshold` option. Defaults to `0` (any pixel).
   */
  threshold?: number | number[]
  /**
   * Stop observing after the first reveal and keep the content mounted. When
   * `false`, the content is unmounted again as it leaves view and re-mounted on
   * the next entry. Defaults to `true`.
   */
  once?: boolean
  /** HTML element to render as. Defaults to `'div'`. */
  as?: string
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzDeferredContent. */
export interface DzDeferredContentEmits {
  /** Fired once, when the deferred content is first rendered. */
  load: []
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Props passed to the `placeholder` slot. */
export interface DzDeferredContentPlaceholderSlotProps {
  /** Whether the deferred content has been revealed yet (always `false` here). */
  loaded: boolean
}

/** Slot definitions for DzDeferredContent. */
export interface DzDeferredContentSlots {
  /** The deferred content, mounted once the wrapper scrolls into view. */
  default?: () => unknown
  /** Shown before the content loads; defaults to a DzSkeleton. */
  placeholder?: (props: DzDeferredContentPlaceholderSlotProps) => unknown
}

/** Imperative state exposed via template ref. */
export interface DzDeferredContentExpose {
  /** Whether the deferred content has been revealed. */
  loaded: boolean
}
