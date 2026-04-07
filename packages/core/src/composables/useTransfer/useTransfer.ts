/**
 * useTransfer — Composable for dual-list transfer logic.
 *
 * Extracted from DzTransfer.vue to keep the component under 300 lines.
 * Manages source/target filtering, selection toggling, and item movement.
 *
 * @module @dzup-ui/core/composables/useTransfer
 */

import type { ComputedRef, Ref } from 'vue'
import type { TransferItem } from '../../components/forms/DzTransfer.types.ts'
import { computed, ref } from 'vue'

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

/** Options for the useTransfer composable */
export interface UseTransferOptions {
  /** All available source items */
  source: Ref<TransferItem[]>
  /** Model value: array of keys currently in the target list */
  modelValue: Ref<string[]>
  /** Whether search is enabled */
  searchable: Ref<boolean>
}

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

/** Return value of the useTransfer composable */
export interface UseTransferReturn {
  /** Search query for source list */
  sourceSearch: Ref<string>
  /** Search query for target list */
  targetSearch: Ref<string>
  /** Set of selected keys in source list */
  sourceSelected: Ref<Set<string>>
  /** Set of selected keys in target list */
  targetSelected: Ref<Set<string>>
  /** Source items (those NOT in model) */
  sourceItems: ComputedRef<TransferItem[]>
  /** Target items (those IN model) */
  targetItems: ComputedRef<TransferItem[]>
  /** Filtered source items by search */
  filteredSourceItems: ComputedRef<TransferItem[]>
  /** Filtered target items by search */
  filteredTargetItems: ComputedRef<TransferItem[]>
  /** Toggle selection of a source item */
  toggleSourceItem: (item: TransferItem) => void
  /** Toggle selection of a target item */
  toggleTargetItem: (item: TransferItem) => void
  /** Move selected source items to target, returns new model value */
  moveToTarget: () => string[]
  /** Move selected target items back to source, returns new model value */
  moveToSource: () => string[]
}

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

/**
 * Manages dual-list transfer state and operations.
 */
export function useTransfer(options: UseTransferOptions): UseTransferReturn {
  const { source, modelValue } = options

  const sourceSearch = ref('')
  const targetSearch = ref('')
  const sourceSelected = ref<Set<string>>(new Set())
  const targetSelected = ref<Set<string>>(new Set())

  /** Source items: those NOT in model (not transferred) */
  const sourceItems = computed(() =>
    source.value.filter(item => !modelValue.value.includes(item.key)),
  )

  /** Target items: those IN model (transferred) */
  const targetItems = computed(() =>
    source.value.filter(item => modelValue.value.includes(item.key)),
  )

  /** Filtered source items by search */
  const filteredSourceItems = computed(() => {
    if (!sourceSearch.value)
      return sourceItems.value
    const q = sourceSearch.value.toLowerCase()
    return sourceItems.value.filter(item =>
      item.label.toLowerCase().includes(q),
    )
  })

  /** Filtered target items by search */
  const filteredTargetItems = computed(() => {
    if (!targetSearch.value)
      return targetItems.value
    const q = targetSearch.value.toLowerCase()
    return targetItems.value.filter(item =>
      item.label.toLowerCase().includes(q),
    )
  })

  function toggleSourceItem(item: TransferItem): void {
    if (item.disabled)
      return
    const set = new Set(sourceSelected.value)
    if (set.has(item.key)) {
      set.delete(item.key)
    }
    else {
      set.add(item.key)
    }
    sourceSelected.value = set
  }

  function toggleTargetItem(item: TransferItem): void {
    if (item.disabled)
      return
    const set = new Set(targetSelected.value)
    if (set.has(item.key)) {
      set.delete(item.key)
    }
    else {
      set.add(item.key)
    }
    targetSelected.value = set
  }

  /** Move selected source items to target. Returns new model value. */
  function moveToTarget(): string[] {
    const newModel = [...modelValue.value, ...sourceSelected.value]
    sourceSelected.value = new Set()
    return newModel
  }

  /** Move selected target items back to source. Returns new model value. */
  function moveToSource(): string[] {
    const toRemove = targetSelected.value
    const newModel = modelValue.value.filter(key => !toRemove.has(key))
    targetSelected.value = new Set()
    return newModel
  }

  return {
    sourceSearch,
    targetSearch,
    sourceSelected,
    targetSelected,
    sourceItems,
    targetItems,
    filteredSourceItems,
    filteredTargetItems,
    toggleSourceItem,
    toggleTargetItem,
    moveToTarget,
    moveToSource,
  }
}
