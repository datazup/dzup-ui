/**
 * DzTree — type definitions for the compound Tree view family.
 *
 * Hierarchical tree with expand/collapse, selection, and optional checkboxes.
 * Context injection via DZ_TREE_KEY (ADR-08).
 *
 * @module @dzip-ui/core/components/data/DzTree
 */

import type {
  BaseAccessibilityProps,
  CanonicalSize,
} from '@dzip-ui/contracts'
import type { Component, InjectionKey, Ref } from 'vue'

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
  /** Toggle expansion of a node */
  toggleExpand: (key: string) => void
  /** Toggle selection of a node */
  toggleSelect: (key: string) => void
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
  /** Whether nodes can be selected */
  selectable?: boolean
  /** Whether checkboxes are shown */
  checkable?: boolean
  /** Whether nodes can be dragged (future) */
  draggable?: boolean
  /** Component size */
  size?: CanonicalSize
  /** Disabled state */
  disabled?: boolean
  /** Loading state */
  loading?: boolean
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
}

/** Slot definitions for DzTreeItem */
export interface DzTreeItemSlots {
  /** Custom item content */
  default?: (props: { node: TreeNode, level: number, expanded: boolean, selected: boolean }) => unknown
}
