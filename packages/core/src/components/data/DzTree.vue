<script setup lang="ts">
import type {
  DzTreeContext,
  DzTreeEmits,
  DzTreeProps,
  DzTreeSlots,
  TreeNode,
} from './DzTree.types.ts'
import type { TreeNavDirection } from './treeNavigation.ts'
/**
 * DzTree — Hierarchical tree view with expand/collapse, selection, and checkboxes.
 *
 * Built from scratch (not Reka UI). Provides context to DzTreeItem
 * children via inject (ADR-08). v-model for expandedKeys and selectedKeys (ADR-16).
 *
 * @example
 * ```vue
 * <DzTree
 *   :items="treeData"
 *   v-model:expanded-keys="expanded"
 *   v-model:selected-keys="selected"
 *   selectable
 * />
 * ```
 */
import { computed, nextTick, provide, toRef, useAttrs, useId } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_TREE_KEY } from './DzTree.types.ts'
import { treeVariants } from './DzTree.variants.ts'
import DzTreeItem from './DzTreeItem.vue'
import {
  firstFocusableKey,
  flattenVisibleNodes,
  getAdjacentKey,
  getFirstChildKey,
  getParentKey,

} from './treeNavigation.ts'

defineOptions({
  inheritAttrs: false,
})

const expandedKeys = defineModel<string[]>('expandedKeys', { default: () => [] })

const selectedKeys = defineModel<string[]>('selectedKeys', { default: () => [] })

const activeKey = defineModel<string | undefined>('activeKey', { default: undefined })

const props = withDefaults(defineProps<DzTreeProps>(), {
  selectable: false,
  checkable: false,
  draggable: false,
  size: 'md',
  disabled: false,
  loading: false,
})

const emit = defineEmits<DzTreeEmits>()
defineSlots<DzTreeSlots>()

const attrs = useAttrs()

/** Stable root id; treeitem element ids derive from it for aria-activedescendant. */
const fallbackId = useId()
const treeId = computed(() => props.id ?? fallbackId ?? 'dz-tree')

function itemId(key: string): string {
  return `${treeId.value}-ti-${key}`
}

// ── Roving tabindex / keyboard navigation (APG Tree View) ───────────────────

/** Visible nodes in DOM order, given the current expansion state. */
const visibleNodes = computed(() =>
  flattenVisibleNodes(props.items, new Set(expandedKeys.value)),
)

/**
 * The single node that carries `tabindex="0"`: the active node when it is
 * currently visible and focusable, otherwise the first focusable node so the
 * tree always has exactly one tab stop.
 */
const tabbableKey = computed<string | undefined>(() => {
  if (activeKey.value) {
    const match = visibleNodes.value.find(
      n => n.key === activeKey.value && !n.disabled,
    )
    if (match)
      return activeKey.value
  }
  return firstFocusableKey(visibleNodes.value)
})

function setActiveKey(key: string): void {
  activeKey.value = key
}

/** Move DOM focus to a node's row (the focusable element inside the treeitem). */
function focusItem(key: string): void {
  nextTick(() => {
    const li = document.getElementById(itemId(key))
    const row = li?.querySelector<HTMLElement>(':scope > [data-dz-tree-row]')
    row?.focus()
  })
}

function navigate(currentKey: string, direction: TreeNavDirection): void {
  const next = getAdjacentKey(visibleNodes.value, currentKey, direction)
  if (next === undefined || next === currentKey)
    return
  activeKey.value = next
  focusItem(next)
}

function navigateToChild(currentKey: string): void {
  const child = getFirstChildKey(visibleNodes.value, currentKey)
  if (child === undefined)
    return
  activeKey.value = child
  focusItem(child)
}

function navigateToParent(currentKey: string): void {
  const parent = getParentKey(visibleNodes.value, currentKey)
  if (parent === undefined)
    return
  activeKey.value = parent
  focusItem(parent)
}

/** Find a node by key in the tree structure */
function findNode(nodes: TreeNode[], key: string): TreeNode | undefined {
  for (const node of nodes) {
    if (node.key === key)
      return node
    if (node.children) {
      const found = findNode(node.children, key)
      if (found)
        return found
    }
  }
  return undefined
}

function toggleExpand(key: string): void {
  const node = findNode(props.items, key)
  if (!node)
    return

  const index = expandedKeys.value.indexOf(key)
  if (index >= 0) {
    expandedKeys.value = expandedKeys.value.filter(k => k !== key)
    emit('nodeCollapse', node)
  }
  else {
    expandedKeys.value = [...expandedKeys.value, key]
    emit('nodeExpand', node)
  }
}

function toggleSelect(key: string): void {
  const node = findNode(props.items, key)
  if (!node)
    return

  const index = selectedKeys.value.indexOf(key)
  if (index >= 0) {
    selectedKeys.value = selectedKeys.value.filter(k => k !== key)
  }
  else {
    selectedKeys.value = [...selectedKeys.value, key]
  }

  emit('nodeClick', node)
}

const context: DzTreeContext = {
  treeId: treeId.value,
  size: toRef(() => props.size),
  expandedKeys,
  selectedKeys,
  selectable: toRef(() => props.selectable),
  checkable: toRef(() => props.checkable),
  tabbableKey,
  itemId,
  toggleExpand,
  toggleSelect,
  setActiveKey,
  navigate,
  navigateToChild,
  navigateToParent,
}

provide(DZ_TREE_KEY, context)

const styles = computed(() => treeVariants({ size: props.size }))

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)
</script>

<template>
  <ul
    :id="treeId"
    role="tree"
    :class="rootClasses"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    :data-state="disabled ? 'disabled' : loading ? 'loading' : 'ready'"
    :data-disabled="disabled ? '' : undefined"
    :data-loading="loading ? '' : undefined"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <template v-if="items.length > 0">
      <DzTreeItem
        v-for="(node, index) in items"
        :key="node.key"
        :node="node"
        :level="0"
        :pos-in-set="index + 1"
        :set-size="items.length"
      >
        <template v-if="$slots.item" #default="slotProps">
          <slot name="item" v-bind="slotProps" />
        </template>
      </DzTreeItem>
    </template>

    <!-- role="none" keeps the placeholder out of the tree's required-children
         contract (a bare listitem is not an allowed owned element of role=tree). -->
    <li v-else role="none" :class="styles.empty()">
      <slot name="empty">
        No items
      </slot>
    </li>
  </ul>
</template>
