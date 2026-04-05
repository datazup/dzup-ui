/**
 * DzCombobox — type definitions.
 *
 * Uses Reka UI ComboboxRoot (ADR-07) for searchable select.
 * v-model via defineModel (ADR-16).
 *
 * @module @dzip-ui/core/components/forms/DzCombobox
 */

import type {
  BaseAccessibilityProps,
  BaseValidationProps,
  CanonicalSize,
  InputVariant,
  SelectOpenableEvents,
} from '@dzip-ui/contracts'
import type { DzSelectItem } from './DzSelect.types.ts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzCombobox component */
export interface DzComboboxProps extends BaseAccessibilityProps, BaseValidationProps {
  /** Available options */
  items: DzSelectItem[]
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
  /** Allow typing a custom value not in the items list */
  allowCustomValue?: boolean
  /** Custom filter function for searching items */
  filterFn?: (item: DzSelectItem, query: string) => boolean
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzCombobox */
export interface DzComboboxEmits extends SelectOpenableEvents<string> {}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzCombobox */
export interface DzComboboxSlots {
  /** Custom item rendering */
  item?: (props: { item: DzSelectItem, index: number, selected: boolean }) => unknown
  /** Content shown when no results match the query */
  empty?: () => unknown
}
