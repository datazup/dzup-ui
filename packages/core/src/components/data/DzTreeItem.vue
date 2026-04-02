<script setup lang="ts">
import type { DzTreeItemProps, DzTreeItemSlots, TreeNode } from './DzTree.types.ts'
/**
 * DzTreeItem — Single node in a DzTree hierarchy.
 *
 * Injects context from parent DzTree via DZ_TREE_KEY (ADR-08).
 * Recursively renders children for nested tree structures.
 */
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_TREE_KEY } from './DzTree.types.ts'
import { treeVariants } from './DzTree.variants.ts'

const props = withDefaults(defineProps<DzTreeItemProps>(), {
  level: 0,
})

defineSlots<DzTreeItemSlots>()

const attrs = useAttrs()
const treeContext = inject(DZ_TREE_KEY, null)

const hasChildren = computed(() =>
  Array.isArray(props.node.children) && props.node.children.length > 0,
)

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
  ),
)

function handleClick(node: TreeNode): void {
  if (node.disabled)
    return

  if (hasChildren.value) {
    treeContext?.toggleExpand(node.key)
  }

  if (treeContext?.selectable.value) {
    treeContext.toggleSelect(node.key)
  }
}

function handleKeydown(event: KeyboardEvent, node: TreeNode): void {
  if (node.disabled)
    return

  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      handleClick(node)
      break
    case 'ArrowRight':
      if (hasChildren.value && !isExpanded.value) {
        event.preventDefault()
        treeContext?.toggleExpand(node.key)
      }
      break
    case 'ArrowLeft':
      if (hasChildren.value && isExpanded.value) {
        event.preventDefault()
        treeContext?.toggleExpand(node.key)
      }
      break
  }
}
</script>

<script lang="ts">
export default {
  name: 'DzTreeItem',
  inheritAttrs: false,
}
</script>

<template>
  <li
    role="treeitem"
    :aria-expanded="hasChildren ? isExpanded : undefined"
    :aria-selected="treeContext?.selectable.value ? isSelected : undefined"
    :aria-disabled="node.disabled || undefined"
    :data-state="isExpanded ? 'open' : 'closed'"
    :data-disabled="node.disabled ? '' : undefined"
  >
    <div
      :class="itemClasses"
      :tabindex="node.disabled ? -1 : 0"
      v-bind="{ ...$attrs, class: undefined }"
      @click="handleClick(node)"
      @keydown="handleKeydown($event, node)"
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
        :class="cn(styles.expandIcon(), isExpanded ? styles.expandIconOpen() : '')"
        aria-hidden="true"
      >
        <polyline points="9 6 15 12 9 18" />
      </svg>
      <span v-else :class="styles.expandIcon()" aria-hidden="true" />

      <!-- Checkbox (if checkable) -->
      <span
        v-if="treeContext?.checkable.value"
        :class="styles.checkbox()"
        :data-state="isSelected ? 'checked' : 'unchecked'"
        role="checkbox"
        :aria-checked="isSelected"
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
        <span :class="styles.nodeContent()">{{ node.label }}</span>
      </slot>
    </div>

    <!-- Recursive children -->
    <ul
      v-if="hasChildren && isExpanded"
      role="group"
      :class="styles.children()"
    >
      <DzTreeItem
        v-for="child in node.children"
        :key="child.key"
        :node="child"
        :level="level + 1"
      >
        <template v-if="$slots.default" #default="slotProps">
          <slot v-bind="slotProps" />
        </template>
      </DzTreeItem>
    </ul>
  </li>
</template>
