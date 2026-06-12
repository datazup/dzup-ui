<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

import type {
  DzTreeSelectEmits,
  DzTreeSelectProps,
  DzTreeSelectSlots,
  TreeNode,
  TreeSelectValue,
} from './DzTreeSelect.types.ts'
import { Check, ChevronDown, Minus, X } from 'lucide-vue-next'
/**
 * DzTreeSelect -- a form select whose overlay panel is a DzTree (TASK-NF-04).
 *
 * Composes DzPopover (overlay) + DzTree (panel) + a DzSelect-styled trigger
 * rather than reimplementing tree or overlay logic. Supports `single`,
 * `multiple`, and `checkbox` selection (with parent/child propagation and
 * indeterminate state).
 *
 * v-model:value + v-model:expandedKeys via defineModel (ADR-16).
 * Combobox a11y pattern: role="combobox" trigger controlling a role="tree"
 * panel (supplied by DzTree).
 *
 * @example
 * ```vue
 * <DzTreeSelect
 *   v-model:value="selected"
 *   :nodes="categories"
 *   selection-mode="checkbox"
 *   filter
 *   placeholder="Pick categories"
 * />
 * ```
 */
import { computed, ref, useAttrs, useId, watch } from 'vue'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { cn } from '../../utilities/cn.ts'
import DzTree from '../data/DzTree.vue'
import DzPopover from '../overlays/DzPopover.vue'
import DzPopoverContent from '../overlays/DzPopoverContent.vue'
import DzPopoverTrigger from '../overlays/DzPopoverTrigger.vue'
import { treeSelectVariants } from './DzTreeSelect.variants.ts'

const model = defineModel<TreeSelectValue>('value')
const expandedKeysModel = defineModel<string[]>('expandedKeys', { default: () => [] })

