/**
 * DzSelect — type definitions (W1 simplified, string-based).
 *
 * Uses Reka UI Select primitives (ADR-07).
 * v-model via defineModel<string>() (ADR-16).
 * Generic version comes in W2.
 *
 * @module @dzup-ui/core/components/forms/DzSelect
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
import type { DzSelectUi } from './DzSelect.anatomy.ts'

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
export interface DzSelectProps
  extends BaseAccessibilityProps,
  BaseValidationProps,
  BasePortalProps,
  AsyncOptionsProps {
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
  /**
   * Per-part class overrides, keyed by the names in `DzSelect.anatomy.ts`
   * (ADR-19). `class` keeps landing on the `trigger`, the node it has always
   * landed on; `ui.root` reaches the outer wrapper, and `ui.content` reaches
   * the portaled listbox that no `class` could ever reach.
   *
   * @example
   * ```vue
   * <DzSelect :ui="{ content: 'max-h-40', item: 'py-3' }" />
   * ```
   */
  ui?: DzSelectUi
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
/**
 * Events emitted by DzSelect.
 *
 * `AsyncOptionsEmits` adds `load-options` and `retry-options`, which a host
 * listens to when the option set comes from somewhere. A host that passes a
 * static `items` array never sees either (renderer contract C9).
 */
export interface DzSelectEmits extends SelectOpenableEvents<string>, AsyncOptionsEmits {}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzSelect */
export interface DzSelectSlots {
  /** Custom trigger content */
  'trigger'?: (props: { value: string | undefined, placeholder: string | undefined }) => unknown
  /** Custom item rendering */
  'item'?: (props: { item: DzSelectItem, index: number, selected: boolean }) => unknown
  /**
   * The single row shown instead of the list while the option set is loading,
   * empty, or failed (renderer contract C9).
   *
   * Given the resolved state, the message the control would have shown, the
   * host's error string, and a `retry` to call. Overriding it replaces all
   * three states at once, on purpose: a consumer who styles "loading" and
   * forgets "error" ships a panel that says nothing when a load fails.
   */
  'options-state'?: (props: {
    state: AsyncOptionsState
    message: string
    error: string | undefined
    retry: () => void
  }) => unknown
  /** Content shown when items array is empty */
  'empty'?: () => unknown
}
