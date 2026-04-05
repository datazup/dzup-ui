/**
 * DzSelect — type definitions (W1 simplified, string-based).
 *
 * Uses Reka UI Select primitives (ADR-07).
 * v-model via defineModel<string>() (ADR-16).
 * Generic version comes in W2.
 *
 * @module @dzip-ui/core/components/forms/DzSelect
 */

import type {
  BaseAccessibilityProps,
  BaseValidationProps,
  CanonicalSize,
  InputVariant,
  SelectOpenableEvents,
} from '@dzip-ui/contracts'

// ---------------------------------------------------------------------------
// Item shape
// ---------------------------------------------------------------------------

/** A single selectable item in the DzSelect dropdown */
export interface DzSelectItem {
  /** Display text */
  label: string
  /** Value used for selection */
  value: string
  /** Whether this item is disabled */
  disabled?: boolean
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzSelect component */
export interface DzSelectProps extends BaseAccessibilityProps, BaseValidationProps {
  /** Available options */
  items: DzSelectItem[]
  /** Placeholder text shown when no value is selected */
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
  /** Enable search/filter input in the dropdown */
  searchable?: boolean
  /** Placeholder text for the search input */
  searchPlaceholder?: string
  /** Custom filter function — overrides default case-insensitive label match */
  filterFn?: (option: DzSelectItem, query: string) => boolean
  /** Text shown when no options match the search query */
  noResultsText?: string
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzSelect */
export interface DzSelectEmits extends SelectOpenableEvents<string> {}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzSelect */
export interface DzSelectSlots {
  /** Custom trigger content */
  trigger?: (props: { value: string | undefined, placeholder: string | undefined }) => unknown
  /** Custom item rendering */
  item?: (props: { item: DzSelectItem, index: number, selected: boolean }) => unknown
  /** Content shown when items array is empty */
  empty?: () => unknown
}