const props = withDefaults(defineProps<DzTreeSelectProps>(), {
  selectionMode: 'single',
  placeholder: undefined,
  filter: false,
  filterPlaceholder: 'Search...',
  noResultsText: 'No results found',
  defaultOpen: false,
  disabled: false,
  readonly: false,
  size: 'md',
  variant: 'outline',
  name: undefined,
  invalid: false,
  error: undefined,
  required: false,
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzTreeSelectEmits>()
const slots = defineSlots<DzTreeSelectSlots>()

const attrs = useAttrs()
const autoId = useId()
const fieldContext = useFormFieldContext()

// ── Resolved field state (mirrors DzSelect) ────────────────────────────────

const resolvedId = computed(() => props.id ?? fieldContext?.fieldId ?? autoId)
const panelId = computed(() => `${resolvedId.value}-panel`)

const resolvedDisabled = computed(
  () => props.disabled || (fieldContext?.isDisabled.value ?? false),
)

const resolvedInvalid = computed(
  () => props.invalid || !!props.error || (fieldContext?.isInvalid.value ?? false),
)

const errorId = computed(() => (props.error ? `${resolvedId.value}-error` : undefined))

const resolvedAriaDescribedby = computed(() => {
  const parts: string[] = []
  if (props.ariaDescribedby)
    parts.push(props.ariaDescribedby)
  if (errorId.value)
    parts.push(errorId.value)
  if (fieldContext?.ariaDescribedby.value)
    parts.push(fieldContext.ariaDescribedby.value)
  return parts.length > 0 ? parts.join(' ') : undefined
})

const styles = computed(() =>
  treeSelectVariants({
    variant: props.variant,
    size: props.size,
    invalid: resolvedInvalid.value || undefined,
  }),
)

// ── Open state ─────────────────────────────────────────────────────────────

const isOpen = ref(props.defaultOpen)
const query = ref('')

watch(isOpen, (open) => {
  if (open) {
    emit('open')
  }
  else {
    query.value = ''
    emit('close')
  }
})

function openPanel(): void {
  if (resolvedDisabled.value)
    return
  isOpen.value = true
}

function handleTriggerKeydown(event: KeyboardEvent): void {
  if (event.key === 'ArrowDown' && !isOpen.value) {
    event.preventDefault()
    openPanel()
  }
}

// ── Node index (parent/child/ancestor lookup for propagation) ───────────────

interface NodeMeta {
  node: TreeNode
  parentKey?: string
  childKeys: string[]
  descendantKeys: string[]
  ancestorKeys: string[]
}

const nodeIndex = computed(() => {
  const map = new Map<string, NodeMeta>()

  function walk(nodes: TreeNode[], ancestors: string[], parentKey?: string): void {
    for (const node of nodes) {
      const childKeys = (node.children ?? []).map(c => c.key)
      map.set(node.key, {
        node,
        parentKey,
        childKeys,
        descendantKeys: [],
        ancestorKeys: ancestors,
      })
      if (node.children?.length)
        walk(node.children, [...ancestors, node.key], node.key)
    }
  }
  walk(props.nodes, [])

  function collectDescendants(key: string): string[] {
    const meta = map.get(key)
    if (!meta)
      return []
    const acc: string[] = []
    for (const child of meta.childKeys)
      acc.push(child, ...collectDescendants(child))
    return acc
  }
  for (const meta of map.values())
    meta.descendantKeys = collectDescendants(meta.node.key)

  return map
})

function findNode(key: string): TreeNode | undefined {
  return nodeIndex.value.get(key)?.node
}

// ── Selection model ─────────────────────────────────────────────────────────

/** Keys handed to DzTree for highlight (single → wrapped, multi → as-is). */
const treeSelectedKeys = computed<string[]>(() => {
  if (props.selectionMode === 'single')
    return typeof model.value === 'string' && model.value ? [model.value] : []
  return Array.isArray(model.value) ? model.value : []
})

const checkedSet = computed(() => new Set(treeSelectedKeys.value))

/** A node is indeterminate when unchecked but some descendant is checked. */
function isIndeterminate(key: string): boolean {
  if (checkedSet.value.has(key))
    return false
  const meta = nodeIndex.value.get(key)
  if (!meta)
    return false
  return meta.descendantKeys.some(d => checkedSet.value.has(d))
}

function checkboxState(key: string): 'checked' | 'indeterminate' | 'unchecked' {
  if (checkedSet.value.has(key))
    return 'checked'
  return isIndeterminate(key) ? 'indeterminate' : 'unchecked'
}

/** Apply parent/child propagation around a toggled node, return new keys. */
function applyCheckboxPropagation(toggledKey: string): string[] {
  const set = new Set(treeSelectedKeys.value)
  const meta = nodeIndex.value.get(toggledKey)
  const target = !set.has(toggledKey)

  // Self + all descendants follow the target state.
  const affected = [toggledKey, ...(meta?.descendantKeys ?? [])]
  for (const key of affected) {
    if (target)
      set.add(key)
    else set.delete(key)
  }

  // Recompute ancestors bottom-up: a parent is checked iff every child is.
  const ancestors = [...(meta?.ancestorKeys ?? [])].reverse()
  for (const ancestorKey of ancestors) {
    const childKeys = nodeIndex.value.get(ancestorKey)?.childKeys ?? []
    const allChecked = childKeys.length > 0 && childKeys.every(c => set.has(c))
    if (allChecked)
      set.add(ancestorKey)
    else set.delete(ancestorKey)
  }

  return Array.from(set)
}

/**
 * DzTree (controlled) proposes a new selectedKeys array on each toggle. We
 * diff it against the current selection to recover the single toggled key,
 * then apply the active mode's rules.
 */
function onTreeSelectedKeysChange(proposedRaw: unknown): void {
  if (resolvedDisabled.value || props.readonly)
    return

  const proposed = proposedRaw as string[]
  const current = treeSelectedKeys.value
  const added = proposed.filter(k => !current.includes(k))
  const removed = current.filter(k => !proposed.includes(k))
  const clickedKey = added[0] ?? removed[0]
  if (clickedKey === undefined)
    return

  const node = findNode(clickedKey)
  if (!node || node.disabled)
    return

  if (props.selectionMode === 'single') {
    model.value = clickedKey
    emit('select', node)
    emit('change', clickedKey)
    isOpen.value = false
    return
  }

  if (props.selectionMode === 'multiple') {
    model.value = proposed
    emit('select', node)
    emit('change', proposed)
    return
  }

  // checkbox
  const next = applyCheckboxPropagation(clickedKey)
  model.value = next
  emit('select', node)
  emit('change', next)
}

// ── Filter / pruning ─────────────────────────────────────────────────────────

const filterActive = computed(() => props.filter && query.value.trim().length > 0)

function pruneTree(nodes: TreeNode[], q: string): TreeNode[] {
  const result: TreeNode[] = []
  for (const node of nodes) {
    const selfMatch = node.label.toLowerCase().includes(q)
    const matchedChildren = node.children ? pruneTree(node.children, q) : []
    if (selfMatch || matchedChildren.length > 0) {
      result.push({
        ...node,
        children: matchedChildren.length > 0
          ? matchedChildren
          : (selfMatch ? node.children : undefined),
      })
    }
  }
  return result
}

const displayNodes = computed<TreeNode[]>(() => {
  if (!filterActive.value)
    return props.nodes
  return pruneTree(props.nodes, query.value.trim().toLowerCase())
})

function collectExpandable(nodes: TreeNode[]): string[] {
  const acc: string[] = []
  for (const node of nodes) {
    if (node.children?.length) {
      acc.push(node.key)
      acc.push(...collectExpandable(node.children))
    }
  }
  return acc
}

/** When filtering, every branch with matches is auto-expanded. */
const effectiveExpandedKeys = computed<string[]>(() =>
  filterActive.value ? collectExpandable(displayNodes.value) : expandedKeysModel.value,
)

function onExpandedKeysChange(keysRaw: unknown): void {
  if (filterActive.value)
    return
  const keys = keysRaw as string[]
  expandedKeysModel.value = keys
  emit('update:expandedKeys', keys)
}

// ── Trigger display ──────────────────────────────────────────────────────────

const selectedNodes = computed<TreeNode[]>(() =>
  treeSelectedKeys.value
    .map(key => findNode(key))
    .filter((n): n is TreeNode => n !== undefined),
)

const isMultiple = computed(() => props.selectionMode !== 'single')
const hasSelection = computed(() => selectedNodes.value.length > 0)
const needsItemSlot = computed(() => props.selectionMode === 'checkbox' || !!slots.node)

function removeValue(key: string): void {
  if (resolvedDisabled.value || props.readonly)
    return
  const node = findNode(key)
  if (props.selectionMode === 'checkbox') {
    // Uncheck the chip's node (and its descendants) with propagation.
    const next = checkedSet.value.has(key)
      ? applyCheckboxPropagation(key)
      : treeSelectedKeys.value.filter(k => k !== key)
    model.value = next
    emit('change', next)
  }
  else {
    const next = treeSelectedKeys.value.filter(k => k !== key)
    model.value = next
    emit('change', next)
  }
  if (node)
    emit('select', node)
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}

function handleSearchInput(event: Event): void {
  query.value = (event.target as HTMLInputElement).value
}

const triggerClasses = computed(() =>
  cn(styles.value.trigger(), attrs.class as string | undefined),
)
</script>

<template>
  <div>
    <DzPopover v-model:open="isOpen">
      <DzPopoverTrigger>
        <button
          :id="resolvedId"
          type="button"
          role="combobox"
          aria-haspopup="tree"
          :aria-expanded="isOpen"
          :aria-controls="panelId"
          :aria-label="ariaLabel"
          :aria-labelledby="ariaLabelledby"
          :aria-describedby="resolvedAriaDescribedby"
          :aria-invalid="ariaInvalid ?? (resolvedInvalid || undefined)"
          :disabled="resolvedDisabled"
          :class="triggerClasses"
          :data-state="resolvedDisabled ? 'disabled' : (isOpen ? 'open' : 'idle')"
          :data-disabled="resolvedDisabled ? '' : undefined"
          :data-invalid="resolvedInvalid ? '' : undefined"
          :data-readonly="readonly ? '' : undefined"
          style="contain: layout style"
          v-bind="{ ...$attrs, class: undefined }"
          @keydown="handleTriggerKeydown"
          @focus="handleFocus"
          @blur="handleBlur"
        >
          <span :class="styles.value()">
            <slot name="value" :selected-nodes="selectedNodes" :placeholder="placeholder">
              <template v-if="!hasSelection">
                <span :class="styles.placeholder()">{{ placeholder }}</span>
              </template>
              <template v-else-if="isMultiple">
                <span
                  v-for="node in selectedNodes"
                  :key="node.key"
                  :class="styles.chip()"
                >
                  <span :class="styles.chipLabel()">{{ node.label }}</span>
                  <span
                    :class="styles.chipClose()"
                    role="button"
                    tabindex="-1"
                    :aria-label="`Remove ${node.label}`"
                    @click.stop="removeValue(node.key)"
                    @keydown.enter.stop.prevent="removeValue(node.key)"
                  >
                    <X class="h-3 w-3" aria-hidden="true" />
                  </span>
                </span>
              </template>
              <template v-else>
                <span :class="styles.singleValue()">{{ selectedNodes[0]?.label }}</span>
              </template>
            </slot>
          </span>
          <ChevronDown :class="styles.icon()" aria-hidden="true" />
        </button>
      </DzPopoverTrigger>

      <DzPopoverContent
        :arrow="false"
        align="start"
        :side-offset="4"
        :class="styles.panel()"
      >
        <div
          v-if="filter"
          :class="styles.searchWrapper()"
        >
          <input
            type="text"
            :value="query"
            :placeholder="filterPlaceholder"
            :class="styles.searchInput()"
            role="searchbox"
            aria-label="Filter options"
            data-dz-tree-search
            @input="handleSearchInput"
          >
        </div>

        <DzTree
          v-if="displayNodes.length > 0"
          :id="panelId"
          :items="displayNodes"
          :size="size"
          selectable
          :selected-keys="treeSelectedKeys"
          :expanded-keys="effectiveExpandedKeys"
          :aria-label="ariaLabel"
          @update:selected-keys="onTreeSelectedKeysChange"
          @update:expanded-keys="onExpandedKeysChange"
        >
          <template v-if="needsItemSlot" #item="{ node, level, expanded, selected }">
            <span
              v-if="selectionMode === 'checkbox'"
              :class="styles.checkbox()"
              :data-state="checkboxState(node.key)"
              role="presentation"
            >
              <Check
                v-if="checkboxState(node.key) === 'checked'"
                :class="styles.checkIcon()"
                aria-hidden="true"
              />
              <Minus
                v-else-if="checkboxState(node.key) === 'indeterminate'"
                :class="styles.checkIcon()"
                aria-hidden="true"
              />
            </span>
            <slot
              name="node"
              :node="node"
              :level="level"
              :expanded="expanded"
              :selected="selected"
              :indeterminate="isIndeterminate(node.key)"
            >
              <span :class="styles.nodeLabel()">{{ node.label }}</span>
            </slot>
          </template>
        </DzTree>

        <div v-else :class="styles.empty()" data-dz-tree-empty>
          <slot name="empty">
            {{ filterActive ? noResultsText : 'No options available' }}
          </slot>
        </div>
      </DzPopoverContent>
    </DzPopover>

    <!-- Error message -->
    <p
      v-if="error"
      :id="errorId"
      class="mt-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)] text-[var(--dz-danger)]"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>
