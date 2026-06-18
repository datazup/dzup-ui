/**
 * DzInfiniteScroll — type definitions.
 *
 * A declarative, IntersectionObserver-based "load more" wrapper. The default
 * slot holds the already-rendered items; a sentinel is rendered next to them
 * and emits `load-more` as it scrolls into view, guarded so it fires once per
 * intersection until the parent flips `loading` back off. It standardises the
 * scroll-driven paging pattern and pairs with DzList, DzDataView, and DzTable.
 *
 * @module @dzup-ui/core/components/data/DzInfiniteScroll
 */

import type { BaseAccessibilityProps, CanonicalSize } from '@dzup-ui/contracts'
import type { InfiniteScrollDirection } from '../../composables/useInfiniteScroll/index.ts'

export type { InfiniteScrollDirection }

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzInfiniteScroll component */
export interface DzInfiniteScrollProps extends BaseAccessibilityProps {
  /** Whether a page load is currently in flight — suppresses further triggers */
  loading?: boolean
  /** Whether more items remain to be loaded */
  hasMore?: boolean
  /** Disables the loader entirely (no observation, no triggers) */
  disabled?: boolean
  /**
   * The last load failed — renders the `error` slot with a `retry` handler
   * instead of the loading/end states.
   */
  error?: boolean
  /** Distance (px) ahead of the sentinel at which loading should begin */
  distance?: number
  /** Paging direction — `'down'` for feeds, `'up'` for reverse/chat lists */
  direction?: InfiniteScrollDirection
  /** Component size — scales the sentinel + status row spacing */
  size?: CanonicalSize
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzInfiniteScroll */
export interface DzInfiniteScrollEmits {
  /** The sentinel entered view and all guards passed — load the next page */
  'load-more': []
  /** The user (or `retry`) asked to re-attempt a failed load */
  'retry': []
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Props passed to the `error` slot */
export interface DzInfiniteScrollErrorSlotProps {
  /** Re-arm the loader and re-emit `load-more` to retry the failed page */
  retry: () => void
}

/** Slot definitions for DzInfiniteScroll */
export interface DzInfiniteScrollSlots {
  /** The already-rendered items (required) */
  default?: () => unknown
  /** Loading indicator shown while `loading` is true */
  loading?: () => unknown
  /** End state shown when `hasMore` is false (no more items) */
  end?: () => unknown
  /** Error state shown when `error` is true; receives a `retry` handler */
  error?: (props: DzInfiniteScrollErrorSlotProps) => unknown
}

/** Imperative methods exposed via template ref */
export interface DzInfiniteScrollExpose {
  /** Re-arm the loader and re-emit `load-more` to retry the failed page */
  retry: () => void
}
