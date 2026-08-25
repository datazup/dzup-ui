/**
 * DzListbox — type definitions.
 *
 * Always-visible single/multi-select list built on Reka UI Listbox
 * primitives (ADR-07). v-model via defineModel (ADR-16).
 *
 * @module @dzup-ui/core/components/forms/DzListbox
 */

import type { AsyncOptionsEmits, AsyncOptionsProps, AsyncOptionsState, BaseFormControlProps, SelectEvents } from '@dzup-ui/contracts'
import type { Component } from 'vue'

// ---------------------------------------------------------------------------
// Value / option shape
// ---------------------------------------------------------------------------

/**
 * A value a Listbox option may carry. Strings and numbers are the common
 * case; arbitrary objects are supported via `optionLabel`/`optionValue`.
 */
export type DzListboxValue = string | number | Record<string, unknown>

/**
 * The bound model. A single value (or `null`) in single mode, an array in
 * `multiple` mode.
 */
export type DzListboxModelValue = DzListboxValue | DzListboxValue[] | null

/** A single option in the canonical `{ label, value }` shape */
export interface DzListboxOption {
  /** Display text */
  label: string
  /** Value used for selection */
  value: DzListboxValue
  /** Whether this option is disabled */
  disabled?: boolean
  /** Optional leading icon component (e.g. a lucide icon) */
  icon?: Component
  /** Optional group key — used when `optionGroup` is not set */
  group?: string
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzListbox component */
export interface DzListboxProps extends BaseFormControlProps<never>, AsyncOptionsProps {
  /**
   * Available options. Either canonical {@link DzListboxOption}s or arbitrary
   * objects resolved through `optionLabel`/`optionValue`/`optionGroup`.
   */
  options: DzListboxOption[] | Record<string, unknown>[]
  /** Allow selecting multiple values — switches the model to an array */
  multiple?: boolean
  /** Key used to read the display label from arbitrary option objects */
  optionLabel?: string
  /** Key used to read the value from arbitrary option objects */
  optionValue?: string
  /** Key used to read the disabled flag from arbitrary option objects */
  optionDisabled?: string
  /** Key used to read the group name from arbitrary option objects */
  optionGroup?: string
  /** Render a built-in search field that narrows the visible options */
  filter?: boolean
  /** Placeholder for the built-in filter input */
  filterPlaceholder?: string
  /** Show a check indicator next to selected options */
  checkmark?: boolean
  /** Message rendered when there are no (matching) options */
  emptyMessage?: string
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzListbox */
export interface DzListboxEmits extends SelectEvents<DzListboxModelValue>, AsyncOptionsEmits {
  /** The filter query changed (only when `filter` is enabled) */
  filter: [query: string]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzListbox */
export interface DzListboxSlots {
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
  /** Custom option rendering */
  'option'?: (props: { option: DzListboxOption, index: number, selected: boolean }) => unknown
  /** Custom group label rendering */
  'groupLabel'?: (props: { group: string }) => unknown
  /** Content shown when there are no (matching) options */
  'empty'?: () => unknown
}
