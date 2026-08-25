<script setup lang="ts">
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
import { useAsyncOptions } from '../../composables/useAsyncOptions/index.ts'
import { useDualModel } from '../../composables/useDualModel/index.ts'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { useComponentMessages } from '../../i18n/useComponentMessages.ts'
import { cn } from '../../utilities/cn.ts'
import DzTree from '../data/DzTree.vue'
import { flattenVisibleNodes, getAdjacentKey } from '../data/treeNavigation.ts'
import DzPopover from '../overlays/DzPopover.vue'
import DzPopoverContent from '../overlays/DzPopoverContent.vue'
import DzPopoverTrigger from '../overlays/DzPopoverTrigger.vue'
import DzOptionsState from './DzOptionsState.vue'
import { treeSelectVariants } from './DzTreeSelect.variants.ts'

defineOptions({
  inheritAttrs: false,
})

/**
 * Both `v-model` and `v-model:value` (renderer contract C1).
 *
 * `v-model:value` keeps working unchanged; `v-model` is the binding every other
 * control in the catalog takes, and until now it silently did nothing here.
 *
 * `isEmpty` is `undefined`-only, which is exact for this control:
 * `TreeSelectValue` is `string | string[] | undefined`, so the only value that
 * means "the consumer did not bind the default model" is `undefined`, and an
 * explicit clear writes `[]` in multiple mode or `''` in single.
 */
