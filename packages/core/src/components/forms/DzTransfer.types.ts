/**
 * DzTransfer — Type definitions for the dual-list transfer component.
 *
 * Built from scratch (no Reka UI primitive).
 * v-model via defineModel (ADR-16).
 *
 * @module @dzup-ui/core/components/forms/DzTransfer
 */

import type {
  AsyncOptionsEmits,
  AsyncOptionsProps,
  AsyncOptionsState,
  BaseAccessibilityProps,
  BaseValidationProps,
  CanonicalSize,
} from '@dzup-ui/contracts'

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
export interface DzTransferProps extends BaseAccessibilityProps, BaseValidationProps, AsyncOptionsProps {
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
export interface DzTransferEmits extends AsyncOptionsEmits {
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
  /**
   * The single row shown instead of the list while the option set is loading,
   * empty, or failed (renderer contract C9).
   *
   * Overriding it replaces all three states at once, on purpose: a consumer who
   * styles "loading" and forgets "error" ships a panel that says nothing when a
   * load fails.
   */
  'options-state'?: (props: {
    state: AsyncOptionsState
    message: string
    error: string | undefined
    retry: () => void
  }) => unknown
  /** Custom source list header */
  'source-header'?: () => unknown
  /** Custom target list header */
  'target-header'?: () => unknown
  /** Custom item rendering */
  'item'?: (props: { item: TransferItem, selected: boolean }) => unknown
}
