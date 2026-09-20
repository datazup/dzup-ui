/**
 * DzTree — type definitions for the compound Tree view family.
 *
 * Hierarchical tree with expand/collapse, selection, and optional checkboxes.
 * Context injection via DZ_TREE_KEY (ADR-08).
 *
 * @module @dzup-ui/core/components/data/DzTree
 */

import type {
  BaseAccessibilityProps,
  CanonicalSize,
} from '@dzup-ui/contracts'
import type { Component, ComputedRef, InjectionKey, Ref } from 'vue'
import type { DzTreeUi } from './DzTree.anatomy.ts'
import type { DzTreeItemUi } from './DzTreeItem.anatomy.ts'
import type { TreeNavDirection } from './treeNavigation.ts'

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------

/** Node in the tree structure */
export interface TreeNode<T = unknown> {
  /** Unique identifier for this node */
  key: string
  /** Display label */
  label: string
  /** Child nodes */
  children?: TreeNode<T>[]
  /** Arbitrary payload data */
  data?: T
  /** Whether this node is disabled */
  disabled?: boolean
  /** Optional icon component */
  icon?: Component
}

// ---------------------------------------------------------------------------
// Context (ADR-08)
// ---------------------------------------------------------------------------

/** Context provided to DzTreeItem children via inject */
export interface DzTreeContext {
  /** Stable id of the tree root; treeitem element ids derive from it */
  treeId: string
  /** Component size */
  size: Ref<CanonicalSize>
  /** Currently expanded node keys */
  expandedKeys: Ref<string[]>
  /** Currently selected node keys */
  selectedKeys: Ref<string[]>
  /** Whether selection is enabled */
  selectable: Ref<boolean>
  /** Whether checkboxes are shown */
  checkable: Ref<boolean>
  /**
   * Whether the WHOLE tree is disabled (N1-O1 defect D1).
   *
   * `<DzTree disabled>` used to stamp `data-state="disabled"` on the root and
   * nothing else, because the prop never reached the context: every row kept
   * its roving `tabindex`, its click handler, its chevron and its selection.
   * A node is inert when this is true **or** when its own `node.disabled` is.
   */
  disabled: Ref<boolean>
  /**
   * Key of the single treeitem that holds the roving `tabindex="0"`; every
   * other treeitem is `tabindex="-1"` (APG roving-tabindex pattern).
   */
  tabbableKey: ComputedRef<string | undefined>
  /** Build the DOM id for a treeitem from its node key. */
  itemId: (key: string) => string
  /** Toggle expansion of a node */
  toggleExpand: (key: string) => void
  /** Toggle selection of a node */
  toggleSelect: (key: string) => void
  /** Mark a node active (roving tabindex follows it); no focus side effects. */
  setActiveKey: (key: string) => void
  /**
   * Move the roving tabindex / active node from `currentKey` in `direction`,
   * moving DOM focus to the new node. Used by standalone keyboard navigation.
   */
  navigate: (currentKey: string, direction: TreeNavDirection) => void
  /**
   * Move the roving tabindex / active node to the first child of `currentKey`,
   * moving DOM focus to it. No-op when the node has no visible children (APG
   * ArrowRight on an already-expanded node).
   */
  navigateToChild: (currentKey: string) => void
  /**
   * Move the roving tabindex / active node to the parent of `currentKey`,
   * moving DOM focus to it. No-op for root-level nodes (APG ArrowLeft on a
   * collapsed or leaf node).
   */
  navigateToParent: (currentKey: string) => void
}

/** Typed injection key for DzTree context (ADR-08, SCREAMING_SNAKE) */
export const DZ_TREE_KEY: InjectionKey<DzTreeContext> = Symbol('dz-tree')

// ---------------------------------------------------------------------------
// DzTree (Root) Props
// ---------------------------------------------------------------------------

/** Props for the DzTree root component */
export interface DzTreeProps<T = unknown> extends BaseAccessibilityProps {
  /** Tree data items */
  items: TreeNode<T>[]
  /** Currently expanded node keys (v-model) */
  expandedKeys?: string[]
  /** Currently selected node keys (v-model) */
  selectedKeys?: string[]
  /**
   * Key of the active treeitem — the one holding the roving `tabindex="0"` and
   * referenced by a composing combobox's `aria-activedescendant` (v-model).
   */
  activeKey?: string
  /** Whether nodes can be selected */
  selectable?: boolean
  /** Whether checkboxes are shown */
  checkable?: boolean
  /**
   * Reserved for future HTML5 drag-and-drop support. The prop is recognised
   * by the contract but currently has no behaviour -- DzTree does not bind
   * any drag event handlers when it is set. Kept in the contract so a later
   * implementation can land without a breaking prop addition.
   *
   * TODO: ship a reference DnD implementation or remove this prop and rev
   * the contract (tracked in sandbox/DataPage next-steps).
   */
  draggable?: boolean
  /** Component size */
  size?: CanonicalSize
  /** Disabled state */
  disabled?: boolean
  /** Loading state */
  loading?: boolean
  /**
   * Per-part class overrides, keyed by the names in `DzTree.anatomy.ts`
   * (ADR-19 §5). `class` keeps its existing meaning and its existing target;
   * a key outside the declared parts is a type error, not a class that lands
   * nowhere.
   */
  ui?: DzTreeUi
}

// ---------------------------------------------------------------------------
// DzTree Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzTree */
export interface DzTreeEmits {
  /** Emitted when expanded keys change */
  'update:expandedKeys': [keys: string[]]
  /** Emitted when selected keys change */
  'update:selectedKeys': [keys: string[]]
  /** Emitted when the active (roving-tabindex) node changes */
  'update:activeKey': [key: string | undefined]
  /** Emitted when a node is clicked */
  'nodeClick': [node: TreeNode]
  /** Emitted when a node is expanded */
  'nodeExpand': [node: TreeNode]
  /** Emitted when a node is collapsed */
  'nodeCollapse': [node: TreeNode]
}

// ---------------------------------------------------------------------------
// DzTree Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzTree */
export interface DzTreeSlots {
  /** Custom node rendering */
  item?: (props: { node: TreeNode, level: number, expanded: boolean, selected: boolean }) => unknown
  /** Content shown when tree is empty */
  empty?: () => unknown
}

// ---------------------------------------------------------------------------
// DzTreeItem Props
// ---------------------------------------------------------------------------

/** Props for the DzTreeItem component */
export interface DzTreeItemProps {
  /** The tree node data */
  node: TreeNode
  /** Nesting level (0-based) */
  level?: number
  /** 1-based position of this node within its sibling group (aria-posinset) */
  posInSet?: number
  /** Total number of siblings in this node's group (aria-setsize) */
  setSize?: number
  /**
   * Per-part class overrides, keyed by the names in `DzTreeItem.anatomy.ts`
   * (ADR-19 §5). `class` keeps its existing meaning and its existing target;
   * a key outside the declared parts is a type error, not a class that lands
   * nowhere.
   */
  ui?: DzTreeItemUi
}

/** Slot definitions for DzTreeItem */
export interface DzTreeItemSlots {
  /** Custom item content */
  default?: (props: { node: TreeNode, level: number, expanded: boolean, selected: boolean }) => unknown
}
