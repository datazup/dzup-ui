<script setup lang="ts">
import type { DzTreeItemProps, DzTreeItemSlots, TreeNode } from './DzTree.types.ts'
/**
 * DzTreeItem — Single node in a DzTree hierarchy.
 *
 * Injects context from parent DzTree via DZ_TREE_KEY (ADR-08).
 * Recursively renders children for nested tree structures.
 */
import { computed, inject, useAttrs } from 'vue'
import { useDzTestIds } from '../../composables/provider/useDzEnvironment.ts'
import { useDzDirection } from '../../composables/provider/useDzLocale.ts'
import { cn } from '../../utilities/cn.ts'
import { DZ_TREE_KEY } from './DzTree.types.ts'
import { treeVariants } from './DzTree.variants.ts'

defineOptions({
  name: 'DzTreeItem',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzTreeItemProps>(), {
  level: 0,
  posInSet: undefined,
  setSize: undefined,
})

defineSlots<DzTreeItemSlots>()

// ArrowLeft and ArrowRight follow the writing direction (ADR-20 §4,
// TASK-R5-O3). This component declares `rtl: { keyboard: 'swap-horizontal' }`
// in its anatomy; until now nothing read the context that makes it true.
const dzDirection = useDzDirection()

const attrs = useAttrs()
const treeContext = inject(DZ_TREE_KEY, null)

const hasChildren = computed(() =>
  Array.isArray(props.node.children) && props.node.children.length > 0,
)

/** Stable DOM id so a composing combobox can target this node. */
const itemId = computed(() => treeContext?.itemId(props.node.key))

/** 1-based depth exposed to assistive tech via aria-level. */
const ariaLevel = computed(() => props.level + 1)

/**
 * Roving tabindex (APG): exactly one treeitem in the tree is `0`, the rest are
 * `-1`. Disabled nodes are never the tab stop.
 */
const rowTabindex = computed(() => {
  if (props.node.disabled)
    return -1
  if (!treeContext)
    return 0
  return treeContext.tabbableKey.value === props.node.key ? 0 : -1
})

const isExpanded = computed(() =>
  treeContext?.expandedKeys.value.includes(props.node.key) ?? false,
)

const isSelected = computed(() =>
  treeContext?.selectedKeys.value.includes(props.node.key) ?? false,
)

const styles = computed(() =>
  treeVariants({ size: treeContext?.size.value ?? 'md' }),
)

const itemClasses = computed(() =>
  cn(
    styles.value.item(),
    isSelected.value ? styles.value.itemSelected() : '',
    attrs.class as string | undefined,
    props.ui?.item,
  ),
)

function handleClick(node: TreeNode): void {
  if (node.disabled)
    return

  // Row-click semantics: in a selectable tree the row selects the node (the
  // chevron is the sole expand affordance — see handleToggleExpand). In a
  // plain (non-selectable) tree the row toggles expansion so the tree is still
  // navigable by pointer.
  if (treeContext?.selectable.value) {
    treeContext.toggleSelect(node.key)
  }
  else if (hasChildren.value) {
    treeContext?.toggleExpand(node.key)
  }
}

/**
 * Expand/collapse toggle bound to the chevron. Stops propagation so it never
 * reaches the row's select/commit handler (which, in a single-select
 * DzTreeSelect, would close the overlay). Keyboard parity is provided by the
 * ArrowRight/ArrowLeft branches of handleKeydown, reaching the same end state.
 */
function handleToggleExpand(node: TreeNode): void {
  if (node.disabled)
    return

  treeContext?.toggleExpand(node.key)
}

function handleKeydown(event: KeyboardEvent, node: TreeNode): void {
  if (node.disabled)
    return

  // APG's tree pattern is stated on the inline axis, not on physical keys: in
  // an RTL tree ArrowLeft expands and ArrowRight collapses (ADR-20 §4,
  // TASK-R5-O3).
  const expandKey = dzDirection.value === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
  const collapseKey = dzDirection.value === 'rtl' ? 'ArrowRight' : 'ArrowLeft'

  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      handleClick(node)
      break
    case 'ArrowDown':
      event.preventDefault()
      treeContext?.navigate(node.key, 'down')
      break
    case 'ArrowUp':
      event.preventDefault()
      treeContext?.navigate(node.key, 'up')
      break
    case 'Home':
      event.preventDefault()
      treeContext?.navigate(node.key, 'first')
      break
    case 'End':
      event.preventDefault()
      treeContext?.navigate(node.key, 'last')
      break
    case expandKey:
      // APG: collapsed branch → expand it; expanded branch → step into the
      // first child; leaf → no-op.
      if (hasChildren.value) {
        event.preventDefault()
        if (isExpanded.value)
          treeContext?.navigateToChild(node.key)
        else
          treeContext?.toggleExpand(node.key)
      }
      break
    case collapseKey:
      // APG: expanded branch → collapse it; otherwise → step out to the parent.
      event.preventDefault()
      if (hasChildren.value && isExpanded.value)
        treeContext?.toggleExpand(node.key)
      else
        treeContext?.navigateToParent(node.key)
      break
  }
}

