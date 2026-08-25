/**
 * DzTreeSelect — type definitions.
 *
 * A form select whose overlay panel is a {@link DzTree}. Composes DzPopover
 * (overlay) + DzTree (panel) + a DzSelect-styled trigger. Supports single,
 * multiple, and checkbox (with parent/child propagation) selection.
 *
 * v-model:value via defineModel (ADR-16). Props extend BaseFormControlProps
 * with the InputVariant family (ADR-02).
 *
 * @module @dzup-ui/core/components/forms/DzTreeSelect
 */

import type {
  AsyncOptionsEmits,
  AsyncOptionsProps,
  AsyncOptionsState,
  BaseFormControlProps,
  InputVariant,
} from '@dzup-ui/contracts'
import type { TreeNode } from '../data/DzTree.types.ts'

// Re-export the tree node shape so consumers can type their `nodes` data
// without reaching into the data family directly.
export type { TreeNode }

// ---------------------------------------------------------------------------
// Selection
// ---------------------------------------------------------------------------

/**
 * How nodes are selected.
 *
 * - `single` — one node; selecting closes the panel.
 * - `multiple` — many nodes, no propagation; panel stays open.
 * - `checkbox` — many nodes with parent/child propagation + indeterminate
 *   state; panel stays open.
 */
export type TreeSelectSelectionMode = 'single' | 'multiple' | 'checkbox'

/**
 * The v-model:value payload.
 *
 * `single` mode resolves to `string | undefined`; `multiple` and `checkbox`
 * modes resolve to `string[]`. The union covers both at the type level.
 */
export type TreeSelectValue = string | string[] | undefined

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzTreeSelect component */
export interface DzTreeSelectProps extends BaseFormControlProps<InputVariant>, AsyncOptionsProps {
  /** Hierarchical tree data shown in the overlay panel */
  nodes: TreeNode[]
  /** Selection behaviour */
  selectionMode?: TreeSelectSelectionMode
  /** Currently expanded node keys (v-model:expandedKeys) */
  expandedKeys?: string[]
  /** Placeholder shown in the trigger when nothing is selected */
  placeholder?: string
  /** Enable a type-to-search input that prunes the tree */
  filter?: boolean
  /** Placeholder for the filter input */
  filterPlaceholder?: string
  /** Text shown in the panel when the filter matches no nodes */
  noResultsText?: string
  /** Open the panel by default (uncontrolled initial state) */
  defaultOpen?: boolean
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzTreeSelect */
export interface DzTreeSelectEmits extends AsyncOptionsEmits {
  /** Emitted when the selected value changes */
  'change': [value: TreeSelectValue]
  /** Emitted when a node is selected (or toggled) */
  'select': [node: TreeNode]
  /** Emitted when the expanded keys change */
  'update:expandedKeys': [keys: string[]]
  /** Emitted when the panel opens */
  'open': []
  /** Emitted when the panel closes */
  'close': []
  /** Emitted when the trigger receives focus */
  'focus': [event: FocusEvent]
  /** Emitted when the trigger loses focus */
  'blur': [event: FocusEvent]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzTreeSelect */
export interface DzTreeSelectSlots {
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
  /** Custom rendering of the trigger value (selected label(s)) */
  'value'?: (props: {
    selectedNodes: TreeNode[]
    placeholder: string | undefined
  }) => unknown
  /** Custom rendering of a tree node label inside the panel */
  'node'?: (props: {
    node: TreeNode
    level: number
    expanded: boolean
    selected: boolean
    indeterminate: boolean
  }) => unknown
  /** Content shown when the panel has no (matching) nodes */
  'empty'?: () => unknown
}
