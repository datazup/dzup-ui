<script setup lang="ts">
import type {
  DzTreeContext,
  DzTreeEmits,
  DzTreeProps,
  DzTreeSlots,
  TreeNode,
} from './DzTree.types.ts'
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
import { computed, provide, toRef, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_TREE_KEY } from './DzTree.types.ts'
import { treeVariants } from './DzTree.variants.ts'
import DzTreeItem from './DzTreeItem.vue'

const expandedKeys = defineModel<string[]>('expandedKeys', { default: () => [] })

const selectedKeys = defineModel<string[]>('selectedKeys', { default: () => [] })

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
  size: toRef(() => props.size),
  expandedKeys,
  selectedKeys,
  selectable: toRef(() => props.selectable),
  checkable: toRef(() => props.checkable),
  toggleExpand,
  toggleSelect,
}

provide(DZ_TREE_KEY, context)

const styles = computed(() => treeVariants({ size: props.size }))

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <ul
    :id="id"
    role="tree"
    :class="rootClasses"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    :data-disabled="disabled ? '' : undefined"
    :data-loading="loading ? '' : undefined"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <template v-if="items.length > 0">
      <DzTreeItem
        v-for="node in items"
        :key="node.key"
        :node="node"
        :level="0"
      >
        <template v-if="$slots.item" #default="slotProps">
          <slot name="item" v-bind="slotProps" />
        </template>
      </DzTreeItem>
    </template>

    <li v-else :class="styles.empty()">
      <slot name="empty">
        No items
      </slot>
    </li>
  </ul>
</template>
