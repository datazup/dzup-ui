/**
 * DzResult — Type definitions for the operation result display component.
 *
 * @module @dzup-ui/core/components/feedback/DzResult
 */

/** Result status options */
export type ResultStatus = 'success' | 'error' | 'warning' | 'info'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzResult component */
export interface DzResultProps {
  /** Status determines the icon and color */
  status: ResultStatus
  /** Title text */
  title: string
  /** Description text */
  description?: string
  /** Unique element ID */
  id?: string
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzResult */
export interface DzResultSlots {
  /** Custom content below the description */
  default?: () => unknown
  /** Custom icon (overrides status icon) */
  icon?: () => unknown
  /** Action buttons area */
  actions?: () => unknown
}
