/**
 * DzCombobox — type definitions.
 *
 * Uses Reka UI ComboboxRoot (ADR-07) for searchable select.
 * v-model via defineModel (ADR-16).
 *
 * @module @dzup-ui/core/components/forms/DzCombobox
 */

import type {
  AsyncOptionsEmits,
  AsyncOptionsProps,
  AsyncOptionsState,
  BaseAccessibilityProps,
  BasePortalProps,
  BaseValidationProps,
  CanonicalSize,
  InputVariant,
  SelectOpenableEvents,
} from '@dzup-ui/contracts'
import type { DzSelectItem } from './DzSelect.types.ts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzCombobox component */
export type DzComboboxItem = DzSelectItem | Record<string, unknown>

/**
 * Normalized runtime shape used internally and exposed through slots/filtering.
 * `raw` preserves the caller's original item object for richer custom UIs.
 */
export interface DzComboboxResolvedItem {
  raw: DzComboboxItem
  label: string
  value: string
  disabled?: boolean
}

/** Props for the DzCombobox component */
export interface DzComboboxProps extends BaseAccessibilityProps, BaseValidationProps, BasePortalProps, AsyncOptionsProps {
  /** Available options */
  items: DzComboboxItem[]
  /** Placeholder text for the search input */
  placeholder?: string
  /** Disabled state -- prevents interaction */
  disabled?: boolean
  /** Component size */
  size?: CanonicalSize
  /** Visual style variant */
  variant?: InputVariant
  /** Form field name */
  name?: string
  /** Whether the dropdown should be open by default (uncontrolled) */
  defaultOpen?: boolean
  /** Open the dropdown when the input/anchor is clicked */
  openOnClick?: boolean
  /** Open the dropdown when the input receives focus */
  openOnFocus?: boolean
  /** Allow typing a custom value not in the items list */
  allowCustomValue?: boolean
  /** Show a loading state instead of items */
  loading?: boolean
  /** Loading state copy */
  loadingText?: string
  /** Copy shown when there are no source items */
  emptyText?: string
  /** Copy shown when items exist but none match the search query */
  noResultsText?: string
  /** Resolve the item's selected value */
  getItemValue?: (item: DzComboboxItem) => string
  /** Resolve the item's display label */
  getItemLabel?: (item: DzComboboxItem) => string
  /** Resolve whether the item should be disabled */
  getItemDisabled?: (item: DzComboboxItem) => boolean
  /** Custom filter function for searching items */
  filterFn?: (item: DzComboboxResolvedItem, query: string) => boolean
  /** Override how the selected item is rendered back into the input */
  displayValue?: (item: DzComboboxResolvedItem | undefined, value: string) => string
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzCombobox */
export interface DzComboboxEmits extends SelectOpenableEvents<string>, AsyncOptionsEmits {}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzCombobox */
export interface DzComboboxSlots {
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
  /** Custom item rendering */
  'item'?: (props: { item: DzComboboxResolvedItem, index: number, selected: boolean }) => unknown
  /** Content shown when items are loading */
  'loading'?: () => unknown
  /** Content shown when the dropdown has no renderable items */
  'empty'?: (props: { query: string, loading: boolean, hasItems: boolean }) => unknown
}