/** Sync the roving tabindex to whichever node the user focuses. */
function handleRowFocus(node: TreeNode): void {
  if (node.disabled)
    return
  treeContext?.setActiveKey(node.key)
}

// Stable test hooks, off unless a host enables them (ADR-20 §8, TASK-R5-O3).
const { testId: dzTestId } = useDzTestIds()
</script>

<template>
  <li
    :id="itemId"
    data-part="root"
    v-bind="dzTestId('dz-tree-item')"
    :class="cn(props.ui?.root)"
    role="treeitem"
    :aria-level="ariaLevel"
    :aria-posinset="posInSet"
    :aria-setsize="setSize"
    :aria-expanded="hasChildren ? isExpanded : undefined"
    :aria-selected="treeContext?.selectable.value ? isSelected : undefined"
    :aria-disabled="node.disabled || undefined"
    :data-state="isExpanded ? 'open' : 'closed'"
    :data-disabled="node.disabled ? '' : undefined"
  >
    <div
      data-part="item"
      :class="itemClasses"
      :tabindex="rowTabindex"
      data-dz-tree-row
      v-bind="{ ...$attrs, class: undefined }"
      @click="handleClick(node)"
      @keydown="handleKeydown($event, node)"
      @focus="handleRowFocus(node)"
    >
      <!-- Expand/collapse indicator -->
      <svg
        v-if="hasChildren"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        data-part="indicator"
        :class="cn(styles.expandIcon(), isExpanded ? styles.expandIconOpen() : '', props.ui?.indicator)"
        data-dz-tree-toggle
        aria-hidden="true"
        @click.stop="handleToggleExpand(node)"
      >
        <polyline points="9 6 15 12 9 18" />
      </svg>
      <span v-else data-part="indicator" :class="cn(styles.expandIcon(), props.ui?.indicator)" aria-hidden="true" />

      <!-- Checkbox (if checkable). aria-label names the toggle (the visual box
           carries no text of its own) so it satisfies aria-toggle-field-name. -->
      <span
        v-if="treeContext?.checkable.value"
        data-part="control"
        :class="cn(styles.checkbox(), props.ui?.control)"
        :data-state="isSelected ? 'checked' : 'unchecked'"
        role="checkbox"
        :aria-checked="isSelected"
        :aria-label="node.label"
      />

      <!-- Node icon -->
      <component
        :is="node.icon"
        v-if="node.icon"
        class="h-4 w-4 shrink-0"
        aria-hidden="true"
      />

      <!-- Node content -->
      <slot :node="node" :level="level" :expanded="isExpanded" :selected="isSelected">
        <span data-part="item-label" :class="cn(styles.nodeContent(), props.ui?.['item-label'])">{{ node.label }}</span>
      </slot>
    </div>

    <!-- Recursive children -->
    <ul
      v-if="hasChildren && isExpanded"
      data-part="group"
      role="group"
      :class="cn(styles.children(), props.ui?.group)"
    >
      <DzTreeItem
        v-for="(child, index) in node.children"
        :key="child.key"
        :node="child"
        :level="level + 1"
        :pos-in-set="index + 1"
        :set-size="node.children!.length"
      >
        <template v-if="$slots.default" #default="slotProps">
          <slot v-bind="slotProps" />
        </template>
      </DzTreeItem>
    </ul>
  </li>
</template>