const legacyValueModel = defineModel<TreeSelectValue>('value')
const primaryModel = defineModel<TreeSelectValue>({ default: undefined })
const expandedKeysModel = defineModel<string[]>('expandedKeys', { default: () => [] })
const props = withDefaults(defineProps<DzTreeSelectProps>(), {
  optionsState: undefined,
  optionsError: undefined,
  optionsRetryable: undefined,
  selectionMode: 'single',
  placeholder: undefined,
  filter: false,
  filterPlaceholder: undefined,
  noResultsText: undefined,
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

// The async-options rows are one shared group across all seven selection
// controls, so a translator writes them once (renderer contract C9).
const dzAsyncMessages = useComponentMessages('DzAsyncOptions')

/**
 * The async-options seam (renderer contract C9).
 *
 * Inert unless the host passes `optionsState`, so a control with a static
 * option array behaves exactly as it did. Every request supersedes and aborts
 * the last, so a host that fences on the signal never has two in flight.
 */
const {
  row: optionsRow,
  state: resolvedOptionsState,
  canRetry: canRetryOptions,
  announcement: optionsAnnouncement,
  request: requestOptions,
} = useAsyncOptions(
  {
    state: () => props.optionsState,
    error: () => props.optionsError,
    retryable: () => props.optionsRetryable,
    hasOptions: () => props.nodes.length > 0,
    emit: request => emit('loadOptions', request),
  },
  () => ({
    loading: dzAsyncMessages.value.loading,
    empty: dzAsyncMessages.value.empty,
    error: dzAsyncMessages.value.error,
  }),
)

function handleRetryOptions(): void {
  emit('retryOptions')
  requestOptions('open')
}
const model = useDualModel(primaryModel, legacyValueModel)
// User-visible strings, resolved against the application's catalog (ADR-20).
// An explicit prop still wins; these are the defaults that used to be literals.
const dzMessages = useComponentMessages('DzTreeSelect')
const resolvedFilterPlaceholder = computed(() => props.filterPlaceholder ?? dzMessages.value.filterPlaceholder)
const resolvedNoResultsText = computed(() => props.noResultsText ?? dzMessages.value.noResults)

const attrs = useAttrs()
const autoId = useId()
const fieldContext = useFormFieldContext()

// ── Resolved field state (mirrors DzSelect) ────────────────────────────────

const resolvedId = computed(() => props.id ?? fieldContext?.fieldId ?? autoId)
const panelId = computed(() => `${resolvedId.value}-panel`)

/** DOM id of a treeitem inside the panel — mirrors DzTree's id scheme. */
function treeItemId(key: string): string {
  return `${panelId.value}-ti-${key}`
}

const resolvedDisabled = computed(
  () => props.disabled || (fieldContext?.isDisabled.value ?? false),
)

const resolvedInvalid = computed(
  () => props.invalid || !!props.error || (fieldContext?.isInvalid.value ?? false),
)

/**
 * `required` and `loading` were both declared, defaulted, and read nowhere —
 * two props whose types told a consumer they worked (renderer contract C3).
 */
const resolvedRequired = computed(() => props.required || (fieldContext?.isRequired.value ?? false))

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

/**
 * Key of the active treeitem — the node referenced by the combobox's
 * `aria-activedescendant` and carrying the panel's roving `tabindex="0"`
 * (APG combobox-with-tree pattern). Driven from the trigger's keyboard while
 * focus stays on the combobox button.
 */
const activeKey = ref<string | undefined>(undefined)

watch(isOpen, (open) => {
  if (open) {
    // Seed the active node so ArrowDown/Up and screen readers have an anchor.
    activeKey.value = resolveInitialActiveKey()
    emit('open')
  }
  else {
    query.value = ''
    activeKey.value = undefined
    emit('close')
  }
})

function openPanel(): void {
  if (resolvedDisabled.value)
    return
  isOpen.value = true
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
 * Apply the active selection mode's rules to a single toggled node key. Shared
 * by the pointer path (DzTree's controlled selectedKeys diff) and the keyboard
 * path (Enter/Space on the active node) so both reach identical state.
 */
function commitNode(key: string): void {
  if (resolvedDisabled.value || props.readonly)
    return

  const node = findNode(key)
  if (!node || node.disabled)
    return

  if (props.selectionMode === 'single') {
    model.value = key
    emit('select', node)
    emit('change', key)
    isOpen.value = false
    return
  }

  if (props.selectionMode === 'multiple') {
    const set = new Set(treeSelectedKeys.value)
    if (set.has(key))
      set.delete(key)
    else set.add(key)
    const next = Array.from(set)
    model.value = next
    emit('select', node)
    emit('change', next)
    return
  }

  // checkbox
  const next = applyCheckboxPropagation(key)
  model.value = next
  emit('select', node)
  emit('change', next)
}

/**
 * DzTree (controlled) proposes a new selectedKeys array on each toggle. We
 * diff it against the current selection to recover the single toggled key,
 * then hand it to {@link commitNode}.
 */
function onTreeSelectedKeysChange(proposedRaw: unknown): void {
  const proposed = proposedRaw as string[]
  const current = treeSelectedKeys.value
  const added = proposed.filter(k => !current.includes(k))
  const removed = current.filter(k => !proposed.includes(k))
  const clickedKey = added[0] ?? removed[0]
  if (clickedKey === undefined)
    return
  commitNode(clickedKey)
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

// ── Combobox keyboard navigation (APG combobox-with-tree) ────────────────────

/** Currently visible tree nodes, in DOM order, for activedescendant movement. */
const visibleNodes = computed(() =>
  flattenVisibleNodes(displayNodes.value, new Set(effectiveExpandedKeys.value)),
)

/** DOM id referenced by the trigger's aria-activedescendant while open. */
const activeDescendantId = computed(() =>
  isOpen.value && activeKey.value !== undefined
    ? treeItemId(activeKey.value)
    : undefined,
)

/** First focusable node, preferring the current selection when visible. */
function resolveInitialActiveKey(): string | undefined {
  const selected = treeSelectedKeys.value.find(key =>
    visibleNodes.value.some(n => n.key === key && !n.disabled),
  )
  if (selected !== undefined)
    return selected
  return getAdjacentKey(visibleNodes.value, undefined, 'down')
}

function moveActive(direction: 'up' | 'down' | 'first' | 'last'): void {
  const next = getAdjacentKey(visibleNodes.value, activeKey.value, direction)
  if (next !== undefined)
    activeKey.value = next
}

function setExpanded(key: string, expanded: boolean): void {
  // While filtering, expansion is derived (every branch auto-expanded), so the
  // model is intentionally untouched.
  if (filterActive.value)
    return
  const has = expandedKeysModel.value.includes(key)
  if (expanded === has)
    return
  const next = expanded
    ? [...expandedKeysModel.value, key]
    : expandedKeysModel.value.filter(k => k !== key)
  expandedKeysModel.value = next
  emit('update:expandedKeys', next)
}

/** ArrowRight: expand the active branch, else step into its first child. */
function expandOrEnter(): void {
  const entry = visibleNodes.value.find(n => n.key === activeKey.value)
  if (!entry || !entry.hasChildren)
    return
  if (!entry.expanded) {
    setExpanded(entry.key, true)
    return
  }
  // Already expanded → move to first child (the next visible row).
  moveActive('down')
}

/** ArrowLeft: collapse the active branch, else step out to its parent. */
function collapseOrExit(): void {
  const entry = visibleNodes.value.find(n => n.key === activeKey.value)
  if (!entry)
    return
  if (entry.hasChildren && entry.expanded) {
    setExpanded(entry.key, false)
    return
  }
  const parentKey = activeKey.value
    ? nodeIndex.value.get(activeKey.value)?.parentKey
    : undefined
  if (parentKey !== undefined)
    activeKey.value = parentKey
}

/**
 * Combobox trigger key handling. While closed, ArrowDown/ArrowUp open the
 * panel; while open they drive the active treeitem (exposed via
 * aria-activedescendant) without moving DOM focus off the trigger.
 */
function handleTriggerKeydown(event: KeyboardEvent): void {
  if (resolvedDisabled.value)
    return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (!isOpen.value)
        openPanel()
      else moveActive('down')
      break
    case 'ArrowUp':
      event.preventDefault()
      if (!isOpen.value)
        openPanel()
      else moveActive('up')
      break
    case 'Home':
      if (isOpen.value) {
        event.preventDefault()
        moveActive('first')
      }
      break
    case 'End':
      if (isOpen.value) {
        event.preventDefault()
        moveActive('last')
      }
      break
    case 'ArrowRight':
      if (isOpen.value) {
        event.preventDefault()
        expandOrEnter()
      }
      break
    case 'ArrowLeft':
      if (isOpen.value) {
        event.preventDefault()
        collapseOrExit()
      }
      break
    case 'Enter':
    case ' ':
      if (isOpen.value && activeKey.value !== undefined) {
        event.preventDefault()
        commitNode(activeKey.value)
      }
      break
  }
}

// Keep the active node valid as the visible set changes (e.g. while filtering)
// and seed it on first render when the panel starts open (`defaultOpen`).
watch(visibleNodes, (nodes) => {
  if (!isOpen.value)
    return
  if (
    activeKey.value === undefined
    || !nodes.some(n => n.key === activeKey.value && !n.disabled)
  ) {
    activeKey.value = resolveInitialActiveKey()
  }
}, { immediate: true })

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
          :aria-activedescendant="activeDescendantId"
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
          :data-required="resolvedRequired ? '' : undefined"
          :data-loading="loading ? '' : undefined"
          :aria-required="resolvedRequired || undefined"
          :aria-busy="loading || undefined"
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
            :placeholder="resolvedFilterPlaceholder"
            :class="styles.searchInput()"
            role="searchbox"
            :aria-label="dzMessages.filterOptions"
            data-dz-tree-search
            @input="handleSearchInput"
          >
        </div>

        <!--

          One row instead of the list while the host is loading, has nothing, or

          failed (renderer contract C9). `optionsRow` is null whenever the control

          is static, so a control with a plain option array renders none of this.

        -->

        <DzOptionsState

          v-if="optionsRow !== null"

          :state="resolvedOptionsState"

          :message="optionsAnnouncement"

          :can-retry="canRetryOptions"

          @retry="handleRetryOptions"
        />

        <DzTree
          v-else-if="displayNodes.length > 0"
          :id="panelId"
          :items="displayNodes"
          :size="size"
          selectable
          :selected-keys="treeSelectedKeys"
          :expanded-keys="effectiveExpandedKeys"
          :active-key="activeKey"
          :aria-label="ariaLabel"
          @update:selected-keys="onTreeSelectedKeysChange"
          @update:expanded-keys="onExpandedKeysChange"
          @update:active-key="(key: unknown) => (activeKey = key as string | undefined)"
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
            {{ filterActive ? resolvedNoResultsText : 'No options available' }}
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
