/**
 * DzPagination — type definitions.
 *
 * Uses Reka UI Pagination primitives (ADR-07).
 * v-model via defineModel<number>() (ADR-16).
 *
 * @module @dzup-ui/core/components/navigation/DzPagination
 */

import type {
  BaseAccessibilityProps,
  BaseEvents,
  CanonicalSize,
} from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzPagination component */
export interface DzPaginationProps extends BaseAccessibilityProps {
  /** Total number of items */
  total: number
  /** Number of items per page */
  pageSize?: number
  /** Number of visible page numbers around the current page */
  siblingCount?: number
  /** Whether to show first/last page buttons */
  showEdges?: boolean
  /** Component size */
  size?: CanonicalSize
  /** Disabled state -- prevents interaction */
  disabled?: boolean
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzPagination */
export interface DzPaginationEmits extends BaseEvents {
  /** Page value changed */
  change: [page: number]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzPagination */
export interface DzPaginationSlots {
  /** Custom first button content */
  first?: () => unknown
  /** Custom previous button content */
  prev?: () => unknown
  /** Custom next button content */
  next?: () => unknown
  /** Custom last button content */
  last?: () => unknown
}
