/**
 * DzTransfer — Type definitions for the dual-list transfer component.
 *
 * Built from scratch (no Reka UI primitive).
 * v-model via defineModel (ADR-16).
 *
 * @module @dzip-ui/core/components/forms/DzTransfer
 */

import type {
  BaseAccessibilityProps,
  BaseValidationProps,
  CanonicalSize,
} from '@dzip-ui/contracts'

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------

/** A single item in the transfer list */
export interface TransferItem {
  /** Unique key identifier */
  key: string
  /** Display label */
  label: string
  /** Whether the item is disabled */
  disabled?: boolean
}

/** Change payload indicating the final state of both lists */
export interface TransferChangePayload {
  /** Keys remaining in the source list */
  source: string[]
  /** Keys moved to the target list */
  target: string[]
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzTransfer component */
export interface DzTransferProps extends BaseAccessibilityProps, BaseValidationProps {
  /** All available source items */
  source: TransferItem[]
  /** Pre-populated target items (alternative to modelValue) */
  target?: TransferItem[]
  /** Enable search filtering in both lists */
  searchable?: boolean
  /** Disabled state -- prevents interaction */
  disabled?: boolean
  /** Component size */
  size?: CanonicalSize
  /** Placeholder for search inputs */
  searchPlaceholder?: string
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzTransfer */
export interface DzTransferEmits {
  /** Selection changed (keys that are in the target list) */
  change: [payload: TransferChangePayload]
  /** Focus gained */
  focus: [event: FocusEvent]
  /** Focus lost */
  blur: [event: FocusEvent]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzTransfer */
export interface DzTransferSlots {
  /** Custom source list header */
  'source-header'?: () => unknown
  /** Custom target list header */
  'target-header'?: () => unknown
  /** Custom item rendering */
  'item'?: (props: { item: TransferItem, selected: boolean }) => unknown
}
