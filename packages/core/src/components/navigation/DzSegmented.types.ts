/**
 * DzSegmented — Type definitions for the segmented control.
 *
 * Uses Reka UI ToggleGroupRoot (ADR-07).
 * v-model via defineModel<string>() (ADR-16).
 *
 * @module @dzup-ui/core/components/navigation/DzSegmented
 */

import type { BaseAccessibilityProps, CanonicalSize } from '@dzup-ui/contracts'

/** A segmented item option */
export interface SegmentedItem {
  /** Unique value for the option */
  value: string
  /** Display label */
  label: string
  /** Whether the option is disabled */
  disabled?: boolean
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzSegmented component */
export interface DzSegmentedProps extends BaseAccessibilityProps {
  /** Items to render as segments */
  items: SegmentedItem[]
  /** Component size */
  size?: CanonicalSize
  /** Disabled state -- prevents all interaction */
  disabled?: boolean
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzSegmented */
export interface DzSegmentedEmits {
  /** Active segment changed */
  change: [value: string]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzSegmented */
export interface DzSegmentedSlots {
  /** Custom item rendering */
  item?: (props: { item: SegmentedItem, active: boolean }) => unknown
}
