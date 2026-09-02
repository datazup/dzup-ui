/**
 * DzSearchInput — Type definitions for search input with icon and clear.
 *
 * @module @dzup-ui/core/components/inputs/DzSearchInput
 */

import type {
  BaseFormControlProps,
  ChangeEvents,
  InputVariant,
} from '@dzup-ui/contracts'
import type { DzSearchInputUi } from './DzSearchInput.anatomy.ts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzSearchInput component */
export interface DzSearchInputProps extends BaseFormControlProps<InputVariant> {
  /** Placeholder text */
  placeholder?: string
  /** Whether to show the clear button when input has value */
  clearable?: boolean
  /** Debounce delay in ms for the search emit. 0 = no debounce. */
  debounce?: number
  /** Accessible label for the loading spinner shown when `loading` is true */
  loadingLabel?: string
  /**
   * Per-part class overrides, keyed by the names in `DzSearchInput.anatomy.ts`
   * (ADR-19 §5). `class` keeps its existing meaning and its existing target;
   * `ui` addresses the other parts by name, and a typo is a type error.
   *
   * @example
   * ```vue
   * <DzSearchInput v-model="q" :ui="{ icon: 'text-[var(--dz-primary)]' }" />
   * ```
   */
  ui?: DzSearchInputUi
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzSearchInput */
export interface DzSearchInputEmits extends ChangeEvents<string> {
  /** Search submitted (Enter key) */
  search: [value: string]
  /** Value cleared */
  clear: []
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzSearchInput */
export interface DzSearchInputSlots {
  /** Content rendered after the input (replaces clear button area) */
  suffix?: () => unknown
}
