/**
 * DzCascader — type definitions.
 *
 * A cascading multi-level select: the trigger opens a popover that reveals
 * child options column-by-column as each level is chosen (country → state →
 * city). An optional flat filter mode searches across full paths instead.
 *
 * Built on Reka UI Popover primitive (ADR-07).
 * v-model:value via defineModel (ADR-16) — an array of keys for the selected
 * path, e.g. `['cn', 'zj', 'hz']`.
 *
 * @module @dzup-ui/core/components/forms/DzCascader
 */

import type {
  AsyncOptionsEmits,
  AsyncOptionsProps,
  AsyncOptionsState,
  BaseFormControlProps,
  BasePortalProps,
  InputVariant,
  SelectOpenableEvents,
} from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Value + option shapes
// ---------------------------------------------------------------------------

/** A single key in a cascader path */
export type DzCascaderKey = string | number

/** The selected path expressed as an ordered list of keys (root → leaf) */
export type DzCascaderValue = DzCascaderKey[]

/** A node in the cascader option tree */
export interface DzCascaderOption {
  /** Display text for this level */
  label: string
  /** Value used for selection (becomes one entry of the path) */
  value: DzCascaderKey
  /** Child options revealed in the next column when this node is chosen */
  children?: DzCascaderOption[]
  /** Whether this node (and its subtree) is unselectable */
  disabled?: boolean
}

/** Trigger that reveals a node's child column */
export type DzCascaderExpandTrigger = 'click' | 'hover'

/** A flattened root→node path, used by the filter (search) mode */
export interface DzCascaderFlatPath {
  /** The option chain from root to this node */
  path: DzCascaderOption[]
  /** Display labels for each level */
  labels: string[]
  /** Selected value for this path */
  value: DzCascaderValue
  /** Whether the path is unselectable */
  disabled: boolean
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzCascader component */
export interface DzCascaderProps extends BaseFormControlProps<InputVariant>, BasePortalProps, AsyncOptionsProps {
  /** Nested option tree */
  options: DzCascaderOption[]
  /** Placeholder shown on the trigger when nothing is selected */
  placeholder?: string
  /** Allow committing a non-leaf (parent) node, not just leaves */
  changeOnSelect?: boolean
  /** Whether a child column opens on `click` (default) or `hover` */
  expandTrigger?: DzCascaderExpandTrigger
  /** Enable the flat, searchable path filter */
  filter?: boolean
  /** Separator rendered between labels in the selected path / search results */
  separator?: string
  /** Placeholder for the filter search input */
  searchPlaceholder?: string
  /** Copy shown when a search yields no matching paths */
  noResultsText?: string
  /** Show the clear ("cleaner") button when a value is selected */
  cleaner?: boolean
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/**
 * Events emitted by DzCascader.
 *
 * - `change` — path committed (array of keys)
 * - `select` — a path was chosen (same payload as change)
 * - `clear`  — value cleared via the cleaner button
 * - `open` / `close` — popover visibility
 * - `focus` / `blur` — trigger focus
 */
export interface DzCascaderEmits extends SelectOpenableEvents<DzCascaderValue>, AsyncOptionsEmits {}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzCascader */
export interface DzCascaderSlots {
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
  /** Override the selected-path display (default renders `A / B / C`). */
  'value'?: (props: {
    path: DzCascaderOption[]
    value: DzCascaderValue
    labels: string[]
  }) => unknown
}
