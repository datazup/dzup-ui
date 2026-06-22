/**
 * DzTree — shared keyboard-navigation helpers.
 *
 * Pure functions that flatten a tree into its currently-visible nodes (in DOM
 * order) and resolve roving-tabindex / arrow-key movement over that list. Used
 * by both DzTree (standalone, focus-managed roving tabindex) and DzTreeSelect
 * (combobox driving aria-activedescendant from the trigger) so the two widgets
 * share one navigation model (APG Tree View + Combobox patterns).
 *
 * @module @dzup-ui/core/components/data/treeNavigation
 */

import type { TreeNode } from './DzTree.types.ts'

/** A node that is currently visible (its ancestors are all expanded). */
export interface VisibleTreeNode {
  /** Node key */
  key: string
  /** 0-based nesting depth */
  level: number
  /** Whether the node is disabled (skipped by arrow navigation) */
  disabled: boolean
  /** Whether the node has children */
  hasChildren: boolean
  /** Whether the node is currently expanded */
  expanded: boolean
}

/** Direction of a roving-tabindex move. */
export type TreeNavDirection = 'up' | 'down' | 'first' | 'last'

/**
 * Flatten `nodes` into the list of nodes that are visible given `expandedKeys`,
 * in top-to-bottom DOM order. A child is visible only when every ancestor is
 * present in the expanded set.
 */
export function flattenVisibleNodes(
  nodes: TreeNode[],
  expandedKeys: ReadonlySet<string>,
  level = 0,
  acc: VisibleTreeNode[] = [],
): VisibleTreeNode[] {
  for (const node of nodes) {
    const hasChildren = Array.isArray(node.children) && node.children.length > 0
    const expanded = expandedKeys.has(node.key)
    acc.push({
      key: node.key,
      level,
      disabled: !!node.disabled,
      hasChildren,
      expanded,
    })
    if (hasChildren && expanded)
      flattenVisibleNodes(node.children!, expandedKeys, level + 1, acc)
  }
  return acc
}

/** First non-disabled visible node key, or undefined when none exist. */
export function firstFocusableKey(list: VisibleTreeNode[]): string | undefined {
  return list.find(n => !n.disabled)?.key
}

/** Last non-disabled visible node key, or undefined when none exist. */
export function lastFocusableKey(list: VisibleTreeNode[]): string | undefined {
  for (let i = list.length - 1; i >= 0; i--) {
    const node = list[i]
    if (node && !node.disabled)
      return node.key
  }
  return undefined
}

/**
 * Resolve the key the roving tabindex should move to from `current` in the
 * given `direction`, skipping disabled nodes. Returns undefined when no move is
 * possible (e.g. already at the first node moving up). When `current` is not in
 * the list, `down`/`first` fall to the first focusable node and `up`/`last` to
 * the last.
 */
export function getAdjacentKey(
  list: VisibleTreeNode[],
  current: string | undefined,
  direction: TreeNavDirection,
): string | undefined {
  if (list.length === 0)
    return undefined

  if (direction === 'first')
    return firstFocusableKey(list)
  if (direction === 'last')
    return lastFocusableKey(list)

  const index = current ? list.findIndex(n => n.key === current) : -1

  if (direction === 'down') {
    const start = index < 0 ? 0 : index + 1
    for (let i = start; i < list.length; i++) {
      const node = list[i]
      if (node && !node.disabled)
        return node.key
    }
    return undefined
  }

  // up
  const start = index < 0 ? list.length - 1 : index - 1
  for (let i = start; i >= 0; i--) {
    const node = list[i]
    if (node && !node.disabled)
      return node.key
  }
  return undefined
}

/**
 * Key of the first child of `current` in the visible list (its immediately
 * deeper sibling block), skipping disabled children. Returns undefined when the
 * node is collapsed, a leaf, or has only disabled children. Used by ArrowRight
 * on an already-expanded node (APG: move focus to the first child).
 */
export function getFirstChildKey(
  list: VisibleTreeNode[],
  current: string | undefined,
): string | undefined {
  if (current === undefined)
    return undefined
  const index = list.findIndex(n => n.key === current)
  if (index < 0)
    return undefined
  const parentLevel = list[index]!.level
  for (let i = index + 1; i < list.length; i++) {
    const node = list[i]!
    if (node.level <= parentLevel)
      break
    if (node.level === parentLevel + 1 && !node.disabled)
      return node.key
  }
  return undefined
}

/**
 * Key of the structural parent of `current` — the nearest preceding node one
 * level shallower. Returns undefined for root-level nodes. Used by ArrowLeft on
 * a collapsed or leaf node (APG: move focus to the parent node).
 */
export function getParentKey(
  list: VisibleTreeNode[],
  current: string | undefined,
): string | undefined {
  if (current === undefined)
    return undefined
  const index = list.findIndex(n => n.key === current)
  if (index < 0)
    return undefined
  const childLevel = list[index]!.level
  if (childLevel === 0)
    return undefined
  for (let i = index - 1; i >= 0; i--) {
    const node = list[i]!
    if (node.level === childLevel - 1)
      return node.key
  }
  return undefined
}
