/**
 * DzMultiSelect — type definitions.
 *
 * Uses Reka UI ComboboxRoot in multiple mode (ADR-07).
 * v-model via defineModel (ADR-16).
 *
 * @module @dzup-ui/core/components/forms/DzMultiSelect
 */

import type {
  BaseAccessibilityProps,
  BaseValidationProps,
  CanonicalSize,
  InputVariant,
  SelectOpenableEvents,
} from '@dzup-ui/contracts'
import type { DzSelectItem } from './DzSelect.types.ts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzMultiSelect component */
export interface DzMultiSelectProps extends BaseAccessibilityProps, BaseValidationProps {
  /** Available options */
  items: DzSelectItem[]
  /** Placeholder text when no values are selected */
  placeholder?: string
  /** Disabled state -- prevents interaction */
  disabled?: boolean
  /** Component size */
  size?: CanonicalSize
  /** Visual style variant */
  variant?: InputVariant
  /** Form field name */
  name?: string
  /** Maximum number of items that can be selected */
  maxSelections?: number
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzMultiSelect */
export interface DzMultiSelectEmits extends SelectOpenableEvents<string[]> {}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzMultiSelect */
export interface DzMultiSelectSlots {
  /** Custom item rendering */
  item?: (props: { item: DzSelectItem, index: number, selected: boolean }) => unknown
  /** Content shown when items array is empty */
  empty?: () => unknown
  /** Custom tag/chip for selected items */
  tag?: (props: { value: string, label: string, remove: () => void }) => unknown
}
